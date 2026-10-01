"""Tests for Offer System - Sunday/Wednesday Special Offers with 10% deposit bonus"""
import os
import pytest
import requests
from datetime import datetime, timedelta, timezone

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://crypto-slab-preview.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@tradego.com"
ADMIN_PASSWORD = "Admin@123"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("access_token") or data.get("token")
    assert token
    return token


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ----- Public Offers Status API -----
class TestOffersStatusPublic:
    def test_get_offers_status_public(self):
        r = requests.get(f"{BASE_URL}/api/offers/status")
        assert r.status_code == 200
        data = r.json()
        assert "offers" in data
        assert isinstance(data["offers"], list)
        assert len(data["offers"]) == 2
        types = {o["offer_type"] for o in data["offers"]}
        assert types == {"sunday", "wednesday"}
        for o in data["offers"]:
            assert "status" in o
            assert "is_live" in o
            assert "bonus_percent" in o
            assert "banner_url" in o
            assert o["status"] in ["live", "upcoming", "ended", "not_configured"]

    def test_check_active_invalid_type(self):
        r = requests.get(f"{BASE_URL}/api/offers/monday/check-active")
        assert r.status_code == 400

    def test_check_active_valid(self):
        r = requests.get(f"{BASE_URL}/api/offers/sunday/check-active")
        assert r.status_code == 200
        data = r.json()
        assert "is_active" in data
        assert "bonus_percent" in data


# ----- Admin Offers Management -----
class TestAdminOffers:
    def test_admin_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/admin/offers")
        assert r.status_code in (401, 403)

    def test_admin_get_offers(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/offers", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        assert "offers" in data
        assert len(data["offers"]) == 2

    def test_admin_configure_sunday_offer(self, admin_headers):
        now = datetime.now(timezone.utc)
        start = (now - timedelta(minutes=30)).isoformat()
        end = (now + timedelta(hours=23)).isoformat()
        payload = {
            "start_datetime": start,
            "end_datetime": end,
            "bonus_percent": 10.0,
            "is_active": True
        }
        r = requests.post(f"{BASE_URL}/api/admin/offers/sunday", headers=admin_headers, json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "offer" in data
        assert data["offer"]["offer_type"] == "sunday"
        assert data["offer"]["is_active"] is True
        assert data["offer"]["bonus_percent"] == 10.0

        # Verify via public API that it's live
        s = requests.get(f"{BASE_URL}/api/offers/status").json()
        sunday = next(o for o in s["offers"] if o["offer_type"] == "sunday")
        assert sunday["is_live"] is True
        assert sunday["status"] == "live"
        assert sunday["ends_in_seconds"] is not None and sunday["ends_in_seconds"] > 0

        # check-active endpoint
        c = requests.get(f"{BASE_URL}/api/offers/sunday/check-active").json()
        assert c["is_active"] is True
        assert c["bonus_percent"] == 10.0

    def test_admin_configure_upcoming_wednesday(self, admin_headers):
        now = datetime.now(timezone.utc)
        start = (now + timedelta(hours=2)).isoformat()
        end = (now + timedelta(hours=26)).isoformat()
        payload = {"start_datetime": start, "end_datetime": end, "bonus_percent": 10.0, "is_active": True}
        r = requests.post(f"{BASE_URL}/api/admin/offers/wednesday", headers=admin_headers, json=payload)
        assert r.status_code == 200

        s = requests.get(f"{BASE_URL}/api/offers/status").json()
        wed = next(o for o in s["offers"] if o["offer_type"] == "wednesday")
        assert wed["status"] == "upcoming"
        assert wed["is_live"] is False
        assert wed["starts_in_seconds"] is not None and wed["starts_in_seconds"] > 0

    def test_admin_invalid_offer_type(self, admin_headers):
        payload = {"start_datetime": datetime.now(timezone.utc).isoformat()}
        r = requests.post(f"{BASE_URL}/api/admin/offers/monday", headers=admin_headers, json=payload)
        assert r.status_code == 400

    def test_admin_deactivate_offer(self, admin_headers):
        # Ensure wednesday is configured first (done in prior test)
        r = requests.delete(f"{BASE_URL}/api/admin/offers/wednesday", headers=admin_headers)
        assert r.status_code == 200

        s = requests.get(f"{BASE_URL}/api/offers/status").json()
        wed = next(o for o in s["offers"] if o["offer_type"] == "wednesday")
        assert wed["is_live"] is False
        # status should be not_configured (since is_active=False short-circuits)
        assert wed["status"] == "not_configured"

    def test_restore_sunday_live_for_frontend_tests(self, admin_headers):
        """Make sure sunday offer is LIVE after tests - as original setup expected it live."""
        now = datetime.now(timezone.utc)
        start = (now - timedelta(hours=1)).isoformat()
        end = (now + timedelta(hours=23)).isoformat()
        payload = {"start_datetime": start, "end_datetime": end, "bonus_percent": 10.0, "is_active": True}
        r = requests.post(f"{BASE_URL}/api/admin/offers/sunday", headers=admin_headers, json=payload)
        assert r.status_code == 200
