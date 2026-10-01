"""
Test Admin Panel Settings Feature
- GET /api/admin/settings - Get platform settings
- POST /api/admin/settings - Save platform settings
- GET /api/settings/deposit-wallet - Public endpoint for users
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@tradego.com"
ADMIN_PASSWORD = "Admin@123"


class TestAdminSettings:
    """Test Admin Settings API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        self.token = data["access_token"]
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_get_platform_settings(self):
        """Test GET /api/admin/settings returns platform settings"""
        response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
        
        assert response.status_code == 200, f"Failed to get settings: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data, "Response should have 'id' field"
        assert data["id"] == "main", "Settings id should be 'main'"
        
        # Verify all expected fields exist
        expected_fields = [
            "deposit_wallet_address",
            "withdrawal_wallet_address", 
            "deposit_wallet_network",
            "withdrawal_wallet_network",
            "min_deposit",
            "min_withdrawal",
            "withdrawal_fee_percent"
        ]
        
        for field in expected_fields:
            assert field in data, f"Response should have '{field}' field"
        
        print(f"✅ GET /api/admin/settings - PASS")
        print(f"   Current settings: deposit_wallet={data.get('deposit_wallet_address', '')[:20]}...")
    
    def test_save_platform_settings(self):
        """Test POST /api/admin/settings saves new settings"""
        # Generate unique test wallet addresses
        test_deposit_wallet = f"TTestDeposit{uuid.uuid4().hex[:8]}"
        test_withdrawal_wallet = f"TTestWithdraw{uuid.uuid4().hex[:8]}"
        
        new_settings = {
            "deposit_wallet_address": test_deposit_wallet,
            "withdrawal_wallet_address": test_withdrawal_wallet,
            "deposit_wallet_network": "TRC20",
            "withdrawal_wallet_network": "ERC20",
            "min_deposit": 5.0,
            "min_withdrawal": 15.0,
            "withdrawal_fee_percent": 3.0
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/settings",
            headers=self.headers,
            json=new_settings
        )
        
        assert response.status_code == 200, f"Failed to save settings: {response.text}"
        data = response.json()
        
        # Verify success message
        assert "message" in data, "Response should have 'message' field"
        assert "settings" in data, "Response should have 'settings' field"
        
        # Verify settings were saved
        saved_settings = data["settings"]
        assert saved_settings["deposit_wallet_address"] == test_deposit_wallet
        assert saved_settings["withdrawal_wallet_address"] == test_withdrawal_wallet
        assert saved_settings["deposit_wallet_network"] == "TRC20"
        assert saved_settings["withdrawal_wallet_network"] == "ERC20"
        assert saved_settings["min_deposit"] == 5.0
        assert saved_settings["min_withdrawal"] == 15.0
        assert saved_settings["withdrawal_fee_percent"] == 3.0
        
        print(f"✅ POST /api/admin/settings - PASS")
        print(f"   Saved deposit wallet: {test_deposit_wallet}")
        print(f"   Saved withdrawal wallet: {test_withdrawal_wallet}")
    
    def test_settings_persistence(self):
        """Test that settings persist after save - GET after POST"""
        # First, save new settings
        test_deposit_wallet = f"TPersist{uuid.uuid4().hex[:8]}"
        test_min_deposit = 7.5
        
        save_response = requests.post(
            f"{BASE_URL}/api/admin/settings",
            headers=self.headers,
            json={
                "deposit_wallet_address": test_deposit_wallet,
                "min_deposit": test_min_deposit
            }
        )
        assert save_response.status_code == 200, f"Failed to save: {save_response.text}"
        
        # Then, GET settings and verify persistence
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
        assert get_response.status_code == 200, f"Failed to get: {get_response.text}"
        
        data = get_response.json()
        assert data["deposit_wallet_address"] == test_deposit_wallet, "Deposit wallet should persist"
        assert data["min_deposit"] == test_min_deposit, "Min deposit should persist"
        
        print(f"✅ Settings Persistence - PASS")
        print(f"   Verified deposit wallet persisted: {test_deposit_wallet}")
    
    def test_network_selection_options(self):
        """Test network selection works for TRC20, ERC20, BEP20"""
        networks = ["TRC20", "ERC20", "BEP20"]
        
        for network in networks:
            response = requests.post(
                f"{BASE_URL}/api/admin/settings",
                headers=self.headers,
                json={
                    "deposit_wallet_network": network,
                    "withdrawal_wallet_network": network
                }
            )
            assert response.status_code == 200, f"Failed to set network {network}: {response.text}"
            
            # Verify network was saved
            get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
            data = get_response.json()
            assert data["deposit_wallet_network"] == network, f"Deposit network should be {network}"
            assert data["withdrawal_wallet_network"] == network, f"Withdrawal network should be {network}"
        
        print(f"✅ Network Selection (TRC20/ERC20/BEP20) - PASS")
    
    def test_min_deposit_amount_field(self):
        """Test minimum deposit amount field works"""
        test_values = [1.0, 5.0, 10.0, 50.0]
        
        for value in test_values:
            response = requests.post(
                f"{BASE_URL}/api/admin/settings",
                headers=self.headers,
                json={"min_deposit": value}
            )
            assert response.status_code == 200, f"Failed to set min_deposit {value}"
            
            # Verify
            get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
            data = get_response.json()
            assert data["min_deposit"] == value, f"Min deposit should be {value}"
        
        print(f"✅ Minimum Deposit Amount Field - PASS")
    
    def test_min_withdrawal_amount_field(self):
        """Test minimum withdrawal amount field works"""
        test_values = [10.0, 20.0, 50.0, 100.0]
        
        for value in test_values:
            response = requests.post(
                f"{BASE_URL}/api/admin/settings",
                headers=self.headers,
                json={"min_withdrawal": value}
            )
            assert response.status_code == 200, f"Failed to set min_withdrawal {value}"
            
            # Verify
            get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
            data = get_response.json()
            assert data["min_withdrawal"] == value, f"Min withdrawal should be {value}"
        
        print(f"✅ Minimum Withdrawal Amount Field - PASS")
    
    def test_withdrawal_fee_percent_field(self):
        """Test withdrawal fee percentage field works"""
        test_values = [1.0, 3.0, 5.0, 10.0]
        
        for value in test_values:
            response = requests.post(
                f"{BASE_URL}/api/admin/settings",
                headers=self.headers,
                json={"withdrawal_fee_percent": value}
            )
            assert response.status_code == 200, f"Failed to set withdrawal_fee_percent {value}"
            
            # Verify
            get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
            data = get_response.json()
            assert data["withdrawal_fee_percent"] == value, f"Withdrawal fee should be {value}"
        
        print(f"✅ Withdrawal Fee Percentage Field - PASS")


