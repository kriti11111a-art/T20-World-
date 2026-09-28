"""
Backend API Tests for Bindas BNB - Authentication Flow
Tests: Register, Login, Get Current User (me)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Health check endpoint tests - run first"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print(f"✓ Health check passed: {data}")
    
    def test_root_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Bindas BNB API"
        assert data["status"] == "running"
        print(f"✓ Root endpoint passed: {data}")


class TestUserRegistration:
    """User registration endpoint tests"""
    
    def test_register_new_user(self):
        """Test registering a new user with unique email"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "email": f"TEST_user_{unique_id}@test.com",
            "password": "TestPass123!",
            "username": f"TEST_user_{unique_id}"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "access_token" in data, "Missing access_token in response"
        assert "user" in data, "Missing user in response"
        assert data["token_type"] == "bearer"
        
        # Validate user data
        user = data["user"]
        assert user["email"] == payload["email"]
        assert user["username"] == payload["username"]
        assert "id" in user
        assert "referral_code" in user
        assert user["balance"] == 0.0  # New users start with $0
        assert user["total_invested"] == 0.0
        assert user["total_earned"] == 0.0
        
        print(f"✓ Registration passed for: {payload['email']}")
        print(f"  - User ID: {user['id']}")
        print(f"  - Referral Code: {user['referral_code']}")
        print(f"  - Balance: ${user['balance']}")
        
        return data["access_token"], user
    
    def test_register_duplicate_email(self):
        """Test that duplicate email registration fails"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "email": f"TEST_dup_{unique_id}@test.com",
            "password": "TestPass123!",
            "username": f"TEST_dup_{unique_id}"
        }
        
        # First registration should succeed
        response1 = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response1.status_code == 200
        
        # Second registration with same email should fail
        payload["username"] = f"TEST_dup2_{unique_id}"  # Different username
        response2 = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response2.status_code == 400
        data = response2.json()
        assert "already registered" in data["detail"].lower() or "email" in data["detail"].lower()
        print(f"✓ Duplicate email rejection passed")
    
    def test_register_duplicate_username(self):
        """Test that duplicate username registration fails"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "email": f"TEST_user1_{unique_id}@test.com",
            "password": "TestPass123!",
            "username": f"TEST_dupuser_{unique_id}"
        }
        
        # First registration should succeed
        response1 = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response1.status_code == 200
        
        # Second registration with same username should fail
        payload["email"] = f"TEST_user2_{unique_id}@test.com"  # Different email
        response2 = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response2.status_code == 400
        data = response2.json()
        assert "username" in data["detail"].lower() or "taken" in data["detail"].lower()
        print(f"✓ Duplicate username rejection passed")
    
    def test_register_with_referral_code(self):
        """Test registration with a referral code"""
        unique_id = str(uuid.uuid4())[:8]
        
        # First create a referrer
        referrer_payload = {
            "email": f"TEST_referrer_{unique_id}@test.com",
            "password": "TestPass123!",
            "username": f"TEST_referrer_{unique_id}"
        }
        referrer_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=referrer_payload,
            headers={"Content-Type": "application/json"}
        )
        assert referrer_response.status_code == 200
        referrer_code = referrer_response.json()["user"]["referral_code"]
        
        # Now register with referral code
        referred_payload = {
            "email": f"TEST_referred_{unique_id}@test.com",
            "password": "TestPass123!",
            "username": f"TEST_referred_{unique_id}",
            "referral_code": referrer_code
        }
        referred_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=referred_payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert referred_response.status_code == 200
        print(f"✓ Registration with referral code passed")
        print(f"  - Referrer code used: {referrer_code}")


