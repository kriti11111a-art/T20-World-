"""
Test Income History - Verify no future dates in Daily ROI endpoint
Critical P0 fix verification - dates should NOT be in the future
"""
import pytest
import requests
import os
from datetime import datetime, timezone

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER = {"email": "testinvest@bindas.com", "password": "Test1234!"}
ADMIN_USER = {"email": "admin@tradego.com", "password": "Admin@123"}


class TestAuthentication:
    """Test login and session management"""
    
    def test_regular_user_login(self):
        """Test regular user can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER["email"]
        print(f"✅ Regular user login successful: {TEST_USER['email']}")
    
    def test_admin_user_login(self):
        """Test admin user can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["is_admin"] == True or data["user"]["email"] == "admin@tradego.com"
        print(f"✅ Admin user login successful: {ADMIN_USER['email']}")
    
    def test_session_persistence_with_me_endpoint(self):
        """Test that token works for /auth/me endpoint (session persistence)"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Call /auth/me multiple times to verify session persistence
        for i in range(3):
            me_response = requests.get(
                f"{BASE_URL}/api/auth/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert me_response.status_code == 200, f"Session check {i+1} failed: {me_response.text}"
            user_data = me_response.json()
            assert user_data["email"] == TEST_USER["email"]
        
        print("✅ Session persistence verified - /auth/me works consistently")


class TestDailyROINoFutureDates:
    """Critical P0 test - Verify no future dates in Daily ROI endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_daily_roi_endpoint_returns_data(self, auth_token):
        """Test that daily ROI endpoint returns data"""
        response = requests.get(
            f"{BASE_URL}/api/income/daily-roi",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Daily ROI endpoint failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Daily ROI endpoint returned {len(data)} entries")
    
    def test_no_future_dates_in_daily_roi(self, auth_token):
        """CRITICAL: Verify no future dates in Daily ROI response"""
        response = requests.get(
            f"{BASE_URL}/api/income/daily-roi",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        now = datetime.now(timezone.utc)
        future_dates = []
        
        for entry in data:
            created_at = entry.get('created_at', '')
            if created_at:
                try:
                    # Parse ISO format date
                    entry_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    if entry_date > now:
                        future_dates.append({
                            'id': entry.get('id'),
                            'date': created_at,
                            'plan_name': entry.get('plan_name'),
                            'day_number': entry.get('day_number')
                        })
                except Exception as e:
                    print(f"Warning: Could not parse date {created_at}: {e}")
        
        assert len(future_dates) == 0, f"CRITICAL: Found {len(future_dates)} future dates: {future_dates[:5]}"
        print(f"✅ NO FUTURE DATES FOUND - P0 fix verified! ({len(data)} entries checked)")
    
    def test_daily_roi_entry_structure(self, auth_token):
        """Verify Daily ROI entries have correct structure"""
        response = requests.get(
            f"{BASE_URL}/api/income/daily-roi",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            entry = data[0]
            required_fields = ['id', 'investment_id', 'amount', 'plan_name', 'day_number', 'total_days', 'created_at', 'type']
            for field in required_fields:
                assert field in entry, f"Missing field: {field}"
            assert entry['type'] == 'daily_roi'
            print(f"✅ Daily ROI entry structure verified with all required fields")
        else:
            print("⚠️ No Daily ROI entries to verify structure")


class TestInvestmentsEndpoint:
    """Test investments endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_get_investments(self, auth_token):
        """Test getting user investments"""
        response = requests.get(
            f"{BASE_URL}/api/investments",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Get investments failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Investments endpoint returned {len(data)} investments")
        
        # Verify investment structure if any exist
        if len(data) > 0:
            inv = data[0]
            assert 'id' in inv
            assert 'amount' in inv
            assert 'status' in inv
            assert 'plan_name' in inv
            print(f"✅ Investment structure verified: {inv['plan_name']} - ${inv['amount']}")


class TestWithdrawROINoLogout:
    """Test that withdrawing ROI does NOT cause logout"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_withdraw_roi_maintains_session(self, auth_token):
        """Test that withdraw ROI endpoint doesn't invalidate session"""
        # First get investments
        inv_response = requests.get(
            f"{BASE_URL}/api/investments",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert inv_response.status_code == 200
        investments = inv_response.json()
        
        # Find an active investment with pending ROI
        active_inv = None
        for inv in investments:
            if inv.get('status') == 'active' and inv.get('pending_roi', 0) > 0:
                active_inv = inv
                break
        
        if active_inv:
            # Try to withdraw ROI
            withdraw_response = requests.post(
                f"{BASE_URL}/api/investments/{active_inv['id']}/withdraw-roi",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            # Should be 200 (success) or 400 (no pending ROI) - NOT 401 (logout)
            assert withdraw_response.status_code != 401, "Session was invalidated after withdraw!"
            
            # Verify session still works
            me_response = requests.get(
                f"{BASE_URL}/api/auth/me",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            assert me_response.status_code == 200, "Session lost after withdraw ROI!"
            print(f"✅ Session maintained after withdraw ROI operation")
        else:
            # No active investment with pending ROI, just verify session works
            me_response = requests.get(
                f"{BASE_URL}/api/auth/me",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            assert me_response.status_code == 200
            print("⚠️ No active investment with pending ROI to test, but session is valid")


class TestAdminPanelAccess:
    """Test admin panel API access"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_admin_stats_endpoint(self, admin_token):
        """Test admin stats endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Admin stats failed: {response.text}"
        data = response.json()
        assert 'totalUsers' in data
        assert 'totalInvested' in data
        print(f"✅ Admin stats: {data['totalUsers']} users, ${data['totalInvested']} invested")
    
    def test_admin_users_endpoint(self, admin_token):
        """Test admin users list endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Admin users failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Admin users endpoint returned {len(data)} users")


class TestIncomeHistoryEndpoints:
    """Test all income history related endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
        assert response.status_code == 200
        return response.json()["access_token"]
    
    def test_referral_stats(self, auth_token):
        """Test referral stats endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/referrals/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert 'total_team' in data
        print(f"✅ Referral stats: {data['total_team']} team members")
    
    def test_salary_rank_info(self, auth_token):
        """Test salary rank info endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/salary/rank-info",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert 'current_rank' in data
        assert 'all_ranks' in data
        print(f"✅ Salary rank info: Current rank {data['current_rank']}")
    
    def test_income_compounding(self, auth_token):
        """Test compounding history endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/income/compounding",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Compounding history: {len(data)} entries")
    
    def test_income_salary(self, auth_token):
        """Test salary income endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/income/salary",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Salary income: {len(data)} entries")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
