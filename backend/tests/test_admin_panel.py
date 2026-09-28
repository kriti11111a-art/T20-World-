"""
Admin Panel API Tests
Tests for: /api/admin/stats, /api/admin/users, /api/admin/adjust-funds, 
/api/admin/reset-password, /api/admin/update-wallet, /api/admin/give-bonus, /api/admin/user/{user_id}
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@tradegenius.com"
ADMIN_PASSWORD = "Admin@123"

# Test user credentials
TEST_USER_ID = "8b7863b9-6142-443a-9ae5-c8cb48ffbec9"
TEST_USER_EMAIL = "faketeam12@test.com"
TEST_USER_ORIGINAL_PASSWORD = "NewPass123!"


class TestAdminLogin:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """Admin should be able to login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"✓ Admin login successful - token received")
    
    def test_admin_login_invalid_password(self):
        """Admin login should fail with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "WrongPassword123"
        })
        assert response.status_code == 401
        print(f"✓ Admin login correctly rejected with wrong password")


class TestAdminStats:
    """Test admin dashboard statistics endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_admin_stats(self):
        """Should return dashboard statistics"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify all required fields exist
        assert "totalUsers" in data
        assert "totalInvested" in data
        assert "totalEarnings" in data
        assert "totalDeposits" in data
        assert "pendingWithdrawals" in data
        assert "activeInvestments" in data
        
        # Verify data types
        assert isinstance(data["totalUsers"], int)
        assert isinstance(data["totalInvested"], (int, float))
        assert data["totalUsers"] > 0  # Should have at least admin user
        
        print(f"✓ Admin stats: {data['totalUsers']} users, ${data['totalInvested']} invested")


class TestAdminUsersList:
    """Test admin users list endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_all_users(self):
        """Should return list of all users"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify user object structure
        user = data[0]
        assert "id" in user
        assert "email" in user
        assert "balance" in user or user.get("balance") is None
        
        print(f"✓ Admin users list: {len(data)} users returned")
    
    def test_users_list_contains_test_user(self):
        """Test user should be in the users list"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=self.headers)
        data = response.json()
        
        test_user = next((u for u in data if u["email"] == TEST_USER_EMAIL), None)
        assert test_user is not None
        assert test_user["id"] == TEST_USER_ID
        
        print(f"✓ Test user found: {test_user['email']} with balance ${test_user.get('balance', 0)}")


class TestAdminUserDetails:
    """Test admin user details endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_user_details(self):
        """Should return detailed user information"""
        response = requests.get(f"{BASE_URL}/api/admin/user/{TEST_USER_ID}", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "user" in data
        assert "investments" in data
        assert "deposits" in data
        assert "withdrawals" in data
        assert "team_count" in data
        
        # Verify user data
        assert data["user"]["id"] == TEST_USER_ID
        assert data["user"]["email"] == TEST_USER_EMAIL
        
        print(f"✓ User details: {data['user']['email']}, team_count: {data['team_count']}")
    
    def test_get_nonexistent_user_details(self):
        """Should return 404 for non-existent user"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/admin/user/{fake_id}", headers=self.headers)
        assert response.status_code == 404
        print(f"✓ Correctly returned 404 for non-existent user")


