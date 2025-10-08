import json

def def_test_db_connection_success(client):
    """Test the /db/test endpoint with valid credentials."""
    # Mock the database connection
    response = client.post("/db/test", json={
        "user": "testuser",
        "password": "testpassword",
        "host": "localhost",
        "port": "5432",
        "dbname": "testdb"
    })
    assert response.status_code == 200
    assert response.json == {"message": "Database connection successful"}

def def_test_db_connection_failure(client):
    """Test the /db/test endpoint with invalid credentials."""
    response = client.post("/db/test", json={
        "user": "wronguser",
        "password": "wrongpassword",
        "host": "localhost",
        "port": "5432",
        "dbname": "testdb"
    })
    assert response.status_code == 400
    assert "error" in response.json

def def_test_create_db_schema(client):
    """Test the /db/schema endpoint."""
    response = client.post("/db/schema")
    assert response.status_code == 200
    assert response.json == {"message": "Schema created successfully"}

def def_test_clear_db(client):
    """Test the /db/clear endpoint."""
    response = client.delete("/db/clear")
    assert response.status_code == 200
    assert response.json == {"message": "Database cleared successfully"}
