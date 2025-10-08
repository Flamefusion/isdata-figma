import json
from unittest.mock import patch
from tests.mocks import mock_db_connection


def test_get_vendors(client):
    """Test the /vendors endpoint."""
    with patch(
        "app.routes.report_routes.get_db_connection", return_value=mock_db_connection()
    ):
        response = client.get("/api/vendors")
        assert response.status_code == 200
        assert isinstance(response.json, list)


def test_get_daily_report(client):
    """Test the /daily_report endpoint."""
    with patch(
        "app.routes.report_routes.get_db_connection", return_value=mock_db_connection()
    ):
        response = client.post("/api/daily_report", json={"date": "2025-10-07"})
        assert response.status_code == 200
        assert isinstance(response.json, dict)


def test_get_rejection_trends(client):
    """Test the /rejection_trends endpoint."""
    with patch(
        "app.routes.report_routes.get_db_connection", return_value=mock_db_connection()
    ):
        response = client.post(
            "/api/rejection_trends",
            json={"dateFrom": "2025-10-01", "dateTo": "2025-10-07", "vendor": "all"},
        )
        assert response.status_code == 200
        assert isinstance(response.json, dict)
