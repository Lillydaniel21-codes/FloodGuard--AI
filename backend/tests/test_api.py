from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["service"] == "FloodGuard AI"


def test_data_sources_endpoint():
    resp = client.get("/api/data-sources")
    assert resp.status_code == 200
    sources = resp.json()
    assert len(sources) >= 4
    names = [s["name"] for s in sources]
    assert any("Sentinel-1" in n for n in names)
    assert any("Copernicus WorldDEM-30" in n for n in names)


def test_case_studies_endpoint():
    resp = client.get("/api/case-studies")
    assert resp.status_code == 200
    studies = resp.json()
    assert len(studies) >= 1
    assert studies[0]["id"] == "trishuli-aug-2026"


def test_analysis_pipeline_and_endpoints():
    payload = {
        "preset_id": "trishuli-aug-2026",
        "event_date": "2026-08-26",
        "satellite_platform": "combined",
        "radar_threshold_db": -3.2,
        "ndwi_threshold": 0.18,
        "include_dem_analysis": True,
        "use_ai_model": False
    }

    # 1. Trigger analysis synchronously
    resp = client.post("/api/analysis", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    analysis_id = data["analysis_id"]
    assert data["status"] == "completed"
    assert "metrics" in data
    assert data["metrics"]["total_flood_area_sqkm"] > 0
    assert data["metrics"]["settlements_isolated"] >= 1

    # 2. Get flood map
    map_resp = client.get(f"/api/analysis/{analysis_id}/flood-map")
    assert map_resp.status_code == 200
    map_data = map_resp.json()
    assert "flood_geojson" in map_data
    assert len(map_data["flood_geojson"]["features"]) > 0

    # 3. Get infrastructure table
    infra_resp = client.get(f"/api/analysis/{analysis_id}/infrastructure")
    assert infra_resp.status_code == 200
    infra_data = infra_resp.json()
    assert infra_data["total_items"] > 0

    # 4. Get isolated settlements
    iso_resp = client.get(f"/api/analysis/{analysis_id}/isolated-settlements")
    assert iso_resp.status_code == 200
    iso_data = iso_resp.json()
    assert iso_data["isolated_settlements_count"] >= 1

    # 5. Copilot Chat in English and Nepali
    chat_resp_en = client.post(
        f"/api/analysis/{analysis_id}/copilot/chat",
        json={"message": "Which settlements are disconnected from hospitals?", "language": "en"}
    )
    assert chat_resp_en.status_code == 200
    assert "Dhunche" in chat_resp_en.json()["reply"]

    chat_resp_ne = client.post(
        f"/api/analysis/{analysis_id}/copilot/chat",
        json={"message": "कुन कुन बस्तीहरू सम्पर्कविच्छेद भएका छन्?", "language": "ne"}
    )
    assert chat_resp_ne.status_code == 200
    assert len(chat_resp_ne.json()["reply"]) > 20

    # 6. PDF Report streaming
    pdf_resp = client.get(f"/api/analysis/{analysis_id}/report.pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    # PDF starts with %PDF-
    assert pdf_resp.content.startswith(b"%PDF-")


def test_auth_login_successful():
    """Verify emergency responder login issues a valid bearer token."""
    resp = client.post("/api/auth/login", json={"username": "responder", "password": "floodguard2026"})
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data
    assert data["token_type"] == "Bearer"
    assert data["user"]["username"] == "responder"
    assert "Sharma" in data["user"]["full_name"]


def test_auth_me_and_logout():
    """Verify session inspection and termination."""
    # Login
    login_resp = client.post("/api/auth/login", json={"username": "commander", "password": "disaster2026"})
    token = login_resp.json()["token"]

    # Verify /api/auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == "commander"
    assert me_resp.json()["role"] == "Incident Commander"

    # Logout
    logout_resp = client.post("/api/auth/logout", headers=headers)
    assert logout_resp.status_code == 200
    assert logout_resp.json()["status"] == "success"


def test_auth_login_invalid_password():
    """Verify unauthorized rejection with wrong password."""
    resp = client.post("/api/auth/login", json={"username": "responder", "password": "wrongpassword"})
    assert resp.status_code == 401

