"""
Cost Manager RESTful Web Services - Unit Tests

This file contains comprehensive unit tests for all four processes:
- Process 1 (Users Service): Port 3001
- Process 2 (Costs Service): Port 3002
- Process 3 (Admin Service): Port 3003
- Process 4 (Logs Service): Port 3004

Developers: Ofir Nesher, Asaf Arusi

To run: pytest tests.py -v
"""

import requests
import pytest
from datetime import datetime

# ===========================================
# Service URLs Configuration (Deployed on Render)
# ===========================================
USERS_URL = "https://process-1-users.onrender.com"
COSTS_URL = "https://process-2-costs.onrender.com"
ADMIN_URL = "https://process-3-admin.onrender.com"
LOGS_URL = "https://process-4-logs.onrender.com"

# Test constants
EXISTING_USER_ID = 123123
TEST_USER_ID = 987654
CURRENT_YEAR = datetime.now().year
CURRENT_MONTH = datetime.now().month


# ===========================================
# PROCESS 3: Admin Service Tests (/api/about)
# ===========================================
class TestAdminService:
    """Tests for Process 3 - Admin Service (Port 3003)"""

    def test_about_returns_200(self):
        """Should return HTTP 200 status"""
        response = requests.get(f"{ADMIN_URL}/api/about")
        assert response.status_code == 200

    def test_about_returns_array(self):
        """Should return an array of team members"""
        response = requests.get(f"{ADMIN_URL}/api/about")
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_about_contains_required_fields(self):
        """Should contain first_name and last_name for each member"""
        response = requests.get(f"{ADMIN_URL}/api/about")
        data = response.json()
        for member in data:
            assert "first_name" in member
            assert "last_name" in member
            assert isinstance(member["first_name"], str)
            assert isinstance(member["last_name"], str)

    def test_about_no_extra_fields(self):
        """Should not contain additional properties beyond first_name and last_name"""
        response = requests.get(f"{ADMIN_URL}/api/about")
        data = response.json()
        for member in data:
            keys = set(member.keys())
            assert keys == {"first_name", "last_name"}

    def test_about_with_trailing_slash(self):
        """Should handle trailing slash in URL"""
        response = requests.get(f"{ADMIN_URL}/api/about/")
        assert response.status_code in [200, 301, 302, 307, 308]


# ===========================================
# PROCESS 1: Users Service Tests
# ===========================================
class TestUsersServiceList:
    """Tests for GET /api/users - List of Users"""

    def test_users_list_returns_200(self):
        """Should return HTTP 200 status"""
        response = requests.get(f"{USERS_URL}/api/users")
        assert response.status_code == 200

    def test_users_list_returns_array(self):
        """Should return an array"""
        response = requests.get(f"{USERS_URL}/api/users")
        data = response.json()
        assert isinstance(data, list)

    def test_users_list_contains_required_properties(self):
        """Should contain user with required properties"""
        response = requests.get(f"{USERS_URL}/api/users")
        data = response.json()
        if len(data) > 0:
            user = data[0]
            assert "id" in user
            assert "first_name" in user
            assert "last_name" in user
            assert "birthday" in user

    def test_users_list_contains_existing_user(self):
        """Should contain the pre-existing user (id: 123123)"""
        response = requests.get(f"{USERS_URL}/api/users")
        data = response.json()
        existing_user = next((u for u in data if u["id"] == EXISTING_USER_ID), None)
        assert existing_user is not None
        assert existing_user["first_name"] == "mosh"
        assert existing_user["last_name"] == "israeli"


class TestUsersServiceGetById:
    """Tests for GET /api/users/:id - Get Specific User Details"""

    def test_get_user_returns_200(self):
        """Should return HTTP 200 for existing user"""
        response = requests.get(f"{USERS_URL}/api/users/{EXISTING_USER_ID}")
        assert response.status_code == 200

    def test_get_user_contains_required_fields(self):
        """Should return user with first_name, last_name, id, and total"""
        response = requests.get(f"{USERS_URL}/api/users/{EXISTING_USER_ID}")
        data = response.json()
        assert "first_name" in data
        assert "last_name" in data
        assert "id" in data
        assert "total" in data

    def test_get_user_correct_data_types(self):
        """Should return correct data types"""
        response = requests.get(f"{USERS_URL}/api/users/{EXISTING_USER_ID}")
        data = response.json()
        assert isinstance(data["first_name"], str)
        assert isinstance(data["last_name"], str)
        assert isinstance(data["id"], int)
        assert isinstance(data["total"], (int, float))

    def test_get_user_not_found_returns_404(self):
        """Should return HTTP 404 for non-existing user"""
        response = requests.get(f"{USERS_URL}/api/users/999888777")
        assert response.status_code == 404

    def test_get_user_not_found_error_format(self):
        """Should return error JSON with id and message for non-existing user"""
        response = requests.get(f"{USERS_URL}/api/users/999888777")
        data = response.json()
        assert "id" in data
        assert "message" in data

    def test_get_user_total_is_valid(self):
        """Should calculate total costs correctly"""
        response = requests.get(f"{USERS_URL}/api/users/{EXISTING_USER_ID}")
        data = response.json()
        assert isinstance(data["total"], (int, float))
        assert data["total"] >= 0


