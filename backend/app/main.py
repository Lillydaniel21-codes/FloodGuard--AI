import uuid
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks, Response, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.models.schemas import (
    AnalysisRequest, AnalysisResponse, AnalysisMetrics,
    CopilotMessageRequest, CopilotMessageResponse, DataSourceInfo,
    LoginRequest, LoginResponse, UserProfile, RegisterRequest
)
from backend.app.models.db import (
    init_db, get_analysis_record, save_analysis_record, list_recent_analyses,
    save_user, get_user_by_identifier
)
from backend.app.analysis.pipeline import run_floodguard_pipeline
from backend.app.ai.copilot import SituationReportCopilot
from backend.app.reports.pdf_generator import generate_situation_report_pdf
from backend.app.geospatial.data_store import TRISHULI_BBOX, TRISHULI_SETTLEMENTS

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("floodguard")

# Initialize database
init_db()

app = FastAPI(
    title="FloodGuard AI API",
    description="Satellite-Powered Flood Damage Mapping and Rescue Intelligence Backend",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active responder session store
ACTIVE_SESSIONS: Dict[str, UserProfile] = {}

# Default registered emergency responders
REGISTERED_RESPONDERS = {
    "responder": {
        "password": "floodguard2026",
        "profile": UserProfile(
            user_id="usr_resp_01",
            username="responder",
            email="responder@floodguard.ai",
            full_name="Capt. Saurav Sharma",
            agency="Nepal NDRRMA / Armed Police Disaster Response",
            role="Field GIS Coordinator"
        )
    },
    "commander": {
        "password": "disaster2026",
        "profile": UserProfile(
            user_id="usr_cmd_02",
            username="commander",
            email="commander@floodguard.ai",
            full_name="Dr. Pratima Thapa",
            agency="UN OCHA / Nepal Emergency Operations Center",
            role="Incident Commander"
        )
    },
    "admin": {
        "password": "floodguard2026",
        "profile": UserProfile(
            user_id="usr_adm_03",
            username="admin",
            email="admin@floodguard.ai",
            full_name="Geospatial AI Lead",
            agency="FloodGuard AI Operations",
            role="System Administrator"
        )
    }
}


@app.post("/api/auth/register", response_model=LoginResponse)
def register(req: RegisterRequest):
    """
    Registers a new disaster response coordinator or field analyst.
    Persists profile in SQLite database and issues active session token.
    """
    username = req.username.strip().lower()
    email = req.email.strip().lower()

    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    existing = get_user_by_identifier(username) or get_user_by_identifier(email)
    if existing:
        raise HTTPException(status_code=409, detail="A user with that username or email already exists.")

    user_id = f"usr_{uuid.uuid4().hex[:8]}"
    created_at = "2026-10-11T00:00:00Z"

    save_user(
        user_id=user_id,
        username=username,
        email=email,
        password_hash=req.password,
        full_name=req.full_name.strip(),
        agency=req.agency.strip() or "Disaster Response Volunteer",
        role=req.role.strip() or "Operations Analyst",
        created_at=created_at
    )

    profile = UserProfile(
        user_id=user_id,
        username=username,
        email=email,
        full_name=req.full_name.strip(),
        agency=req.agency.strip() or "Disaster Response Volunteer",
        role=req.role.strip() or "Operations Analyst"
    )

    token = f"fg_token_{uuid.uuid4().hex}"
    ACTIVE_SESSIONS[token] = profile

    return LoginResponse(
        token=token,
        token_type="Bearer",
        user=profile,
        message="Registration successful. Incident command access granted."
    )


@app.post("/api/auth/login", response_model=LoginResponse)
def login(creds: LoginRequest):
    """
    Authenticate emergency responders and disaster response coordinators.
    Accepts valid responder credentials and issues an active session token.
    """
    ident = creds.username.strip().lower()

    # 1. Check default in-memory accounts
    user_record = REGISTERED_RESPONDERS.get(ident)
    if user_record:
        if creds.password != user_record["password"]:
            raise HTTPException(status_code=401, detail="Invalid password for registered responder account.")
        profile = user_record["profile"]
    else:
        # 2. Check SQLite persistent database
        db_user = get_user_by_identifier(ident)
        if db_user:
            if creds.password != db_user["password_hash"]:
                raise HTTPException(status_code=401, detail="Invalid password.")
            profile = UserProfile(
                user_id=db_user["user_id"],
                username=db_user["username"],
                email=db_user["email"],
                full_name=db_user["full_name"],
                agency=db_user["agency"],
                role=db_user["role"]
            )
        else:
            # 3. Fallback for hackathon testing with master password
            if creds.password == "floodguard2026":
                profile = UserProfile(
                    user_id=f"usr_{uuid.uuid4().hex[:8]}",
                    username=creds.username,
                    email=f"{ident}@disaster-response.org",
                    full_name=creds.username.capitalize() + " (Responder)",
                    agency="National Disaster Risk Reduction & Management Authority",
                    role="Operations Analyst"
                )
            else:
                raise HTTPException(status_code=401, detail="Invalid username or password. Default: responder / floodguard2026")

    token = f"fg_token_{uuid.uuid4().hex}"
    ACTIVE_SESSIONS[token] = profile

    return LoginResponse(
        token=token,
        token_type="Bearer",
        user=profile,
        message="Authentication successful. Incident command session active."
    )


@app.post("/api/auth/logout")
def logout(authorization: Optional[str] = Header(None)):
    """Terminates responder incident command session."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
        ACTIVE_SESSIONS.pop(token, None)
    return {"status": "success", "message": "Logged out successfully."}


@app.get("/api/auth/me", response_model=UserProfile)
def get_current_user(authorization: Optional[str] = Header(None)):
    """Retrieves current authenticated responder profile."""
    if not authorization or not authorization.startswith("Bearer "):
        # Return default commander profile if no token provided
        return REGISTERED_RESPONDERS["commander"]["profile"]

    token = authorization.split("Bearer ", 1)[1].strip()
    profile = ACTIVE_SESSIONS.get(token)
    if not profile:
        return REGISTERED_RESPONDERS["commander"]["profile"]
    return profile


@app.post("/api/copilot/chat", response_model=CopilotMessageResponse)
def global_copilot_chat(payload: CopilotMessageRequest):
    """
    Global AI Situation-Report Copilot endpoint available from anywhere (home page, floating chatbot).
    Answers queries grounded in recent analysis or baseline case study facts.
    """
    recents = list_recent_analyses(limit=1)
    rec = None
    if recents:
        rec = get_analysis_record(recents[0]["analysis_id"])

    if not rec:
        # Fallback to simulated baseline data
        rec = {
            "metrics": {
                "total_flood_area_sqkm": 25.99,
                "high_confidence_water_sqkm": 22.88,
                "debris_sediment_sqkm": 3.12,
                "buildings_affected": 5,
                "buildings_total": 20,
                "roads_flooded_km": 8.76,
                "roads_total_km": 52.99,
                "bridges_severed": 1,
                "settlements_isolated": 5
            },
            "isolated_settlements": [
                {"name": "Trishuli Bazaar", "is_isolated": True, "critical_bottleneck_road": "Kathmandu-Bidur Highway"},
                {"name": "Betrawati", "is_isolated": True, "critical_bottleneck_road": "Betrawati Trishuli Crossing Bridge"},
                {"name": "Dhunche", "is_isolated": True, "critical_bottleneck_road": "Pasang Lhamu Highway NH09"}
            ]
        }

    copilot = SituationReportCopilot(rec)
    return copilot.generate_chat_response(payload.message, language=payload.language)




@app.get("/api/health")
def health_check():
    """Health check endpoint indicating operational status of backend services."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "copernicus_configured": bool(settings.CDSE_CLIENT_ID and settings.CDSE_CLIENT_SECRET),
        "llm_copilot_mode": "Gemini API" if settings.GEMINI_API_KEY else ("OpenAI API" if settings.OPENAI_API_KEY else "Deterministic Grounded Engine")
    }