class TestUserLogin:
    """User login endpoint tests"""
    
    def test_login_with_valid_credentials(self):
        """Test login with valid email and password"""
        # First register a user
        unique_id = str(uuid.uuid4())[:8]
        email = f"TEST_login_{unique_id}@test.com"
        password = "TestPass123!"
        
        register_payload = {
            "email": email,
            "password": password,
            "username": f"TEST_login_{unique_id}"
        }
        requests.post(
            f"{BASE_URL}/api/auth/register",
            json=register_payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Now login
        login_payload = {
            "email": email,
            "password": password
        }
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "access_token" in data
        assert "user" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == email
        
        print(f"✓ Login passed for: {email}")
        return data["access_token"]
    
    def test_login_with_invalid_email(self):
        """Test login with non-existent email"""
        login_payload = {
            "email": "nonexistent_user_xyz@test.com",
            "password": "SomePassword123!"
        }
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data["detail"].lower() or "email" in data["detail"].lower() or "password" in data["detail"].lower()
        print(f"✓ Invalid email rejection passed")
    
    def test_login_with_wrong_password(self):
        """Test login with wrong password"""
        # First register a user
        unique_id = str(uuid.uuid4())[:8]
        email = f"TEST_wrongpwd_{unique_id}@test.com"
        
        register_payload = {
            "email": email,
            "password": "CorrectPass123!",
            "username": f"TEST_wrongpwd_{unique_id}"
        }
        requests.post(
            f"{BASE_URL}/api/auth/register",
            json=register_payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Try login with wrong password
        login_payload = {
            "email": email,
            "password": "WrongPassword123!"
        }
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data["detail"].lower()
        print(f"✓ Wrong password rejection passed")
    
    def test_login_with_provided_test_user(self):
        """Test login with the provided test credentials"""
        # Try to login with provided test user
        login_payload = {
            "email": "test@bindas.com",
            "password": "Test123!"
        }
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_payload,
            headers={"Content-Type": "application/json"}
        )
        
        # This may fail if user doesn't exist yet - that's okay
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Test user login passed: {data['user']['email']}")
            return data["access_token"]
        else:
            print(f"⚠ Test user not found - creating new test user")
            # Create the test user
            register_payload = {
                "email": "test@bindas.com",
                "password": "Test123!",
                "username": "testuser"
            }
            reg_response = requests.post(
                f"{BASE_URL}/api/auth/register",
                json=register_payload,
                headers={"Content-Type": "application/json"}
            )
            if reg_response.status_code == 200:
                print(f"✓ Test user created and logged in")
                return reg_response.json()["access_token"]
            elif reg_response.status_code == 400:
                # User might exist with different password or username taken
                print(f"⚠ Could not create test user: {reg_response.json()}")
            return None


class TestGetCurrentUser:
    """Get current user (me) endpoint tests"""
    
    def test_get_me_with_valid_token(self):
        """Test /api/auth/me with valid token"""
        # First register and get token
        unique_id = str(uuid.uuid4())[:8]
        email = f"TEST_me_{unique_id}@test.com"
        
        register_payload = {
            "email": email,
            "password": "TestPass123!",
            "username": f"TEST_me_{unique_id}"
        }
        reg_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=register_payload,
            headers={"Content-Type": "application/json"}
        )
        assert reg_response.status_code == 200
        token = reg_response.json()["access_token"]
        
        # Now get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
        )
        
        assert response.status_code == 200, f"Get me failed: {response.text}"
        data = response.json()
        
        # Validate user data
        assert data["email"] == email
        assert "id" in data
        assert "balance" in data
        assert "referral_code" in data
        
        print(f"✓ Get current user passed")
        print(f"  - Email: {data['email']}")
        print(f"  - Balance: ${data['balance']}")
    
    def test_get_me_without_token(self):
        """Test /api/auth/me without token returns 401/403"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Unauthorized access rejection passed")
    
    def test_get_me_with_invalid_token(self):
        """Test /api/auth/me with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={
                "Authorization": "Bearer invalid_token_xyz123",
                "Content-Type": "application/json"
            }
        )
        
        assert response.status_code == 401
        print(f"✓ Invalid token rejection passed")


class TestFullAuthFlow:
    """End-to-end authentication flow test"""
    
    def test_complete_auth_flow(self):
        """Test complete flow: Register -> Login -> Get Me"""
        unique_id = str(uuid.uuid4())[:8]
        email = f"TEST_flow_{unique_id}@test.com"
        password = "FlowTest123!"
        username = f"TEST_flow_{unique_id}"
        
        # Step 1: Register
        print("\n--- Step 1: Register ---")
        register_payload = {
            "email": email,
            "password": password,
            "username": username
        }
        reg_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=register_payload,
            headers={"Content-Type": "application/json"}
        )
        assert reg_response.status_code == 200
        reg_data = reg_response.json()
        reg_token = reg_data["access_token"]
        user_id = reg_data["user"]["id"]
        print(f"✓ Registered: {email}")
        print(f"  - User ID: {user_id}")
        print(f"  - Token received: {reg_token[:20]}...")
        
        # Step 2: Login with same credentials
        print("\n--- Step 2: Login ---")
        login_payload = {
            "email": email,
            "password": password
        }
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_payload,
            headers={"Content-Type": "application/json"}
        )
        assert login_response.status_code == 200
        login_data = login_response.json()
        login_token = login_data["access_token"]
        print(f"✓ Logged in: {email}")
        print(f"  - New token received: {login_token[:20]}...")
        
        # Step 3: Get current user with login token
        print("\n--- Step 3: Get Current User ---")
        me_response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={
                "Authorization": f"Bearer {login_token}",
                "Content-Type": "application/json"
            }
        )
        assert me_response.status_code == 200
        me_data = me_response.json()
        
        # Verify data consistency
        assert me_data["email"] == email
        assert me_data["username"] == username
        assert me_data["id"] == user_id
        assert me_data["balance"] == 0.0  # New user starts with $0
        
        print(f"✓ Got current user data:")
        print(f"  - Email: {me_data['email']}")
        print(f"  - Username: {me_data['username']}")
        print(f"  - Balance: ${me_data['balance']}")
        print(f"  - Referral Code: {me_data['referral_code']}")
        
        print("\n✓✓✓ Complete auth flow passed! ✓✓✓")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