class TestUsersServiceAddUser:
    """Tests for POST /api/add - Add New User"""

    def test_add_user_success(self):
        """Should add a new user successfully"""
        new_user = {
            "id": TEST_USER_ID,
            "first_name": "Test",
            "last_name": "User",
            "birthday": "1995-05-15"
        }
        response = requests.post(f"{USERS_URL}/api/add", json=new_user)
        # Either 201 (created) or 500 (if user already exists)
        assert response.status_code in [201, 500]
        if response.status_code == 201:
            data = response.json()
            assert data["id"] == TEST_USER_ID
            assert data["first_name"] == "Test"
            assert data["last_name"] == "User"

    def test_add_duplicate_user_returns_error(self):
        """Should return error when adding duplicate user"""
        duplicate_user = {
            "id": EXISTING_USER_ID,
            "first_name": "Duplicate",
            "last_name": "User",
            "birthday": "1990-01-01"
        }
        response = requests.post(f"{USERS_URL}/api/add", json=duplicate_user)
        assert response.status_code == 500
        data = response.json()
        assert "message" in data

    def test_add_user_error_format(self):
        """Should return error JSON with id and message on failure"""
        invalid_user = {
            "id": EXISTING_USER_ID,
            "first_name": "Test",
            "last_name": "Invalid",
            "birthday": "2000-01-01"
        }
        response = requests.post(f"{USERS_URL}/api/add", json=invalid_user)
        data = response.json()
        assert "id" in data
        assert "message" in data

    def test_add_user_missing_fields(self):
        """Should handle missing required fields"""
        incomplete_user = {
            "id": 111222333,
            "first_name": "Incomplete"
            # missing last_name and birthday
        }
        response = requests.post(f"{USERS_URL}/api/add", json=incomplete_user)
        assert response.status_code == 500


# ===========================================
# PROCESS 2: Costs Service Tests
# ===========================================
class TestCostsServiceAddCost:
    """Tests for POST /api/add - Add Cost Item"""

    def test_add_cost_success(self):
        """Should add a cost item for existing user"""
        new_cost = {
            "description": "Test meal",
            "category": "food",
            "userid": EXISTING_USER_ID,
            "sum": 25
        }
        response = requests.post(f"{COSTS_URL}/api/add", json=new_cost)
        assert response.status_code == 201
        data = response.json()
        assert data["description"] == "Test meal"
        assert data["category"] == "food"
        assert data["userid"] == EXISTING_USER_ID
        assert data["sum"] == 25

    def test_add_cost_all_categories(self):
        """Should add cost items for all valid categories"""
        categories = ["food", "health", "housing", "sport", "education"]
        for category in categories:
            cost = {
                "description": f"Test {category} item",
                "category": category,
                "userid": EXISTING_USER_ID,
                "sum": 10
            }
            response = requests.post(f"{COSTS_URL}/api/add", json=cost)
            assert response.status_code == 201
            data = response.json()
            assert data["category"] == category

    def test_add_cost_non_existing_user(self):
        """Should return error for non-existing user"""
        cost = {
            "description": "Invalid cost",
            "category": "food",
            "userid": 999888777,
            "sum": 100
        }
        response = requests.post(f"{COSTS_URL}/api/add", json=cost)
        assert response.status_code == 500
        data = response.json()
        assert "message" in data

    def test_add_cost_error_format(self):
        """Should return error JSON with id and message on failure"""
        cost = {
            "description": "Invalid",
            "category": "food",
            "userid": 999888777,
            "sum": 50
        }
        response = requests.post(f"{COSTS_URL}/api/add", json=cost)
        data = response.json()
        assert "id" in data
        assert "message" in data

    def test_add_cost_default_date(self):
        """Should use current date if not provided"""
        cost = {
            "description": "Date test item",
            "category": "food",
            "userid": EXISTING_USER_ID,
            "sum": 5
        }
        response = requests.post(f"{COSTS_URL}/api/add", json=cost)
        assert response.status_code == 201
        data = response.json()
        assert "createdAt" in data

    def test_add_cost_with_trailing_slash(self):
        """Should handle trailing slash in URL"""
        cost = {
            "description": "Trailing slash test",
            "category": "food",
            "userid": EXISTING_USER_ID,
            "sum": 8
        }
        response = requests.post(f"{COSTS_URL}/api/add/", json=cost)
        assert response.status_code in [201, 307]

    def test_add_cost_invalid_category(self):
        """Should reject invalid category"""
        cost = {
            "description": "Invalid category test",
            "category": "invalid_category",
            "userid": EXISTING_USER_ID,
            "sum": 10
        }
        response = requests.post(f"{COSTS_URL}/api/add", json=cost)
        assert response.status_code == 500