class TestAdminAdjustFunds:
    """Test admin adjust funds endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_add_funds_to_user(self):
        """Should add funds to user balance"""
        # Get current balance
        response = requests.get(f"{BASE_URL}/api/admin/user/{TEST_USER_ID}", headers=self.headers)
        old_balance = response.json()["user"]["balance"]
        
        # Add funds
        add_amount = 10.0
        response = requests.post(f"{BASE_URL}/api/admin/adjust-funds", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "amount": add_amount,
            "action": "add",
            "reason": "Test add funds"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data["old_balance"] == old_balance
        assert data["new_balance"] == old_balance + add_amount
        
        print(f"✓ Added ${add_amount}: ${old_balance} -> ${data['new_balance']}")
    
    def test_deduct_funds_from_user(self):
        """Should deduct funds from user balance"""
        # Get current balance
        response = requests.get(f"{BASE_URL}/api/admin/user/{TEST_USER_ID}", headers=self.headers)
        old_balance = response.json()["user"]["balance"]
        
        # Deduct funds
        deduct_amount = 5.0
        response = requests.post(f"{BASE_URL}/api/admin/adjust-funds", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "amount": deduct_amount,
            "action": "deduct",
            "reason": "Test deduct funds"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data["old_balance"] == old_balance
        assert data["new_balance"] == old_balance - deduct_amount
        
        print(f"✓ Deducted ${deduct_amount}: ${old_balance} -> ${data['new_balance']}")
    
    def test_deduct_more_than_balance_fails(self):
        """Should fail when deducting more than available balance"""
        # Get current balance
        response = requests.get(f"{BASE_URL}/api/admin/user/{TEST_USER_ID}", headers=self.headers)
        current_balance = response.json()["user"]["balance"]
        
        # Try to deduct more than balance
        response = requests.post(f"{BASE_URL}/api/admin/adjust-funds", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "amount": current_balance + 1000,
            "action": "deduct",
            "reason": "Test overdraft"
        })
        assert response.status_code == 400
        assert "Insufficient balance" in response.json().get("detail", "")
        
        print(f"✓ Correctly rejected overdraft attempt")
    
    def test_invalid_action_fails(self):
        """Should fail with invalid action"""
        response = requests.post(f"{BASE_URL}/api/admin/adjust-funds", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "amount": 10.0,
            "action": "invalid_action",
            "reason": "Test"
        })
        assert response.status_code == 400
        print(f"✓ Correctly rejected invalid action")


class TestAdminResetPassword:
    """Test admin reset password endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_reset_password_success(self):
        """Should reset user password"""
        new_password = "ResetTest123!"
        
        response = requests.post(f"{BASE_URL}/api/admin/reset-password", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "new_password": new_password
        })
        assert response.status_code == 200
        assert "Password reset successfully" in response.json().get("message", "")
        
        print(f"✓ Password reset successful")
        
        # Verify new password works
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": new_password
        })
        assert login_response.status_code == 200
        print(f"✓ Login with new password successful")
        
        # Reset back to original password
        requests.post(f"{BASE_URL}/api/admin/reset-password", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "new_password": TEST_USER_ORIGINAL_PASSWORD
        })
        print(f"✓ Password restored to original")
    
    def test_reset_password_nonexistent_user(self):
        """Should fail for non-existent user"""
        fake_id = str(uuid.uuid4())
        response = requests.post(f"{BASE_URL}/api/admin/reset-password", headers=self.headers, json={
            "user_id": fake_id,
            "new_password": "NewPass123!"
        })
        assert response.status_code == 404
        print(f"✓ Correctly returned 404 for non-existent user")


class TestAdminUpdateWallet:
    """Test admin update wallet endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_update_wallet_success(self):
        """Should update user wallet address"""
        # Get current wallet
        response = requests.get(f"{BASE_URL}/api/admin/user/{TEST_USER_ID}", headers=self.headers)
        old_wallet = response.json()["user"].get("locked_wallet_address", "")
        
        new_wallet = "0xNEWWALLET1234567890abcdef1234567890ABCDEF"
        
        response = requests.post(f"{BASE_URL}/api/admin/update-wallet", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "wallet_address": new_wallet
        })
        assert response.status_code == 200
        assert "Wallet address updated" in response.json().get("message", "")
        
        # Verify wallet was updated
        response = requests.get(f"{BASE_URL}/api/admin/user/{TEST_USER_ID}", headers=self.headers)
        updated_wallet = response.json()["user"].get("locked_wallet_address", "")
        assert updated_wallet == new_wallet
        
        print(f"✓ Wallet updated: {old_wallet[:20]}... -> {new_wallet[:20]}...")
        
        # Restore original wallet
        requests.post(f"{BASE_URL}/api/admin/update-wallet", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "wallet_address": "0xABCDEF1234567890abcdef1234567890ABCDEF12"
        })
        print(f"✓ Wallet restored to original")
    
    def test_update_wallet_nonexistent_user(self):
        """Should fail for non-existent user"""
        fake_id = str(uuid.uuid4())
        response = requests.post(f"{BASE_URL}/api/admin/update-wallet", headers=self.headers, json={
            "user_id": fake_id,
            "wallet_address": "0x1234567890abcdef1234567890abcdef12345678"
        })
        assert response.status_code == 404
        print(f"✓ Correctly returned 404 for non-existent user")


class TestAdminGiveBonus:
    """Test admin give bonus endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_give_bonus_success(self):
        """Should give bonus to user"""
        # Get current balance
        response = requests.get(f"{BASE_URL}/api/admin/user/{TEST_USER_ID}", headers=self.headers)
        old_balance = response.json()["user"]["balance"]
        
        bonus_amount = 25.0
        response = requests.post(f"{BASE_URL}/api/admin/give-bonus", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "amount": bonus_amount,
            "action": "add",
            "reason": "Test bonus"
        })
        assert response.status_code == 200
        assert f"Bonus of ${bonus_amount}" in response.json().get("message", "")
        
        # Verify balance increased
        response = requests.get(f"{BASE_URL}/api/admin/user/{TEST_USER_ID}", headers=self.headers)
        new_balance = response.json()["user"]["balance"]
        assert new_balance == old_balance + bonus_amount
        
        print(f"✓ Bonus given: ${bonus_amount}, balance: ${old_balance} -> ${new_balance}")
        
        # Deduct bonus to restore balance
        requests.post(f"{BASE_URL}/api/admin/adjust-funds", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "amount": bonus_amount,
            "action": "deduct",
            "reason": "Restore after test"
        })
        print(f"✓ Balance restored")
    
    def test_give_bonus_nonexistent_user(self):
        """Should fail for non-existent user"""
        fake_id = str(uuid.uuid4())
        response = requests.post(f"{BASE_URL}/api/admin/give-bonus", headers=self.headers, json={
            "user_id": fake_id,
            "amount": 10.0,
            "action": "add",
            "reason": "Test"
        })
        assert response.status_code == 404
        print(f"✓ Correctly returned 404 for non-existent user")


