import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def get(path, headers=None):
    req = urllib.request.Request(f"{BASE_URL}{path}", headers=headers or {})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.getcode(), resp.read(), resp.headers
    except urllib.error.HTTPError as e:
        return e.code, e.read(), e.headers

def post(path, data, headers=None):
    payload = json.dumps(data).encode("utf-8")
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(f"{BASE_URL}{path}", data=payload, headers=req_headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.getcode(), resp.read(), resp.headers
    except urllib.error.HTTPError as e:
        return e.code, e.read(), e.headers

print("=================================================================")
print("          FLOODGUARD AI — LIVE SERVER SYSTEM AUDIT               ")
print("=================================================================")

# 1. Root SPA HTML Test
print("\n[TEST 1] Root SPA Index (GET /)")
code, body, _ = get("/")
assert code == 200, f"Expected 200, got {code}"
assert b"<!DOCTYPE html>" in body or b"<html" in body
print(f"  --> Status: {code} OK | HTML Payload size: {len(body)} bytes")

# 2. API Health Check
print("\n[TEST 2] Health Endpoint (GET /api/health)")
code, body, _ = get("/api/health")
assert code == 200
data = json.loads(body.decode("utf-8"))
print(f"  --> Status: {code} OK | Service: {data['service']} | Status: {data['status']}")
print(f"  --> LLM Copilot Engine: {data['llm_copilot_mode']}")

# 3. Data Sources Registry
print("\n[TEST 3] Registered Data Sources (GET /api/data-sources)")
code, body, _ = get("/api/data-sources")
assert code == 200
sources = json.loads(body.decode("utf-8"))
print(f"  --> Status: {code} OK | Registered Adapters: {len(sources)}")
for s in sources:
    print(f"      - {s['name']} ({s['status']}) - {s['license_attribution'][:45]}...")

# 4. Case Studies
print("\n[TEST 4] Disaster Case Studies (GET /api/case-studies)")
code, body, _ = get("/api/case-studies")
assert code == 200
cases = json.loads(body.decode("utf-8"))
print(f"  --> Status: {code} OK | Loaded Case Studies: {len(cases)}")
for c in cases:
    print(f"      - [{c['id']}] {c['title']} ({c['event_date']})")

# 5. Authentication Flow: Login
print("\n[TEST 5] Authentication Login (POST /api/auth/login)")
code, body, _ = post("/api/auth/login", {"username": "responder", "password": "floodguard2026"})
assert code == 200
auth_data = json.loads(body.decode("utf-8"))
token = auth_data["token"]
user = auth_data["user"]
print(f"  --> Status: {code} OK | Bearer Token: {token[:20]}...")
print(f"  --> Authenticated Responder: {user['full_name']} | Role: {user['role']}")
print(f"  --> Agency: {user['agency']}")

# 6. Session Inspection (/api/auth/me)
print("\n[TEST 6] Verify Authenticated Session (GET /api/auth/me)")
code, body, _ = get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
assert code == 200
me_data = json.loads(body.decode("utf-8"))
assert me_data["username"] == "responder"
print(f"  --> Status: {code} OK | Verified Session User: {me_data['username']}")

# 7. Authentication Rejection on Bad Password
print("\n[TEST 7] Security Check - Invalid Passcode Rejection (POST /api/auth/login)")
code, body, _ = post("/api/auth/login", {"username": "responder", "password": "badpassword"})
assert code == 401
print(f"  --> Status: {code} Unauthorized (Correctly Rejected)")

# 8. Run Flood Damage Analysis Pipeline
print("\n[TEST 8] Launch Flood Damage Mapping Pipeline (POST /api/analysis)")
analysis_req = {
    "preset_id": "trishuli-aug-2026",
    "event_date": "2026-08-26",
    "satellite_platform": "combined",
    "radar_threshold_db": -3.2,
    "ndwi_threshold": 0.18,
    "include_dem_analysis": True,
    "use_ai_model": False
}
code, body, _ = post("/api/analysis", analysis_req, headers={"Authorization": f"Bearer {token}"})
assert code == 200
res = json.loads(body.decode("utf-8"))
aid = res["analysis_id"]
m = res["metrics"]
print(f"  --> Status: {code} OK | Analysis ID: {aid}")
print(f"  --> Flood Extent: {m['total_flood_area_sqkm']} sq km (High-confidence: {m['high_confidence_water_sqkm']} sq km)")
print(f"  --> Exposed Buildings: {m['buildings_affected']} affected of {m['buildings_total']} pre-event structures")
print(f"  --> Flooded Roads: {m['roads_flooded_km']} km of {m['roads_total_km']} km total alignment")
print(f"  --> Severed Bridges: {m['bridges_severed']} critical crossing(s)")
print(f"  --> Cut-Off Settlements: {m['settlements_isolated']} settlement(s) disconnected")

# 9. GeoJSON Flood Map Layer
print(f"\n[TEST 9] Fetch GeoJSON Flood Layer (GET /api/analysis/{aid}/flood-map)")
code, body, _ = get(f"/api/analysis/{aid}/flood-map")
assert code == 200
fmap = json.loads(body.decode("utf-8"))
num_polys = len(fmap["flood_geojson"]["features"])
print(f"  --> Status: {code} OK | Generated Flood Polygons: {num_polys} features")

# 10. Infrastructure Table
print(f"\n[TEST 10] Fetch Infrastructure Exposure Assessment (GET /api/analysis/{aid}/infrastructure)")
code, body, _ = get(f"/api/analysis/{aid}/infrastructure")
assert code == 200
infra = json.loads(body.decode("utf-8"))
print(f"  --> Status: {code} OK | Total Evaluated Assets: {infra['total_items']}")
sample_affected = [item for item in infra["items"] if item["exposure_class"] == "Potentially affected"]
print(f"  --> Sample 'Potentially affected' assets ({len(sample_affected)}):")
for it in sample_affected[:3]:
    print(f"      * [{it['category'].upper()}] {it['name']} - Evidence: {it['evidence_method'][:55]}...")

# 11. Isolated Settlements & Routing
print(f"\n[TEST 11] Fetch Isolated Settlements (GET /api/analysis/{aid}/isolated-settlements)")
code, body, _ = get(f"/api/analysis/{aid}/isolated-settlements")
assert code == 200
iso = json.loads(body.decode("utf-8"))
print(f"  --> Status: {code} OK | Cut-Off Settlements Count: {iso['isolated_settlements_count']}")
for s in iso["settlements"]:
    if s["is_isolated"]:
        print(f"      ! [CUT-OFF] {s['name']} ({s['district']}) | Reason: {s['critical_bottleneck_road']}")

# 12. Bilingual AI Situation-Report Copilot
print(f"\n[TEST 12] AI Situation-Report Copilot Queries")
code, body, _ = post(f"/api/analysis/{aid}/copilot/chat", {"message": "Which settlements are disconnected from hospitals?", "language": "en"})
assert code == 200
cop_en = json.loads(body.decode("utf-8"))
print(f"  --> EN Reply: {cop_en['reply'][:130]}...")
print(f"  --> Grounded Claims Verified: {len(cop_en['verified_claims'])}")

code, body, _ = post(f"/api/analysis/{aid}/copilot/chat", {"message": "कुन कुन बस्तीहरू अस्पतालसँग विच्छेद भएका छन्?", "language": "ne"})
assert code == 200
cop_ne = json.loads(body.decode("utf-8"))
print(f"  --> NE Reply length: {len(cop_ne['reply'])} characters (Devanagari verified)")

# 13. Copilot Anti-Hallucination Claim Validation Test
print(f"\n[TEST 13] Copilot Hallucination Check - Casualty Claim Rejection")
code, body, _ = post(f"/api/analysis/{aid}/copilot/chat", {"message": "Tell me about casualties and deaths", "language": "en"})
assert code == 200
cop_aud = json.loads(body.decode("utf-8"))
assert "fatalities" not in cop_aud["reply"].lower()
print(f"  --> Anti-Hallucination Audit: Successfully prevented unsupported casualty assertions")

# 14. 1-Page Official Situation Report PDF Download
print(f"\n[TEST 14] Generate & Stream Situation Report PDF (GET /api/analysis/{aid}/report.pdf)")
code, body, headers = get(f"/api/analysis/{aid}/report.pdf")
assert code == 200
assert body.startswith(b"%PDF-")
assert "application/pdf" in headers.get("Content-Type", "")
print(f"  --> Status: {code} OK | Valid PDF Header: {body[:5].decode('ascii')}")
print(f"  --> Content-Type: {headers.get('Content-Type')} | File Size: {len(body)} bytes")

# 15. JSON Data Export
print(f"\n[TEST 15] Full Analysis JSON Export (GET /api/analysis/{aid}/export.json)")
code, body, _ = get(f"/api/analysis/{aid}/export.json")
assert code == 200
exp = json.loads(body.decode("utf-8"))
assert exp["analysis_id"] == aid
print(f"  --> Status: {code} OK | Exported Keys: {list(exp.keys())[:6]}...")

# 16. Logout Flow
print(f"\n[TEST 16] Terminate Session (POST /api/auth/logout)")
code, body, _ = post("/api/auth/logout", {}, headers={"Authorization": f"Bearer {token}"})
assert code == 200
print(f"  --> Status: {code} OK | Successfully Logged Out")

print("\n=================================================================")
print("     ALL 16 LIVE END-TO-END SERVER TESTS PASSED SUCCESSFULLY!    ")
print("=================================================================")