class TestCostsServiceReport:
    """Tests for GET /api/report - Monthly Report"""

    def test_report_returns_200(self):
        """Should return HTTP 200 for valid request"""
        response = requests.get(
            f"{COSTS_URL}/api/report",
            params={"id": EXISTING_USER_ID, "year": CURRENT_YEAR, "month": CURRENT_MONTH}
        )
        assert response.status_code == 200

    def test_report_contains_required_fields(self):
        """Should return report with userid, year, month, and costs"""
        response = requests.get(
            f"{COSTS_URL}/api/report",
            params={"id": EXISTING_USER_ID, "year": CURRENT_YEAR, "month": CURRENT_MONTH}
        )
        data = response.json()
        assert "userid" in data
        assert "year" in data
        assert "month" in data
        assert "costs" in data

    def test_report_costs_is_array(self):
        """Should return costs as an array"""
        response = requests.get(
            f"{COSTS_URL}/api/report",
            params={"id": EXISTING_USER_ID, "year": CURRENT_YEAR, "month": CURRENT_MONTH}
        )
        data = response.json()
        assert isinstance(data["costs"], list)

    def test_report_includes_all_categories(self):
        """Should include all five categories in report"""
        response = requests.get(
            f"{COSTS_URL}/api/report",
            params={"id": EXISTING_USER_ID, "year": CURRENT_YEAR, "month": CURRENT_MONTH}
        )
        data = response.json()
        categories = [list(c.keys())[0] for c in data["costs"]]
        assert "food" in categories
        assert "health" in categories
        assert "housing" in categories
        assert "sport" in categories
        assert "education" in categories

    def test_report_cost_item_format(self):
        """Should return cost items with sum, description, and day"""
        response = requests.get(
            f"{COSTS_URL}/api/report",
            params={"id": EXISTING_USER_ID, "year": CURRENT_YEAR, "month": CURRENT_MONTH}
        )
        data = response.json()
        for category_obj in data["costs"]:
            category = list(category_obj.keys())[0]
            items = category_obj[category]
            for item in items:
                assert "sum" in item
                assert "description" in item
                assert "day" in item

    def test_report_missing_params_returns_400(self):
        """Should return error for missing parameters"""
        response = requests.get(
            f"{COSTS_URL}/api/report",
            params={"id": EXISTING_USER_ID}  # missing year and month
        )
        assert response.status_code == 400
        data = response.json()
        assert "message" in data

    def test_report_missing_id_error_format(self):
        """Should return error JSON with id and message on missing params"""
        response = requests.get(
            f"{COSTS_URL}/api/report",
            params={"year": CURRENT_YEAR, "month": CURRENT_MONTH}  # missing id
        )
        data = response.json()
        assert "id" in data
        assert "message" in data

    def test_report_empty_month(self):
        """Should return empty arrays for categories with no costs"""
        response = requests.get(
            f"{COSTS_URL}/api/report",
            params={"id": EXISTING_USER_ID, "year": 2020, "month": 1}
        )
        assert response.status_code == 200
        data = response.json()
        for category_obj in data["costs"]:
            category = list(category_obj.keys())[0]
            assert isinstance(category_obj[category], list)

    def test_report_future_month(self):
        """Should handle future month report request"""
        future_year = CURRENT_YEAR + 1
        response = requests.get(
            f"{COSTS_URL}/api/report",
            params={"id": EXISTING_USER_ID, "year": future_year, "month": 1}
        )
        assert response.status_code == 200

    def test_report_computed_pattern(self):
        """Should implement Computed Design Pattern for past months"""
        past_year = CURRENT_YEAR - 1
        past_month = 6

        # First request
        response1 = requests.get(
            f"{COSTS_URL}/api/report",
            params={"id": EXISTING_USER_ID, "year": past_year, "month": past_month}
        )
        assert response1.status_code == 200

        # Second request (should be cached)
        response2 = requests.get(
            f"{COSTS_URL}/api/report",
            params={"id": EXISTING_USER_ID, "year": past_year, "month": past_month}
        )
        assert response2.status_code == 200

        # Both responses should be identical
        assert response1.json() == response2.json()


