import pytest
from fastapi.testclient import TestClient

from src.app import app

client = TestClient(app)


def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    activity = data["Chess Club"]
    assert "description" in activity
    assert "schedule" in activity
    assert "max_participants" in activity
    assert "participants" in activity
    assert isinstance(activity["participants"], list)


def test_root_redirect():
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/static/index.html"


def test_signup_success():
    response = client.post("/activities/Chess%20Club/signup?email=newstudent@mergington.edu")
    assert response.status_code == 200
    data = response.json()
    assert "Signed up" in data["message"]


def test_signup_duplicate():
    # First signup
    client.post("/activities/Programming%20Class/signup?email=dup@mergington.edu")
    # Duplicate
    response = client.post("/activities/Programming%20Class/signup?email=dup@mergington.edu")
    assert response.status_code == 400
    data = response.json()
    assert "already signed up" in data["detail"]


def test_signup_invalid_activity():
    response = client.post("/activities/Invalid%20Activity/signup?email=test@mergington.edu")
    assert response.status_code == 404
    data = response.json()
    assert "Activity not found" in data["detail"]


def test_delete_participant_success():
    # First add
    client.post("/activities/Gym%20Class/signup?email=deleteme@mergington.edu")
    # Then delete
    response = client.delete("/activities/Gym%20Class/participants/deleteme@mergington.edu")
    assert response.status_code == 200
    data = response.json()
    assert "Removed" in data["message"]


def test_delete_participant_not_found():
    response = client.delete("/activities/Chess%20Club/participants/nonexistent@mergington.edu")
    assert response.status_code == 404
    data = response.json()
    assert "Participant not found" in data["detail"]


def test_delete_invalid_activity():
    response = client.delete("/activities/Invalid%20Activity/participants/test@mergington.edu")
    assert response.status_code == 404
    data = response.json()
    assert "Activity not found" in data["detail"]