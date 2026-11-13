#!/usr/bin/env python3
"""
Script to disable auto_withdrawal for ALL existing users.
Run this on VPS: python3 disable_auto_withdrawal_all.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def disable_all_auto_withdrawals():
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME", "tradego")
    
    if not mongo_url:
        print("ERROR: MONGO_URL not found in environment")
        return
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Count before
    total = await db.users.count_documents({})
    enabled_before = await db.users.count_documents({"auto_withdrawal_enabled": True})
    
    print(f"Total users: {total}")
    print(f"Auto withdrawal enabled (before): {enabled_before}")
    
    # Update all users to have auto_withdrawal_enabled = False
    result = await db.users.update_many(
        {},
        {"$set": {"auto_withdrawal_enabled": False}}
    )
    
    print(f"\nUpdated {result.modified_count} users - auto_withdrawal_enabled = False")
    
    # Verify
    disabled_after = await db.users.count_documents({"auto_withdrawal_enabled": False})
    print(f"Auto withdrawal OFF (after): {disabled_after}")
    print("\n✅ Done! All users now have Auto Withdrawal OFF")

if __name__ == "__main__":
    asyncio.run(disable_all_auto_withdrawals())