# ===========================================
# PROCESS 4: Logs Service Tests
# ===========================================
class TestLogsService:
    """Tests for Process 4 - Logs Service (Port 3004)"""

    def test_logs_returns_200(self):
        """Should return HTTP 200 status"""
        response = requests.get(f"{LOGS_URL}/api/logs")
        assert response.status_code == 200

    def test_logs_returns_array(self):
        """Should return an array"""
        response = requests.get(f"{LOGS_URL}/api/logs")
        data = response.json()
        assert isinstance(data, list)

    def test_logs_contains_entries(self):
        """Should contain log entries after API requests"""
        # Make a request to generate a log
        requests.get(f"{ADMIN_URL}/api/about")

        response = requests.get(f"{LOGS_URL}/api/logs")
        data = response.json()
        assert len(data) > 0


# ===========================================
# Integration Tests
# ===========================================
class TestIntegration:
    """Integration Tests - Cross-Service Flow"""

    def test_full_flow(self):
        """Should complete full user-cost-report flow"""
        integration_user_id = 555666

        # Step 1: Create a new user
        user_response = requests.post(f"{USERS_URL}/api/add", json={
            "id": integration_user_id,
            "first_name": "Integration",
            "last_name": "Test",
            "birthday": "1988-08-08"
        })
        assert user_response.status_code in [201, 500]

        # Step 2: Add cost items for the user
        cost_response = requests.post(f"{COSTS_URL}/api/add", json={
            "description": "Integration test meal",
            "category": "food",
            "userid": integration_user_id,
            "sum": 35
        })
        if user_response.status_code == 201:
            assert cost_response.status_code == 201

        # Step 3: Get user details with total
        user_details_response = requests.get(f"{USERS_URL}/api/users/{integration_user_id}")
        if user_response.status_code == 201:
            assert user_details_response.status_code == 200
            assert user_details_response.json()["total"] >= 35

        # Step 4: Get monthly report
        report_response = requests.get(
            f"{COSTS_URL}/api/report",
            params={"id": integration_user_id, "year": CURRENT_YEAR, "month": CURRENT_MONTH}
        )
        assert report_response.status_code == 200

    def test_logs_created_for_operations(self):
        """Should verify logs are created for all operations"""
        # Perform various operations
        requests.get(f"{ADMIN_URL}/api/about")
        requests.get(f"{USERS_URL}/api/users")
        requests.get(f"{USERS_URL}/api/users/{EXISTING_USER_ID}")
        requests.get(
            f"{COSTS_URL}/api/report",
            params={"id": EXISTING_USER_ID, "year": 2026, "month": 1}
        )

        # Check logs
        logs_response = requests.get(f"{LOGS_URL}/api/logs")
        assert logs_response.status_code == 200
        assert len(logs_response.json()) > 0


# ===========================================
# Validation Tests
# ===========================================
class TestValidation:
    """Validation Tests for input data"""

    def test_user_invalid_id_type(self):
        """Should reject user with invalid id type"""
        response = requests.post(f"{USERS_URL}/api/add", json={
            "id": "not-a-number",
            "first_name": "Invalid",
            "last_name": "User",
            "birthday": "2000-01-01"
        })
        assert response.status_code == 500

    def test_user_empty_first_name(self):
        """Should reject user with empty first_name"""
        response = requests.post(f"{USERS_URL}/api/add", json={
            "id": 444555666,
            "first_name": "",
            "last_name": "User",
            "birthday": "2000-01-01"
        })
        assert response.status_code == 500

    def test_cost_negative_sum(self):
        """Should reject cost with negative sum"""
        response = requests.post(f"{COSTS_URL}/api/add", json={
            "description": "Negative sum test",
            "category": "food",
            "userid": EXISTING_USER_ID,
            "sum": -10
        })
        assert response.status_code == 500

    def test_cost_empty_description(self):
        """Should reject cost with empty description"""
        response = requests.post(f"{COSTS_URL}/api/add", json={
            "description": "",
            "category": "food",
            "userid": EXISTING_USER_ID,
            "sum": 10
        })
        assert response.status_code == 500


# ===========================================
# Error Response Format Tests
# ===========================================
class TestErrorFormat:
    """Error Response Format Tests"""

    def test_user_not_found_error_format(self):
        """Should return error with id and message for user not found"""
        response = requests.get(f"{USERS_URL}/api/users/999999999")
        data = response.json()
        assert "id" in data
        assert "message" in data
        assert data["id"] == 999999999

    def test_cost_invalid_user_error_format(self):
        """Should return error with id and message for cost with invalid user"""
        response = requests.post(f"{COSTS_URL}/api/add", json={
            "description": "Error test",
            "category": "food",
            "userid": 888777666,
            "sum": 10
        })
        data = response.json()
        assert "id" in data
        assert "message" in data

    def test_report_missing_params_error_format(self):
        """Should return error with id and message for missing report params"""
        response = requests.get(f"{COSTS_URL}/api/report")
        data = response.json()
        assert "id" in data
        assert "message" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
