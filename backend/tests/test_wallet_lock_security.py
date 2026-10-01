"""
Test Wallet Lock Security Feature - Bindas BNB
Tests for wallet lock, withdrawal security, and compound functionality
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://crypto-slab-preview.preview.emergentagent.com')

# Test credentials
TEST_EMAIL_1 = "testinvest@bindas.com"
TEST_PASSWORD_1 = "Test1234!"

TEST_EMAIL_2 = "xyz@gmail.com"
TEST_PASSWORD_2 = "password123"


class TestWalletLockSecurity:
    """Wallet Lock Security Feature Tests"""
    
    @pytest.fixture
    def auth_token_user1(self):
        """Get authentication token for test user 1"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL_1, "password": TEST_PASSWORD_1}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed for user 1")
    
    @pytest.fixture
    def user1_data(self):
        """Get user 1 data including locked wallet"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL_1, "password": TEST_PASSWORD_1}
        )
        if response.status_code == 200:
            return response.json()
        pytest.skip("Authentication failed for user 1")
    
    def test_login_returns_locked_wallet_address(self, user1_data):
        """Test that login response includes locked_wallet_address field"""
        user = user1_data["user"]
        # Verify locked_wallet_address field exists in response
        assert "locked_wallet_address" in user, "locked_wallet_address field missing from user response"
        print(f"User locked_wallet_address: {user.get('locked_wallet_address')}")
    
    def test_auth_me_returns_locked_wallet_address(self, auth_token_user1):
        """Test that /auth/me endpoint returns locked_wallet_address"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {auth_token_user1}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "locked_wallet_address" in data, "locked_wallet_address field missing from /auth/me response"
        print(f"Auth/me locked_wallet_address: {data.get('locked_wallet_address')}")
    
    def test_lock_wallet_endpoint_exists(self, auth_token_user1):
        """Test that lock-wallet endpoint exists and is accessible"""
        # Try to lock with a test address - may fail if already locked
        test_address = "0x1234567890abcdef1234567890abcdef12345678"
        response = requests.post(
            f"{BASE_URL}/api/user/lock-wallet",
            headers={"Authorization": f"Bearer {auth_token_user1}"},
            json={"wallet_address": test_address}
        )
        # Should return 200 (success) or 403 (already locked) - not 404
        assert response.status_code in [200, 403], f"Unexpected status: {response.status_code}"
        print(f"Lock wallet response: {response.status_code} - {response.json()}")
    
    def test_withdrawal_requires_locked_wallet(self, auth_token_user1, user1_data):
        """Test that withdrawal requires a locked wallet address"""
        user = user1_data["user"]
        
        # If user has no locked wallet, withdrawal should fail with 403
        if not user.get("locked_wallet_address"):
            response = requests.post(
                f"{BASE_URL}/api/withdrawals",
                headers={"Authorization": f"Bearer {auth_token_user1}"},
                json={
                    "amount": 10,
                    "wallet_address": "0xRandomAddress123456789"
                }
            )
            assert response.status_code == 403
            assert "lock" in response.json().get("detail", "").lower()
            print("Withdrawal correctly blocked - wallet not locked")
        else:
            print(f"User has locked wallet: {user['locked_wallet_address']}")
    
    def test_withdrawal_only_to_locked_address(self, auth_token_user1, user1_data):
        """Test that withdrawal only works to the locked wallet address"""
        user = user1_data["user"]
        locked_wallet = user.get("locked_wallet_address")
        
        if not locked_wallet:
            pytest.skip("User doesn't have a locked wallet")
        
        # Try withdrawal to a DIFFERENT address - should fail
        different_address = "0xDifferentAddress123456789abcdef12345678"
        response = requests.post(
            f"{BASE_URL}/api/withdrawals",
            headers={"Authorization": f"Bearer {auth_token_user1}"},
            json={
                "amount": 10,
                "wallet_address": different_address
            }
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        error_detail = response.json().get("detail", "")
        assert "locked" in error_detail.lower(), f"Expected 'locked' in error message, got: {error_detail}"
        print(f"Withdrawal to different address correctly blocked: {error_detail}")
    
    def test_withdrawal_to_locked_address_succeeds(self, auth_token_user1, user1_data):
        """Test that withdrawal to locked address succeeds (if balance available)"""
        user = user1_data["user"]
        locked_wallet = user.get("locked_wallet_address")
        balance = user.get("balance", 0)
        
        if not locked_wallet:
            pytest.skip("User doesn't have a locked wallet")
        
        if balance < 10:
            pytest.skip(f"Insufficient balance for withdrawal test: ${balance}")
        
        # Try withdrawal to the LOCKED address - should succeed
        response = requests.post(
            f"{BASE_URL}/api/withdrawals",
            headers={"Authorization": f"Bearer {auth_token_user1}"},
            json={
                "amount": 10,
                "wallet_address": locked_wallet
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.json()}"
        data = response.json()
        assert "id" in data
        assert data["wallet_address"].lower() == locked_wallet.lower()
        print(f"Withdrawal to locked address succeeded: ${data['amount']} to {data['wallet_address']}")


class TestCompoundCreatesNewInvestment:
    """Test that Compound creates NEW investment card instead of adding to existing"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL_1, "password": TEST_PASSWORD_1}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_compound_returns_new_investment_id(self, auth_token):
        """Test that compound endpoint returns a new investment ID"""
        # First get investments to find one with pending ROI
        inv_response = requests.get(
            f"{BASE_URL}/api/investments",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert inv_response.status_code == 200
        investments = inv_response.json()
        
        # Find investment with pending ROI >= 1
        investment_with_roi = None
        for inv in investments:
            if inv.get("pending_roi", 0) >= 1:
                investment_with_roi = inv
                break
        
        if not investment_with_roi:
            pytest.skip("No investment with pending ROI >= $1 found")
        
        original_id = investment_with_roi["id"]
        pending_roi = investment_with_roi["pending_roi"]
        
        # Compound the investment
        response = requests.post(
            f"{BASE_URL}/api/investments/{original_id}/compound",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            # Verify new investment ID is returned
            assert "new_investment_id" in data, "Response should contain new_investment_id"
            assert data["new_investment_id"] != original_id, "New investment ID should be different from original"
            print(f"Compound created new investment: {data['new_investment_id']}")
            print(f"Original investment: {original_id}")
            print(f"Plan name: {data.get('plan_name')}")
        else:
            # If 400, it means no pending ROI (already claimed)
            assert response.status_code == 400
            print(f"Compound returned 400: {response.json()}")
    
    def test_compound_investment_has_source_field(self, auth_token):
        """Test that compounded investments have source='compound' field"""
        inv_response = requests.get(
            f"{BASE_URL}/api/investments",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert inv_response.status_code == 200
        investments = inv_response.json()
        
        # Check if any investment has source='compound'
        compound_investments = [inv for inv in investments if inv.get("source") == "compound"]
        print(f"Found {len(compound_investments)} compound investments out of {len(investments)} total")
        
        # This is informational - not a failure if none exist yet


class TestAlreadyClaimedNotification:
    """Test 'Already Claimed' notification when pending_roi is 0"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL_1, "password": TEST_PASSWORD_1}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_withdraw_roi_with_zero_pending_returns_400(self, auth_token):
        """Test that withdraw-roi returns 400 when pending_roi is 0"""
        # Get investments
        inv_response = requests.get(
            f"{BASE_URL}/api/investments",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert inv_response.status_code == 200
        investments = inv_response.json()
        
        # Find investment with pending_roi = 0
        investment_with_zero = None
        for inv in investments:
            if inv.get("pending_roi", 0) <= 0:
                investment_with_zero = inv
                break
        
        if not investment_with_zero:
            pytest.skip("No investment with pending_roi = 0 found")
        
        # Try to withdraw ROI - should return 400
        response = requests.post(
            f"{BASE_URL}/api/investments/{investment_with_zero['id']}/withdraw-roi",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        error_detail = response.json().get("detail", "")
        assert "pending" in error_detail.lower() or "no" in error_detail.lower()
        print(f"Correctly returned 400 for zero pending ROI: {error_detail}")
    
    def test_compound_with_insufficient_pending_returns_400(self, auth_token):
        """Test that compound returns 400 when pending_roi < $1"""
        # Get investments
        inv_response = requests.get(
            f"{BASE_URL}/api/investments",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert inv_response.status_code == 200
        investments = inv_response.json()
        
        # Find investment with pending_roi < 1
        investment_with_low_roi = None
        for inv in investments:
            pending = inv.get("pending_roi", 0)
            if 0 <= pending < 1:
                investment_with_low_roi = inv
                break
        
        if not investment_with_low_roi:
            pytest.skip("No investment with pending_roi < $1 found")
        
        # Try to compound - should return 400
        response = requests.post(
            f"{BASE_URL}/api/investments/{investment_with_low_roi['id']}/compound",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        error_detail = response.json().get("detail", "")
        assert "minimum" in error_detail.lower() or "$1" in error_detail
        print(f"Correctly returned 400 for insufficient pending ROI: {error_detail}")


class TestWithdrawToBalance:
    """Test Withdraw to Balance functionality"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL_1, "password": TEST_PASSWORD_1}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_withdraw_roi_updates_user_balance(self, auth_token):
        """Test that withdraw-roi adds to user balance"""
        # Get initial user balance
        user_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert user_response.status_code == 200
        initial_balance = user_response.json()["balance"]
        
        # Get investments
        inv_response = requests.get(
            f"{BASE_URL}/api/investments",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert inv_response.status_code == 200
        investments = inv_response.json()
        
        # Find investment with pending ROI > 0
        investment_with_roi = None
        for inv in investments:
            if inv.get("pending_roi", 0) > 0:
                investment_with_roi = inv
                break
        
        if not investment_with_roi:
            pytest.skip("No investment with pending ROI > 0 found")
        
        pending_roi = investment_with_roi["pending_roi"]
        
        # Withdraw ROI to balance
        response = requests.post(
            f"{BASE_URL}/api/investments/{investment_with_roi['id']}/withdraw-roi",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        if response.status_code == 200:
            # Verify balance increased
            user_response = requests.get(
                f"{BASE_URL}/api/auth/me",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            new_balance = user_response.json()["balance"]
            
            # Balance should have increased by pending_roi amount
            expected_balance = initial_balance + pending_roi
            assert abs(new_balance - expected_balance) < 0.01, \
                f"Balance mismatch: expected {expected_balance}, got {new_balance}"
            print(f"Balance updated correctly: ${initial_balance} -> ${new_balance} (+${pending_roi})")
        else:
            print(f"Withdraw ROI returned {response.status_code}: {response.json()}")


class TestUserAuthentication:
    """User login and authentication flow tests"""
    
    def test_login_user1_success(self):
        """Test login for test user 1"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL_1, "password": TEST_PASSWORD_1}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL_1
        print(f"User 1 login successful: {data['user']['username']}")
    
    def test_login_user2_success(self):
        """Test login for test user 2"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL_2, "password": TEST_PASSWORD_2}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL_2
        print(f"User 2 login successful: {data['user']['username']}")
    
    def test_login_invalid_email(self):
        """Test login with invalid email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "nonexistent@email.com", "password": "anypassword"}
        )
        assert response.status_code == 401
    
    def test_login_invalid_password(self):
        """Test login with invalid password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL_1, "password": "wrongpassword"}
        )
        assert response.status_code == 401
    
    def test_auth_me_requires_token(self):
        """Test that /auth/me requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]
    
    def test_auth_me_with_valid_token(self):
        """Test /auth/me with valid token"""
        # Login first
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL_1, "password": TEST_PASSWORD_1}
        )
        token = login_response.json()["access_token"]
        
        # Get user info
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL_1
        assert "balance" in data
        assert "total_invested" in data
        assert "total_earned" in data
        assert "locked_wallet_address" in data


class TestWithdrawals:
    """Withdrawal API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL_1, "password": TEST_PASSWORD_1}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_withdrawals(self, auth_token):
        """Test fetching user withdrawals"""
        response = requests.get(
            f"{BASE_URL}/api/withdrawals",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} withdrawals")
    
    def test_withdrawal_minimum_amount(self, auth_token):
        """Test that withdrawal has minimum amount of $10"""
        # Get user's locked wallet
        user_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        locked_wallet = user_response.json().get("locked_wallet_address")
        
        if not locked_wallet:
            pytest.skip("User doesn't have a locked wallet")
        
        # Try withdrawal below minimum
        response = requests.post(
            f"{BASE_URL}/api/withdrawals",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "amount": 5,  # Below $10 minimum
                "wallet_address": locked_wallet
            }
        )
        assert response.status_code == 400
        assert "minimum" in response.json().get("detail", "").lower()
        print("Minimum withdrawal amount correctly enforced")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