@app.get("/api/data-sources", response_model=List[DataSourceInfo])
def get_data_sources():
    """Returns registered data sources, access status, coverage, and licensing attributions."""
    return [
        DataSourceInfo(
            name="Sentinel-1 SAR (C-band)",
            provider="Copernicus Data Space Ecosystem (ESA)",
            access_type="Live STAC API with cached offline benchmarks",
            coverage="Global / Trishuli River Basin (Orbit 121, 2026-08-16 & 2026-08-28)",
            license_attribution="Contains modified Copernicus Sentinel data 2026",
            status="active"
        ),
        DataSourceInfo(
            name="Sentinel-2 Optical MSI (Level-2A)",
            provider="Copernicus Data Space Ecosystem (ESA)",
            access_type="Live STAC API with cached offline benchmarks",
            coverage="Trishuli River Basin (2026-08-18 & 2026-08-29, 46.8% monsoonal clouds)",
            license_attribution="Contains modified Copernicus Sentinel data 2026",
            status="active"
        ),
        DataSourceInfo(
            name="Copernicus WorldDEM-30 (30m Elevation)",
            provider="Copernicus / DLR / Airbus",
            access_type="Digital Elevation Model Grid",
            coverage="Nepal Himalaya (Trishuli & Langtang Valleys)",
            license_attribution="Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018",
            status="active"
        ),
        DataSourceInfo(
            name="OpenStreetMap Historical Snapshot",
            provider="OpenStreetMap / ohsome / Overpass",
            access_type="Point-in-Time Query ([date: 2026-08-25T00:00:00Z])",
            coverage="Nuwakot & Rasuwa Districts (Buildings, Roads, Bridges, Health Facilities)",
            license_attribution="© OpenStreetMap contributors (ODbL)",
            status="active"
        ),
        DataSourceInfo(
            name="Copernicus EMS Rapid Mapping EMSR927",
            provider="Copernicus Emergency Management Service",
            access_type="Evaluation Benchmark Reference (Post-Hoc Cross-Validation Only)",
            coverage="Trishuli River Valley (Observed flood delineation)",
            license_attribution="Copernicus Emergency Management Service EMSR927",
            status="ready"
        )
    ]


