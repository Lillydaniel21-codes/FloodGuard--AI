import requests
import json
from backend.app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

print("=== 1. VERIFYING LOGIN PROCESS ===")
login_res = client.post("/api/auth/login", json={"username": "responder", "password": "floodguard2026"})
assert login_res.status_code == 200, f"Login failed: {login_res.text}"
login_data = login_res.json()
token = login_data["token"]
user = login_data["user"]
print(f"Login successful! Token: {token[:16]}... User: {user['full_name']} ({user['role']})")

print("\n=== 2. VERIFYING AUTHENTICATED SESSION (/api/auth/me) ===")
me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
assert me_res.status_code == 200
print(f"Session verified! Agency: {me_res.json()['agency']}")

print("\n=== 3. VERIFYING LOGOUT PROCESS ===")
logout_res = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
assert logout_res.status_code == 200
print(f"Logout response: {logout_res.json()}")

print("\n=== 4. VERIFYING MAIN FLOOD-DAMAGE MAPPING PIPELINE ===")
analysis_payload = {
    "preset_id": "trishuli-aug-2026",
    "event_date": "2026-08-26",
    "satellite_platform": "combined",
    "radar_threshold_db": -3.2,
    "ndwi_threshold": 0.18,
    "include_dem_analysis": True,
    "use_ai_model": False
}
analysis_res = client.post("/api/analysis", json=analysis_payload)
assert analysis_res.status_code == 200
analysis_data = analysis_res.json()
aid = analysis_data["analysis_id"]
metrics = analysis_data["metrics"]
print(f"Analysis ID: {aid}")
print(f"Detected Flood Extent: {metrics['total_flood_area_sqkm']} km²")
print(f"Exposed Buildings: {metrics['buildings_affected']} of {metrics['buildings_total']}")
print(f"Flooded Roads: {metrics['roads_flooded_km']} km")
print(f"Severed Bridges: {metrics['bridges_severed']}")
print(f"Isolated Settlements: {metrics['settlements_isolated']}")

print("\n=== 5. VERIFYING ISOLATED SETTLEMENTS & BOTTLENECK ROUTING ===")
iso_res = client.get(f"/api/analysis/{aid}/isolated-settlements")
assert iso_res.status_code == 200
iso_data = iso_res.json()
for s in iso_data["settlements"]:
    if s["is_isolated"]:
        print(f"  [ISOLATED] {s['name']} ({s['district']}) -> Severed bottleneck: {s.get('critical_bottleneck_road')}")

print("\n=== 6. VERIFYING GROUNDED COPILOT (ENGLISH & NEPALI) ===")
chat_en = client.post(f"/api/analysis/{aid}/copilot/chat", json={"message": "Which settlements are cut off?", "language": "en"})
print(f"Copilot (EN): {chat_en.json()['reply'][:120]}...")

chat_ne = client.post(f"/api/analysis/{aid}/copilot/chat", json={"message": "कुन कुन बस्तीहरू सम्पर्कविच्छेद भएका छन्?", "language": "ne"})
ne_text = chat_ne.json()['reply'][:120]
try:
    print(f"Copilot (NE): {ne_text}...")
except UnicodeEncodeError:
    print(f"Copilot (NE) [Devanagari length {len(ne_text)} chars]: {ne_text.encode('utf-8')[:60]}...")


print("\n=== 7. VERIFYING PDF SITUATION REPORT GENERATION ===")
pdf_res = client.get(f"/api/analysis/{aid}/report.pdf")
assert pdf_res.status_code == 200
assert pdf_res.content.startswith(b"%PDF-")
print(f"SitRep PDF successfully generated! Size: {len(pdf_res.content)} bytes")

print("\n>>> ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS! <<<")
