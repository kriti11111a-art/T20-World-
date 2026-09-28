"""
Test Investment Features - Compound and Withdraw ROI
Tests for Bindas BNB investment platform deposit/withdraw functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://crypto-invest-46.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "testinvest@bindas.com"
TEST_PASSWORD = "Test1234!"
TEST_INVESTMENT_ID = "test-inv-1769272580743"


class TestAuthentication:
    """Authentication tests"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        assert "balance" in data["user"]
        assert "total_invested" in data["user"]
        assert "total_earned" in data["user"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpass"}
        )
        assert response.status_code == 401


class TestInvestments:
    """Investment API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_investments(self, auth_token):
        """Test fetching user investments"""
        response = requests.get(
            f"{BASE_URL}/api/investments",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify investment structure
        if len(data) > 0:
            inv = data[0]
            assert "id" in inv
            assert "plan_name" in inv
            assert "amount" in inv
            assert "daily_roi" in inv
            assert "days_completed" in inv
            assert "total_days" in inv
            assert "earned_so_far" in inv
            assert "pending_roi" in inv
            assert "status" in inv
    
    def test_get_investments_unauthorized(self):
        """Test fetching investments without auth"""
        response = requests.get(f"{BASE_URL}/api/investments")
        assert response.status_code in [401, 403]


class TestCompoundROI:
    """Compound ROI API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_compound_endpoint_exists(self, auth_token):
        """Test compound endpoint is accessible"""
        response = requests.post(
            f"{BASE_URL}/api/investments/{TEST_INVESTMENT_ID}/compound",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        # Should return 200 (success) or 400 (no pending ROI) - not 404
        assert response.status_code in [200, 400]
    
    def test_compound_unauthorized(self):
        """Test compound without auth"""
        response = requests.post(
            f"{BASE_URL}/api/investments/{TEST_INVESTMENT_ID}/compound"
        )
        assert response.status_code in [401, 403]
    
    def test_compound_invalid_investment(self, auth_token):
        """Test compound with invalid investment ID"""
        response = requests.post(
            f"{BASE_URL}/api/investments/invalid-id-12345/compound",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404


class TestWithdrawROI:
    """Withdraw ROI to Balance API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_withdraw_roi_endpoint_exists(self, auth_token):
        """Test withdraw-roi endpoint is accessible"""
        response = requests.post(
            f"{BASE_URL}/api/investments/{TEST_INVESTMENT_ID}/withdraw-roi",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        # Should return 200 (success) or 400 (no pending ROI) - not 404
        assert response.status_code in [200, 400]
    
    def test_withdraw_roi_unauthorized(self):
        """Test withdraw-roi without auth"""
        response = requests.post(
            f"{BASE_URL}/api/investments/{TEST_INVESTMENT_ID}/withdraw-roi"
        )
        assert response.status_code in [401, 403]
    
    def test_withdraw_roi_invalid_investment(self, auth_token):
        """Test withdraw-roi with invalid investment ID"""
        response = requests.post(
            f"{BASE_URL}/api/investments/invalid-id-12345/withdraw-roi",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404


class TestUserBalance:
    """User balance and profile tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_user_profile(self, auth_token):
        """Test fetching user profile with balance"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert "balance" in data
        assert "total_invested" in data
        assert "total_earned" in data
        assert isinstance(data["balance"], (int, float))
        assert isinstance(data["total_invested"], (int, float))
        assert isinstance(data["total_earned"], (int, float))


class TestDeposits:
    """Deposit API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_deposits(self, auth_token):
        """Test fetching user deposits"""
        response = requests.get(
            f"{BASE_URL}/api/deposits",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify deposit structure if any exist
        if len(data) > 0:
            dep = data[0]
            assert "id" in dep
            assert "amount" in dep
            assert "status" in dep
            assert "created_at" in dep


class TestHealthCheck:
    """Health check tests"""
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data or "message" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