@app.get("/api/case-studies")
def list_case_studies():
    """Lists preconfigured historical and benchmark disaster events."""
    return [
        {
            "id": "trishuli-aug-2026",
            "title": "Trishuli River Flood & Debris Surge (Principal Hackathon Case Study)",
            "country": "Nepal",
            "region": "Nuwakot and Rasuwa Districts",
            "event_date": "2026-08-26",
            "bbox": TRISHULI_BBOX,
            "description": "Massive glacial/debris outburst surge down Trishuli gorge, washing out Betrawati crossing bridge and isolating Dhunche/upper Rasuwa.",
            "recommended_platform": "combined",
            "has_emsr_reference": True
        },
        {
            "id": "melamchi-june-2021",
            "title": "Melamchi Debris Flow & Flood (Historical Reference)",
            "country": "Nepal",
            "region": "Helambu / Melamchi, Sindhupalchok",
            "event_date": "2021-06-15",
            "bbox": {"min_lon": 85.50, "min_lat": 27.80, "max_lon": 85.65, "max_lat": 28.05},
            "description": "High-altitude compound disaster washing out bridges and headworks in Sindhupalchok.",
            "recommended_platform": "sentinel-1",
            "has_emsr_reference": False
        }
    ]


def _background_analysis_runner(request: AnalysisRequest, analysis_id: str):
    try:
        run_floodguard_pipeline(request, analysis_id=analysis_id)
    except Exception as e:
        logger.error(f"Analysis failed for {analysis_id}: {e}", exc_info=True)
        save_analysis_record(
            analysis_id=analysis_id,
            status="failed",
            progress_percent=0,
            stage_message=f"Pipeline error: {str(e)}",
            created_at="",
            request_dict=request.model_dump()
        )


@app.post("/api/analysis")
def create_analysis(request: AnalysisRequest, background_tasks: BackgroundTasks, async_mode: bool = False):
    """
    Submits a flood damage analysis request.
    If async_mode is True, runs in the background. Otherwise runs synchronously.
    """
    analysis_id = str(uuid.uuid4())
    logger.info(f"Initiating analysis {analysis_id} for date {request.event_date}")

    if async_mode:
        background_tasks.add_task(_background_analysis_runner, request, analysis_id)
        return {
            "analysis_id": analysis_id,
            "status": "processing",
            "message": "Analysis launched asynchronously in background."
        }
    else:
        # Synchronous execution
        response = run_floodguard_pipeline(request, analysis_id=analysis_id)
        return response


@app.get("/api/analysis/{analysis_id}")
def get_analysis(analysis_id: str):
    """Retrieves full analysis record by ID."""
    rec = get_analysis_record(analysis_id)
    if not rec:
        raise HTTPException(status_code=404, detail=f"Analysis ID {analysis_id} not found.")
    return rec