class TestAdminDepositsWithdrawalsInvestments:
    """Test admin deposits, withdrawals, investments list endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_admin_deposits(self):
        """Should return list of all deposits"""
        response = requests.get(f"{BASE_URL}/api/admin/deposits", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin deposits: {len(data)} deposits returned")
    
    def test_get_admin_withdrawals(self):
        """Should return list of all withdrawals"""
        response = requests.get(f"{BASE_URL}/api/admin/withdrawals", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin withdrawals: {len(data)} withdrawals returned")
    
    def test_get_admin_investments(self):
        """Should return list of all investments"""
        response = requests.get(f"{BASE_URL}/api/admin/investments", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin investments: {len(data)} investments returned")


class TestAdminCreateInvestment:
    """Test admin create investment endpoint - POST /api/admin/create-investment"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def test_create_investment_success(self):
        """Admin should be able to create investment for user without deducting balance"""
        # Get user's current balance and total_invested
        response = requests.get(f"{BASE_URL}/api/admin/user/{TEST_USER_ID}", headers=self.headers)
        old_balance = response.json()["user"]["balance"]
        old_total_invested = response.json()["user"]["total_invested"]
        
        # Create investment
        investment_amount = 10.0
        response = requests.post(f"{BASE_URL}/api/admin/create-investment", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "plan_id": 1,  # Trading SLAB 1
            "amount": investment_amount
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "message" in data
        assert "investment_id" in data
        assert "plan_name" in data
        assert "daily_roi" in data
        assert data["plan_name"] == "Trading SLAB 1"
        assert data["daily_roi"] == 5.5
        
        print(f"✓ Investment created: {data['investment_id']}")
        
        # Verify user's balance was NOT deducted
        response = requests.get(f"{BASE_URL}/api/admin/user/{TEST_USER_ID}", headers=self.headers)
        new_balance = response.json()["user"]["balance"]
        new_total_invested = response.json()["user"]["total_invested"]
        
        assert new_balance == old_balance, f"Balance should not change: {old_balance} -> {new_balance}"
        assert new_total_invested == old_total_invested + investment_amount, f"Total invested should increase by {investment_amount}"
        
        print(f"✓ Balance unchanged: ${old_balance}")
        print(f"✓ Total invested increased: ${old_total_invested} -> ${new_total_invested}")
    
    def test_create_investment_invalid_plan(self):
        """Should fail with invalid plan ID"""
        response = requests.post(f"{BASE_URL}/api/admin/create-investment", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "plan_id": 99,  # Invalid plan
            "amount": 10.0
        })
        assert response.status_code == 400
        assert "Invalid plan" in response.json().get("detail", "")
        print(f"✓ Correctly rejected invalid plan ID")
    
    def test_create_investment_amount_below_minimum(self):
        """Should fail when amount is below plan minimum"""
        response = requests.post(f"{BASE_URL}/api/admin/create-investment", headers=self.headers, json={
            "user_id": TEST_USER_ID,
            "plan_id": 2,  # Trading SLAB 2 - min $20
            "amount": 5.0  # Below minimum
        })
        assert response.status_code == 400
        assert "Amount must be between" in response.json().get("detail", "")
        print(f"✓ Correctly rejected amount below minimum")
    
    def test_create_investment_nonexistent_user(self):
        """Should fail for non-existent user"""
        fake_id = str(uuid.uuid4())
        response = requests.post(f"{BASE_URL}/api/admin/create-investment", headers=self.headers, json={
            "user_id": fake_id,
            "plan_id": 1,
            "amount": 10.0
        })
        assert response.status_code == 404
        assert "User not found" in response.json().get("detail", "")
        print(f"✓ Correctly returned 404 for non-existent user")
    
    def test_create_investment_non_admin_forbidden(self):
        """Non-admin user should not be able to create investment"""
        # Login as regular user
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_ORIGINAL_PASSWORD
        })
        user_token = response.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}", "Content-Type": "application/json"}
        
        # Try to create investment as non-admin
        response = requests.post(f"{BASE_URL}/api/admin/create-investment", headers=user_headers, json={
            "user_id": TEST_USER_ID,
            "plan_id": 1,
            "amount": 10.0
        })
        assert response.status_code == 403
        assert "Admin access required" in response.json().get("detail", "")
        print(f"✓ Correctly rejected non-admin user")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
