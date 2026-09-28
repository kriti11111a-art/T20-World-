#!/usr/bin/env python3
"""
Daily ROI Distribution Script
Runs at 12:00 AM IST (Indian Standard Time) every day
Calculates and distributes daily ROI to all active investments
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import logging

# Load environment variables
load_dotenv('/app/backend/.env')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def distribute_daily_roi():
    """Distribute daily ROI to all active investments"""
    
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    try:
        logger.info("Starting daily ROI distribution...")
        
        # Get all active investments
        active_investments = await db.investments.find({"status": "active"}).to_list(1000)
        
        if not active_investments:
            logger.info("No active investments found")
            return
        
        logger.info(f"Found {len(active_investments)} active investments")
        
        for inv in active_investments:
            try:
                # Calculate daily ROI
                amount = inv["amount"]
                daily_roi_percent = inv["daily_roi"]
                daily_earning = amount * daily_roi_percent / 100
                
                days_completed = inv.get("days_completed", 0)
                total_days = inv.get("total_days", 20)
                
                # Check if investment has expired
                if days_completed >= total_days:
                    # Mark as completed
                    await db.investments.update_one(
                        {"id": inv["id"]},
                        {"$set": {"status": "completed"}}
                    )
                    logger.info(f"Investment {inv['id']} completed after {total_days} days")
                    continue
                
                # Add daily ROI to pending_roi
                current_pending = inv.get("pending_roi", 0)
                new_pending = current_pending + daily_earning
                
                # Update investment
                await db.investments.update_one(
                    {"id": inv["id"]},
                    {
                        "$set": {
                            "pending_roi": new_pending,
                        },
                        "$inc": {
                            "days_completed": 1
                        }
                    }
                )
                
                logger.info(f"Investment {inv['id']}: Added ${daily_earning:.4f} ROI. Day {days_completed + 1}/{total_days}")
                
            except Exception as e:
                logger.error(f"Error processing investment {inv.get('id')}: {e}")
                continue
        
        logger.info("Daily ROI distribution completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in daily ROI distribution: {e}")
    finally:
        client.close()

async def run_immediately():
    """Run ROI distribution immediately for testing"""
    await distribute_daily_roi()

if __name__ == "__main__":
    asyncio.run(run_immediately())
