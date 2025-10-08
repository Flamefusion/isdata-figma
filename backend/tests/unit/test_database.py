"""
Unit tests for database.py
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import psycopg2
from app.database import (
    get_db_connection,
    close_db_connection,
    check_single_db_connection,
    init_app,
)
from flask import Flask


@patch("app.database.psycopg2.connect")
def test_get_db_connection_success(mock_connect):
    """Test successful database connection."""
    mock_conn = Mock()
    mock_connect.return_value = mock_conn

    app = Flask(__name__)
    app.secret_key = "test_secret_key"

    with app.test_request_context():
        from flask import g, session

        session["db_config"] = {
            "host": "localhost",
            "port": "5432",
            "dbname": "test_db",
            "user": "test_user",
            "password": "test_password",
        }
        conn = get_db_connection()

        assert conn == mock_conn
    mock_connect.assert_called_once_with(
        host="localhost",
        port="5432",
        dbname="test_db",
        user="test_user",
        password="test_password",
    )


@patch("app.database.psycopg2.connect")
def test_get_db_connection_failure(mock_connect):
    """Test failed database connection."""
    mock_connect.side_effect = psycopg2.Error("Connection failed")

    app = Flask(__name__)
    app.secret_key = "test_secret_key"

    with app.test_request_context():
        from flask import g, session

        session["db_config"] = {
            "host": "localhost",
            "port": "5432",
            "dbname": "test_db",
            "user": "test_user",
            "password": "test_password",
        }
        with pytest.raises(
            ConnectionError, match="Database connection failed: Connection failed"
        ):
            get_db_connection()


def test_close_db_connection():
    """Test closing database connection."""
    app = Flask(__name__)

    with app.test_request_context():
        from flask import g

        mock_conn = Mock()
        g.db_conn = mock_conn
        close_db_connection()
        assert g.get("db_conn") is None
        mock_conn.close.assert_called_once()


@patch("app.database.psycopg2.connect")
def test_check_single_db_connection_success(mock_connect):
    """Test successful single database connection."""
    mock_conn = Mock()
    mock_connect.return_value = mock_conn

    success, message = check_single_db_connection(
        "localhost", "5432", "test_db", "user", "password"
    )

    assert success is True
    assert "Database connection successful!" in message
    mock_connect.assert_called_once_with(
        host="localhost",
        port="5432",
        dbname="test_db",
        user="user",
        password="password",
        connect_timeout=5,
    )
    mock_conn.close.assert_called_once()


@patch("app.database.psycopg2.connect")
def test_check_single_db_connection_failure(mock_connect):
    """Test failed single database connection."""
    mock_connect.side_effect = psycopg2.Error("Connection failed")

    success, message = check_single_db_connection(
        "localhost", "5432", "test_db", "user", "password"
    )

    assert success is False
    assert "Database connection failed:" in message


def test_init_app():
    """Test that the app is initialized correctly."""
    app = Mock()
    app.teardown_appcontext = Mock()
    init_app(app)
    app.teardown_appcontext.assert_called_once_with(close_db_connection)
