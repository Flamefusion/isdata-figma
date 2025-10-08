import json
from unittest.mock import patch
from tests.mocks import mock_db_connection


def test_get_search_filters(client):
    """Test the /search/filters endpoint."""
    with patch(
        "app.routes.search_routes.get_db_connection", return_value=mock_db_connection()
    ):
        response = client.get("/api/search/filters")
        assert response.status_code == 200
        assert isinstance(response.json, dict)


def test_search_rings(client):
    """Test the /search endpoint."""
    with patch(
        "app.routes.search_routes.get_db_connection", return_value=mock_db_connection()
    ):
        response = client.post("/api/search", json={"query": "test"})
        assert response.status_code == 200
        assert isinstance(response.json, list)


def test_export_search_results(client):
    """Test the /search/export endpoint."""
    with patch(
        "app.routes.search_routes.get_db_connection", return_value=mock_db_connection()
    ):
        response = client.post("/api/search/export", json={"query": "test"})
        assert response.status_code == 200
        assert response.mimetype == "text/csv"
