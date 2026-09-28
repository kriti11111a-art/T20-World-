#!/usr/bin/env python3
"""
Script to fix missing Level Income and Direct Rewards for existing users.
This will retroactively calculate and distribute rewards that were missed.

RUN THIS ON PRODUCTION DATABASE TO FIX MISSING REWARDS!
"""

import asyncio
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(MONGO_URL)
db = client['trade_genius']

def get_eligible_levels(total_value: float) -> int:
    """
    Get number of eligible levels based on TOTAL VALUE (balance + invested)
    $50+ = 3 levels
    $100+ = 5 levels  
    $200+ = 10 levels
    """
    if total_value >= 200:
        return 10
    elif total_value >= 100:
        return 5
    elif total_value >= 50:
        return 3
    else:
        return 0

async def get_upline_chain(user_id: str, max_levels: int = 10) -> list:
    """Get upline chain up to max_levels using referred_by field"""
    uplines = []
    
    current_user = await db.users.find_one({"id": user_id})
    if not current_user:
        return uplines
    
    referred_by_code = current_user.get("referred_by")
    
    for level in range(1, max_levels + 1):
        if not referred_by_code:
            break
        
        referrer = await db.users.find_one({"referral_code": referred_by_code})
        if not referrer:
            break
        
        uplines.append((referrer, level))
        referred_by_code = referrer.get("referred_by")
    
    return uplines

async def fix_level_income_for_investment(user_id: str, investment_amount: float, investment_id: str, source_type: str):
    """Distribute level income for a specific investment"""
    if investment_amount <= 0:
        return 0
    
    uplines = await get_upline_chain(user_id, max_levels=10)
    
    fixed_count = 0
    for upline_user, level in uplines:
        # Check if this exact level income already exists
        existing = await db.level_income.find_one({
            "upline_id": upline_user["id"],
            "from_user_id": user_id,
            "level": level,
            "source_amount": investment_amount
        })
        
        if existing:
            continue  # Already distributed
        
        # Get upline's TOTAL VALUE (balance + total_invested)
        upline_balance = upline_user.get("balance", 0)
        upline_invested = upline_user.get("total_invested", 0)
        upline_total_value = upline_balance + upline_invested
        
        eligible_levels = get_eligible_levels(upline_total_value)
        
        if level > eligible_levels:
            print(f"    Level {level} skipped - {upline_user.get('email')} eligible for {eligible_levels} levels (total: ${upline_total_value:.2f})")
            continue
        
        # Calculate 1% commission
        commission_amount = investment_amount * 0.01
        
        if commission_amount <= 0:
            continue
        
        # Add commission to upline's balance
        await db.users.update_one(
            {"id": upline_user["id"]},
            {"$inc": {"balance": commission_amount, "referral_earnings": commission_amount}}
        )
        
        # Record the transaction
        await db.level_income.insert_one({
            "id": str(uuid.uuid4()),
            "upline_id": upline_user["id"],
            "from_user_id": user_id,
            "level": level,
            "amount": commission_amount,
            "commission_percent": 1.0,
            "source_amount": investment_amount,
            "transaction_type": f"retroactive_{source_type}",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        print(f"    ✅ Level {level}: ${commission_amount:.4f} -> {upline_user.get('email')}")
        fixed_count += 1
    
    return fixed_count

async def fix_direct_reward_for_user(user_id: str, first_deposit_amount: float):
    """Process missing direct reward for a user's first $50+ deposit"""
    if first_deposit_amount < 50:
        return False
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        return False
    
    # Check if already given
    if user.get("direct_reward_given", False):
        return False
    
    # Find referrer using referred_by
    referred_by_code = user.get("referred_by")
    if not referred_by_code:
        return False
    
    referrer = await db.users.find_one({"referral_code": referred_by_code})
    if not referrer:
        return False
    
    # Check referrer eligibility ($50+ total value)
    referrer_total = referrer.get("balance", 0) + referrer.get("total_invested", 0)
    if referrer_total < 50:
        print(f"    Direct reward skipped - referrer {referrer.get('email')} total ${referrer_total:.2f} < $50")
        return False
    
    # Calculate reward: $10 + 1% of deposit
    direct_reward = 10.0 + (first_deposit_amount * 0.01)
    
    # Add to referrer
    await db.users.update_one(
        {"id": referrer["id"]},
        {"$inc": {"balance": direct_reward, "referral_earnings": direct_reward, "direct_rewards_earned": direct_reward}}
    )
    
    # Mark as given
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"direct_reward_given": True}}
    )
    
    # Record transaction
    await db.direct_rewards.insert_one({
        "id": str(uuid.uuid4()),
        "referrer_id": referrer["id"],
        "new_user_id": user_id,
        "amount": direct_reward,
        "deposit_amount": first_deposit_amount,
        "reward_type": "retroactive_fix",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    print(f"    ✅ Direct Reward: ${direct_reward:.2f} -> {referrer.get('email')} (for {user.get('email')}'s ${first_deposit_amount} deposit)")
    return True

async def main():
    print("=" * 70)
    print("   FIXING MISSING LEVEL INCOME AND DIRECT REWARDS")
    print("   This script will retroactively distribute missing rewards")
    print("=" * 70)
    
    # Get all investments sorted by date
    investments = await db.investments.find({}).sort("created_at", 1).to_list(10000)
    print(f"\n📊 Found {len(investments)} total investments to process\n")
    
    total_level_fixed = 0
    total_direct_fixed = 0
    processed_users_first_deposit = set()  # Track users who got direct reward check
    
    for idx, inv in enumerate(investments):
        user_id = inv.get("user_id")
        amount = inv.get("amount", 0)
        inv_id = inv.get("id")
        source = inv.get("source", "unknown")
        
        user = await db.users.find_one({"id": user_id})
        if not user:
            continue
        
        print(f"\n[{idx+1}/{len(investments)}] Processing ${amount:.2f} investment by {user.get('email')} (source: {source})")
        
        # Fix Level Income for this investment
        fixed = await fix_level_income_for_investment(user_id, amount, inv_id, source)
        total_level_fixed += fixed
        
        # Fix Direct Reward (only once per user, for first $50+ deposit)
        if user_id not in processed_users_first_deposit and amount >= 50:
            if await fix_direct_reward_for_user(user_id, amount):
                total_direct_fixed += 1
            processed_users_first_deposit.add(user_id)
    
    # Also check deposits that may not have created investments
    print("\n" + "-" * 70)
    print("Checking deposits collection for any missed direct rewards...")
    deposits = await db.deposits.find({"amount": {"$gte": 50}}).sort("created_at", 1).to_list(10000)
    
    for dep in deposits:
        user_id = dep.get("user_id")
        amount = dep.get("amount", 0)
        
        if user_id in processed_users_first_deposit:
            continue
        
        user = await db.users.find_one({"id": user_id})
        if not user:
            continue
        
        if await fix_direct_reward_for_user(user_id, amount):
            total_direct_fixed += 1
        processed_users_first_deposit.add(user_id)
    
    print("\n" + "=" * 70)
    print("   ✅ COMPLETED!")
    print(f"   📈 Level Income transactions distributed: {total_level_fixed}")
    print(f"   🎁 Direct Rewards distributed: {total_direct_fixed}")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())
