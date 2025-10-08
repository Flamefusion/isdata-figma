import json
from unittest.mock import patch
from tests.mocks import mock_db_connection


def test_get_preview_data(client):
    """Test the /data endpoint."""
    with patch(
        "app.routes.data_routes.get_db_connection", return_value=mock_db_connection()
    ):
        response = client.get("/api/data")
        assert response.status_code == 200
        assert isinstance(response.json, list)


def test_start_migration(client):
    """Test the /migrate endpoint with a streaming response."""
    step7_data = [
        {
            "IHC": "serial1",
            "IHC MO": "mo1",
            "IHC SKU": "sku1",
            "IHC SIZE": "10",
            "logged_timestamp": "2025-10-07",
        },
        {
            "UID": "serial2",
            "3DE MO": "mo2",
            "SKU": "sku2",
            "SIZE": "11",
            "logged_timestamp": "2025-10-07",
        },
        {
            "MAKENICA": "serial3",
            "MK MO": "mo3",
            "MAKENICA SKU": "sku3",
            "MAKENICA SIZE": "12",
            "logged_timestamp": "2025-10-07",
        },
    ]
    vqc_data = {
        "IHC": [{"serial": "serial1", "vqc_status": "PASS"}],
        "3DE TECH": [{"serial": "serial2", "vqc_status": "FAIL"}],
        "MAKENICA": [],
    }
    with (
        patch(
            "app.routes.data_routes.get_db_connection",
            return_value=mock_db_connection(),
        ),
        patch("gspread.authorize") as mock_gspread_authorize,
        patch(
            "google.oauth2.service_account.Credentials.from_service_account_info"
        ) as mock_creds,
        patch(
            "app.routes.data_routes.load_sheets_data_parallel",
            return_value=(step7_data, vqc_data, [], []),
        ),
    ):
        mock_gspread_authorize.return_value = True
        mock_creds.return_value = True

        response = client.post(
            "/api/migrate", json={"some_config": "value", "serviceAccountContent": {}}
        )
        assert response.status_code == 200
        assert response.is_streamed

        # Process the streaming response
        lines = []
        for line in response.data.splitlines():
            if line.startswith(b"data: "):
                lines.append(line[6:].decode("utf-8"))

        assert len(lines) > 0
        assert "Migration completed successfully!" in lines[-1]
