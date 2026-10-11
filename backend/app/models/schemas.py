from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class BBox(BaseModel):
    min_lon: float = Field(..., description="Minimum longitude")
    min_lat: float = Field(..., description="Minimum latitude")
    max_lon: float = Field(..., description="Maximum longitude")
    max_lat: float = Field(..., description="Maximum latitude")


class AnalysisRequest(BaseModel):
    preset_id: Optional[str] = Field(None, description="Preset case study ID, e.g. 'trishuli-aug-2026'")
    aoi_bbox: Optional[BBox] = None
    aoi_geojson: Optional[Dict[str, Any]] = None
    event_date: str = Field("2026-08-26", description="Date of flood event (YYYY-MM-DD)")
    pre_event_window_days: int = Field(14, ge=1, le=60)
    post_event_window_days: int = Field(10, ge=1, le=60)
    satellite_platform: Literal["sentinel-1", "sentinel-2", "combined"] = "combined"
    radar_threshold_db: float = Field(-3.2, description="SAR backscatter difference threshold in dB")
    ndwi_threshold: float = Field(0.18, description="Optical NDWI threshold for water confirmation")
    cloud_threshold_pct: float = Field(40.0, description="Max acceptable optical cloud cover percentage")
    include_dem_analysis: bool = Field(True, description="Enable Copernicus DEM elevation flow corridor analysis")
    use_ai_model: bool = Field(False, description="Enable deep learning segmentation interface")


class SatelliteSceneMetadata(BaseModel):
    platform: str
    product_id: str
    acquisition_date: str
    orbit_direction: Optional[str] = None
    relative_orbit: Optional[int] = None
    cloud_cover_pct: Optional[float] = None
    source_agency: str
    licensing: str


class InfrastructureItem(BaseModel):
    id: str
    category: Literal["building", "road", "bridge", "hospital", "school", "settlement"]
    name: Optional[str] = "Unnamed"
    exposure_class: Literal[
        "Potentially affected",
        "Possibly exposed",
        "No detected overlap",
        "Unknown or insufficient data"
    ]
    evidence_method: str
    confidence: Literal["High", "Medium", "Low"]
    verification_status: str
    coordinates: List[float] = Field(..., description="[longitude, latitude] or representative centroid")
    details: Optional[Dict[str, Any]] = None


class SettlementStatus(BaseModel):
    id: str
    name: str
    district: str
    coordinates: List[float]
    is_isolated: bool
    isolation_reason: str
    nearest_hospital_name: str
    baseline_travel_distance_km: float
    post_event_travel_distance_km: Optional[float] = None
    critical_bottleneck_road: Optional[str] = None
    priority_rank: int
    evidence_quality: str


class FlowPathResult(BaseModel):
    seed_point: List[float]
    path_length_km: float
    estimated_flow_path_geojson: Dict[str, Any]
    settlements_in_corridor: List[str]
    method: str
    uncertainty_notice: str


class EvaluationResult(BaseModel):
    reference_source: str
    precision: float
    recall: float
    f1_score: float
    iou: float
    true_positive_area_sqkm: float
    false_positive_area_sqkm: float
    false_negative_area_sqkm: float
    methodology_note: str


class AnalysisMetrics(BaseModel):
    total_flood_area_sqkm: float
    high_confidence_water_sqkm: float
    debris_sediment_sqkm: float
    uncertain_area_sqkm: float
    buildings_total: int
    buildings_affected: int
    buildings_possibly_exposed: int
    roads_total_km: float
    roads_flooded_km: float
    bridges_total: int
    bridges_severed: int
    hospitals_total: int
    hospitals_affected: int
    settlements_total: int
    settlements_isolated: int


class AnalysisResponse(BaseModel):
    analysis_id: str
    status: Literal["pending", "processing", "completed", "failed"]
    progress_percent: int
    stage_message: str
    created_at: str
    completed_at: Optional[str] = None
    request: AnalysisRequest
    metrics: Optional[AnalysisMetrics] = None
    scenes_used: List[SatelliteSceneMetadata] = []
    flood_geojson: Optional[Dict[str, Any]] = None
    surface_change_geojson: Optional[Dict[str, Any]] = None
    infrastructure_summary: Optional[List[InfrastructureItem]] = None
    isolated_settlements: Optional[List[SettlementStatus]] = None
    evacuation_routes_geojson: Optional[Dict[str, Any]] = None
    flow_path_bonus: Optional[FlowPathResult] = None
    evaluation_benchmark: Optional[EvaluationResult] = None
    limitations: List[str] = []
    attributions: List[str] = []


class CopilotMessageRequest(BaseModel):
    message: str
    language: Literal["en", "ne", "hi", "te", "es", "fr", "bn", "zh"] = "en"


class CopilotMessageResponse(BaseModel):
    reply: str
    language: str
    verified_claims: List[Dict[str, Any]]
    corrections_applied: List[str]
    source_attribution: List[str]


class DataSourceInfo(BaseModel):
    name: str
    provider: str
    access_type: str
    coverage: str
    license_attribution: str
    status: Literal["active", "ready", "cached", "rate_limited", "fallback_available"]


class LoginRequest(BaseModel):
    username: str
    password: str


class UserProfile(BaseModel):
    user_id: str
    username: str
    email: str
    full_name: str
    agency: str
    role: str


class LoginResponse(BaseModel):
    token: str
    token_type: str = "Bearer"
    user: UserProfile
    message: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    agency: str
    role: str = "Disaster Response Coordinator"


