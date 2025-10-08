import pytest
import os
from app import create_app


@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    os.environ["TESTING"] = "True"
    app = create_app()
    yield app


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def sample_step7_data():
    """Sample Step 7 data for testing."""
    return [
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


@pytest.fixture
def sample_vqc_data():
    """Sample VQC data for testing."""
    return {
        "IHC": [{"serial": "serial1", "vqc_status": "PASS"}],
        "3DE TECH": [{"serial": "serial2", "vqc_status": "FAIL"}],
        "MAKENICA": [],
    }


@pytest.fixture
def sample_ft_data():
    """Sample FT data for testing."""
    return []


@pytest.fixture
def google_config():
    """Sample Google config for testing."""
    return {
        "serviceAccountContent": {
            "client_email": "test@example.com",
            "private_key": "test_key",
        },
        "vendorDataUrl": "some_url",
        "vqcDataUrl": "some_url",
        "ftDataUrl": "some_url",
    }
