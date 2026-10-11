import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_register_and_login_flow():
    reg_payload = {
        "username": "test_analyst_2026",
        "email": "analyst2026@ndrrma.gov.np",
        "password": "securepassword123",
        "full_name": "Deepak Shrestha",
        "agency": "Nepal NDRRMA",
        "role": "Field GIS Analyst"
    }

    # Register
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code in [200, 409] # 200 on first run, 409 if exists

    # Login
    login_res = client.post("/api/auth/login", json={
        "username": "test_analyst_2026",
        "password": "securepassword123"
    })
    assert login_res.status_code == 200
    data = login_res.json()
    assert "token" in data
    assert data["user"]["username"] == "test_analyst_2026"
    assert data["user"]["full_name"] == "Deepak Shrestha"

def test_copilot_chat_multilingual():
    languages_tests = [
        ("en", "Which bridges are severed in the Trishuli flood?"),
        ("ne", "त्रिशुलीमा कुन पुलहरू अवरुद्ध छन्?"),
        ("hi", "त्रिशूली में कौन-से पुल बाढ़ से क्षतिग्रस्त हुए हैं?"),
        ("te", "త్రిశూలి నది వరదల్లో ఏ వంతెనలు తెగిపోయాయి?"),
        ("es", "¿Qué puentes están cortados en Trishuli?"),
        ("fr", "Quels ponts sont coupés dans la vallée de Trishuli ?"),
        ("bn", "ত্রিশুলিতে কোন কোন সেতু বন্যায় ক্ষতিগ্রস্ত হয়েছে?"),
        ("zh", "特里苏利流域有哪些桥梁被冲毁？"),
    ]

    for lang_code, prompt in languages_tests:
        res = client.post("/api/copilot/chat", json={
            "message": prompt,
            "language": lang_code
        })
        assert res.status_code == 200, f"Failed for language: {lang_code}"
        data = res.json()
        assert "reply" in data
        assert len(data["reply"]) > 0
        assert data["language"] == lang_code
        assert ("Betrawati" in data["reply"] or "बेत्रावती" in data["reply"] or 
                "బెత్రావతి" in data["reply"] or "বেত্রাবতী" in data["reply"] or 
                "贝特拉瓦蒂" in data["reply"])
