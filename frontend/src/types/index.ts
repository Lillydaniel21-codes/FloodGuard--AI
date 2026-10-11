export interface BBox {
  min_lon: number;
  min_lat: number;
  max_lon: number;
  max_lat: number;
}

export interface AnalysisRequest {
  preset_id?: string;
  aoi_bbox?: BBox;
  event_date: string;
  pre_event_window_days: number;
  post_event_window_days: number;
  satellite_platform: 'sentinel-1' | 'sentinel-2' | 'combined';
  radar_threshold_db: number;
  ndwi_threshold: number;
  cloud_threshold_pct: number;
  include_dem_analysis: boolean;
  use_ai_model: boolean;
}

export interface SatelliteSceneMetadata {
  platform: string;
  product_id: string;
  acquisition_date: string;
  orbit_direction?: string;
  relative_orbit?: number;
  cloud_cover_pct?: number;
  source_agency: string;
  licensing: string;
}

export interface InfrastructureItem {
  id: string;
  category: 'building' | 'road' | 'bridge' | 'hospital' | 'school' | 'settlement';
  name?: string;
  exposure_class: 'Potentially affected' | 'Possibly exposed' | 'No detected overlap' | 'Unknown or insufficient data';
  evidence_method: string;
  confidence: 'High' | 'Medium' | 'Low';
  verification_status: string;
  coordinates: [number, number];
  details?: Record<string, any>;
}

export interface SettlementStatus {
  id: string;
  name: string;
  district: string;
  coordinates: [number, number];
  is_isolated: boolean;
  isolation_reason: string;
  nearest_hospital_name: string;
  baseline_travel_distance_km: number;
  post_event_travel_distance_km?: number | null;
  critical_bottleneck_road?: string | null;
  priority_rank: number;
  evidence_quality: string;
}

export interface FlowPathResult {
  seed_point: [number, number];
  path_length_km: number;
  estimated_flow_path_geojson: any;
  settlements_in_corridor: string[];
  method: string;
  uncertainty_notice: string;
}

export interface EvaluationResult {
  reference_source: string;
  precision: number;
  recall: number;
  f1_score: number;
  iou: number;
  true_positive_area_sqkm: number;
  false_positive_area_sqkm: number;
  false_negative_area_sqkm: number;
  methodology_note: string;
}

export interface AnalysisMetrics {
  total_flood_area_sqkm: number;
  high_confidence_water_sqkm: number;
  debris_sediment_sqkm: number;
  uncertain_area_sqkm: number;
  buildings_total: number;
  buildings_affected: number;
  buildings_possibly_exposed: number;
  roads_total_km: number;
  roads_flooded_km: number;
  bridges_total: number;
  bridges_severed: number;
  hospitals_total: number;
  hospitals_affected: number;
  settlements_total: number;
  settlements_isolated: number;
}

export interface AnalysisResponse {
  analysis_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percent: number;
  stage_message: string;
  created_at: string;
  completed_at?: string;
  request: AnalysisRequest;
  metrics?: AnalysisMetrics;
  scenes_used: SatelliteSceneMetadata[];
  flood_geojson?: any;
  surface_change_geojson?: any;
  infrastructure_summary?: InfrastructureItem[];
  isolated_settlements?: SettlementStatus[];
  evacuation_routes_geojson?: any;
  flow_path_bonus?: FlowPathResult;
  evaluation_benchmark?: EvaluationResult;
  limitations: string[];
  attributions: string[];
}

export interface CaseStudyPreset {
  id: string;
  title: string;
  country: string;
  region: string;
  event_date: string;
  bbox: BBox;
  description: string;
  recommended_platform: 'sentinel-1' | 'sentinel-2' | 'combined';
  has_emsr_reference: boolean;
}

export interface DataSourceInfo {
  name: string;
  provider: string;
  access_type: string;
  coverage: string;
  license_attribution: string;
  status: string;
}

export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  agency: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  user: UserProfile;
  message: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  agency?: string;
  role?: string;
}

export type SupportedLanguage = 'en' | 'ne' | 'hi' | 'te' | 'es' | 'fr' | 'bn' | 'zh';