@app.get("/api/analysis/{analysis_id}/flood-map")
def get_flood_map(analysis_id: str):
    """Returns detected candidate flood and surface change GeoJSON polygons."""
    rec = get_analysis_record(analysis_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return {
        "analysis_id": analysis_id,
        "flood_geojson": rec.get("flood_geojson"),
        "surface_change_geojson": rec.get("surface_change_geojson"),
        "total_flood_area_sqkm": rec.get("metrics", {}).get("total_flood_area_sqkm", 0.0),
        "debris_sediment_sqkm": rec.get("metrics", {}).get("debris_sediment_sqkm", 0.0)
    }


@app.get("/api/analysis/{analysis_id}/infrastructure")
def get_infrastructure(analysis_id: str, category: Optional[str] = None):
    """Returns detailed infrastructure exposure assessment table."""
    rec = get_analysis_record(analysis_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    items = rec.get("infrastructure_summary") or []
    if category:
        items = [i for i in items if i.get("category") == category]
    return {
        "analysis_id": analysis_id,
        "total_items": len(items),
        "items": items
    }


@app.get("/api/analysis/{analysis_id}/isolated-settlements")
def get_isolated_settlements(analysis_id: str):
    """Returns road network accessibility audit and isolated settlements."""
    rec = get_analysis_record(analysis_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    settlements = rec.get("isolated_settlements") or []
    return {
        "analysis_id": analysis_id,
        "total_settlements": len(settlements),
        "isolated_settlements_count": sum(1 for s in settlements if s.get("is_isolated")),
        "settlements": settlements,
        "evacuation_routes_geojson": rec.get("evacuation_routes_geojson")
    }


@app.get("/api/analysis/{analysis_id}/metrics")
def get_metrics(analysis_id: str):
    """Returns deterministic geospatial summary metrics."""
    rec = get_analysis_record(analysis_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return rec.get("metrics")


@app.post("/api/analysis/{analysis_id}/copilot/chat", response_model=CopilotMessageResponse)
def copilot_chat(analysis_id: str, payload: CopilotMessageRequest):
    """
    Bilingual (English / Nepali) Situation Report Copilot Chat.
    All replies are strictly grounded in deterministic calculations and audited by claim validation.
    """
    rec = get_analysis_record(analysis_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    copilot = SituationReportCopilot(rec)
    res = copilot.generate_chat_response(payload.message, language=payload.language)
    return res


@app.post("/api/analysis/{analysis_id}/report")
def generate_report_json(analysis_id: str):
    """Generates structured one-page situation report content in JSON format."""
    rec = get_analysis_record(analysis_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    copilot = SituationReportCopilot(rec)
    en_summary = copilot.generate_chat_response("Give me a comprehensive situation summary", language="en")
    ne_summary = copilot.generate_chat_response("विपद् स्थिति सारांश दिनुहोस्", language="ne")

    return {
        "analysis_id": analysis_id,
        "event_date": rec.get("request", {}).get("event_date"),
        "metrics": rec.get("metrics"),
        "english_report": en_summary.get("reply"),
        "nepali_report": ne_summary.get("reply"),
        "verified_claims": en_summary.get("verified_claims"),
        "limitations": rec.get("limitations"),
        "attributions": rec.get("attributions")
    }


@app.get("/api/analysis/{analysis_id}/report.pdf")
def download_report_pdf(analysis_id: str):
    """Generates and streams the official 1-page Situation Report PDF."""
    rec = get_analysis_record(analysis_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    pdf_bytes = generate_situation_report_pdf(rec)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=FloodGuard_SitRep_{analysis_id[:8]}.pdf"
        }
    )


@app.get("/api/analysis/{analysis_id}/export.json")
def export_full_analysis_json(analysis_id: str):
    """Exports entire verified geospatial analysis as machine-readable JSON."""
    rec = get_analysis_record(analysis_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return JSONResponse(content=rec)


@app.get("/api/recent-analyses")
def get_recent_analyses(limit: int = Query(5, ge=1, le=20)):
    """Lists recent analysis runs."""
    return list_recent_analyses(limit)


# Mount compiled frontend static files if available
frontend_dist_dir = settings.PROJECT_ROOT / "frontend" / "dist"
if frontend_dist_dir.exists():
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    # Mount assets
    assets_dir = frontend_dist_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    # Fallback to index.html for SPA routing
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = frontend_dist_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        index_file = frontend_dist_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"message": "Frontend not found"})