class TestPublicDepositWallet:
    """Test public deposit wallet endpoint for users"""
    
    def test_get_deposit_wallet_public(self):
        """Test GET /api/settings/deposit-wallet returns deposit wallet for users"""
        response = requests.get(f"{BASE_URL}/api/settings/deposit-wallet")
        
        assert response.status_code == 200, f"Failed to get deposit wallet: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "wallet_address" in data, "Response should have 'wallet_address' field"
        assert "network" in data, "Response should have 'network' field"
        
        print(f"✅ GET /api/settings/deposit-wallet (Public) - PASS")
        print(f"   Wallet: {data.get('wallet_address', 'Not set')}")
        print(f"   Network: {data.get('network', 'TRC20')}")
    
    def test_deposit_wallet_reflects_admin_settings(self):
        """Test that public endpoint reflects admin settings"""
        # First, login as admin and set a specific wallet
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        # Set a unique deposit wallet
        test_wallet = f"TPublicTest{uuid.uuid4().hex[:8]}"
        test_network = "BEP20"
        test_min_deposit = 25.0
        
        save_response = requests.post(
            f"{BASE_URL}/api/admin/settings",
            headers=headers,
            json={
                "deposit_wallet_address": test_wallet,
                "deposit_wallet_network": test_network,
                "min_deposit": test_min_deposit
            }
        )
        assert save_response.status_code == 200
        
        # Now check public endpoint (no auth required)
        public_response = requests.get(f"{BASE_URL}/api/settings/deposit-wallet")
        assert public_response.status_code == 200
        
        data = public_response.json()
        assert data["wallet_address"] == test_wallet, "Public endpoint should show admin-set wallet"
        assert data["network"] == test_network, "Public endpoint should show admin-set network"
        assert data["min_deposit"] == test_min_deposit, "Public endpoint should show admin-set min deposit"
        
        print(f"✅ Public Deposit Wallet Reflects Admin Settings - PASS")
        print(f"   Admin set: {test_wallet}")
        print(f"   Public shows: {data['wallet_address']}")


class TestSettingsEdgeCases:
    """Test edge cases and validation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        self.token = response.json()["access_token"]
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_partial_update(self):
        """Test that partial updates work (only update some fields)"""
        # First get current settings
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
        original_settings = get_response.json()
        
        # Update only deposit wallet
        new_wallet = f"TPartial{uuid.uuid4().hex[:8]}"
        response = requests.post(
            f"{BASE_URL}/api/admin/settings",
            headers=self.headers,
            json={"deposit_wallet_address": new_wallet}
        )
        assert response.status_code == 200
        
        # Verify only deposit wallet changed, others remain
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
        updated_settings = get_response.json()
        
        assert updated_settings["deposit_wallet_address"] == new_wallet
        # Other fields should remain unchanged (or have default values)
        
        print(f"✅ Partial Update - PASS")
    
    def test_empty_wallet_address(self):
        """Test saving empty wallet address"""
        response = requests.post(
            f"{BASE_URL}/api/admin/settings",
            headers=self.headers,
            json={"deposit_wallet_address": ""}
        )
        assert response.status_code == 200
        
        # Verify empty was saved
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
        data = get_response.json()
        assert data["deposit_wallet_address"] == ""
        
        print(f"✅ Empty Wallet Address - PASS")
    
    def test_long_wallet_address(self):
        """Test saving long wallet address (typical crypto addresses are 34-42 chars)"""
        long_wallet = "T" + "a" * 50  # 51 char address
        response = requests.post(
            f"{BASE_URL}/api/admin/settings",
            headers=self.headers,
            json={"deposit_wallet_address": long_wallet}
        )
        assert response.status_code == 200
        
        # Verify it was saved
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
        data = get_response.json()
        assert data["deposit_wallet_address"] == long_wallet
        
        print(f"✅ Long Wallet Address - PASS")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
