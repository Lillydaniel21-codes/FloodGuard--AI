import sqlite3
import json
from typing import Optional, List, Dict, Any
from backend.app.config import settings


def get_db_connection():
    conn = sqlite3.connect(str(settings.DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        analysis_id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        progress_percent INTEGER DEFAULT 0,
        stage_message TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        completed_at TEXT,
        request_json TEXT NOT NULL,
        metrics_json TEXT,
        scenes_json TEXT,
        flood_geojson TEXT,
        surface_change_geojson TEXT,
        infrastructure_summary_json TEXT,
        isolated_settlements_json TEXT,
        evacuation_routes_geojson TEXT,
        flow_path_json TEXT,
        evaluation_json TEXT,
        limitations_json TEXT,
        attributions_json TEXT
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        agency TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)
    conn.commit()
    conn.close()


def save_user(user_id: str, username: str, email: str, password_hash: str, full_name: str, agency: str, role: str, created_at: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO users (user_id, username, email, password_hash, full_name, agency, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET
        email=excluded.email,
        password_hash=excluded.password_hash,
        full_name=excluded.full_name,
        agency=excluded.agency,
        role=excluded.role;
    """, (user_id, username.lower(), email.lower(), password_hash, full_name, agency, role, created_at))
    conn.commit()
    conn.close()


def get_user_by_identifier(identifier: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    ident = identifier.strip().lower()
    cursor.execute("SELECT * FROM users WHERE username = ? OR email = ?", (ident, ident))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)



def save_analysis_record(
    analysis_id: str,
    status: str,
    progress_percent: int,
    stage_message: str,
    created_at: str,
    request_dict: Dict[str, Any],
    completed_at: Optional[str] = None,
    metrics_dict: Optional[Dict[str, Any]] = None,
    scenes_list: Optional[List[Dict[str, Any]]] = None,
    flood_geojson: Optional[Dict[str, Any]] = None,
    surface_change_geojson: Optional[Dict[str, Any]] = None,
    infrastructure_summary: Optional[List[Dict[str, Any]]] = None,
    isolated_settlements: Optional[List[Dict[str, Any]]] = None,
    evacuation_routes_geojson: Optional[Dict[str, Any]] = None,
    flow_path: Optional[Dict[str, Any]] = None,
    evaluation: Optional[Dict[str, Any]] = None,
    limitations: Optional[List[str]] = None,
    attributions: Optional[List[str]] = None,
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO analyses (
        analysis_id, status, progress_percent, stage_message, created_at, completed_at,
        request_json, metrics_json, scenes_json, flood_geojson, surface_change_geojson,
        infrastructure_summary_json, isolated_settlements_json, evacuation_routes_geojson,
        flow_path_json, evaluation_json, limitations_json, attributions_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(analysis_id) DO UPDATE SET
        status=excluded.status,
        progress_percent=excluded.progress_percent,
        stage_message=excluded.stage_message,
        completed_at=excluded.completed_at,
        metrics_json=coalesce(excluded.metrics_json, analyses.metrics_json),
        scenes_json=coalesce(excluded.scenes_json, analyses.scenes_json),
        flood_geojson=coalesce(excluded.flood_geojson, analyses.flood_geojson),
        surface_change_geojson=coalesce(excluded.surface_change_geojson, analyses.surface_change_geojson),
        infrastructure_summary_json=coalesce(excluded.infrastructure_summary_json, analyses.infrastructure_summary_json),
        isolated_settlements_json=coalesce(excluded.isolated_settlements_json, analyses.isolated_settlements_json),
        evacuation_routes_geojson=coalesce(excluded.evacuation_routes_geojson, analyses.evacuation_routes_geojson),
        flow_path_json=coalesce(excluded.flow_path_json, analyses.flow_path_json),
        evaluation_json=coalesce(excluded.evaluation_json, analyses.evaluation_json),
        limitations_json=coalesce(excluded.limitations_json, analyses.limitations_json),
        attributions_json=coalesce(excluded.attributions_json, analyses.attributions_json);
    """, (
        analysis_id,
        status,
        progress_percent,
        stage_message,
        created_at,
        completed_at,
        json.dumps(request_dict),
        json.dumps(metrics_dict) if metrics_dict else None,
        json.dumps(scenes_list) if scenes_list else None,
        json.dumps(flood_geojson) if flood_geojson else None,
        json.dumps(surface_change_geojson) if surface_change_geojson else None,
        json.dumps(infrastructure_summary) if infrastructure_summary else None,
        json.dumps(isolated_settlements) if isolated_settlements else None,
        json.dumps(evacuation_routes_geojson) if evacuation_routes_geojson else None,
        json.dumps(flow_path) if flow_path else None,
        json.dumps(evaluation) if evaluation else None,
        json.dumps(limitations) if limitations else None,
        json.dumps(attributions) if attributions else None,
    ))
    conn.commit()
    conn.close()


def get_analysis_record(analysis_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses WHERE analysis_id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None

    return {
        "analysis_id": row["analysis_id"],
        "status": row["status"],
        "progress_percent": row["progress_percent"],
        "stage_message": row["stage_message"],
        "created_at": row["created_at"],
        "completed_at": row["completed_at"],
        "request": json.loads(row["request_json"]) if row["request_json"] else {},
        "metrics": json.loads(row["metrics_json"]) if row["metrics_json"] else None,
        "scenes_used": json.loads(row["scenes_json"]) if row["scenes_json"] else [],
        "flood_geojson": json.loads(row["flood_geojson"]) if row["flood_geojson"] else None,
        "surface_change_geojson": json.loads(row["surface_change_geojson"]) if row["surface_change_geojson"] else None,
        "infrastructure_summary": json.loads(row["infrastructure_summary_json"]) if row["infrastructure_summary_json"] else [],
        "isolated_settlements": json.loads(row["isolated_settlements_json"]) if row["isolated_settlements_json"] else [],
        "evacuation_routes_geojson": json.loads(row["evacuation_routes_geojson"]) if row["evacuation_routes_geojson"] else None,
        "flow_path_bonus": json.loads(row["flow_path_json"]) if row["flow_path_json"] else None,
        "evaluation_benchmark": json.loads(row["evaluation_json"]) if row["evaluation_json"] else None,
        "limitations": json.loads(row["limitations_json"]) if row["limitations_json"] else [],
        "attributions": json.loads(row["attributions_json"]) if row["attributions_json"] else [],
    }


def list_recent_analyses(limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT analysis_id, status, progress_percent, stage_message, created_at, completed_at, request_json, metrics_json
        FROM analyses ORDER BY created_at DESC LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        results.append({
            "analysis_id": r["analysis_id"],
            "status": r["status"],
            "progress_percent": r["progress_percent"],
            "stage_message": r["stage_message"],
            "created_at": r["created_at"],
            "completed_at": r["completed_at"],
            "request": json.loads(r["request_json"]) if r["request_json"] else {},
            "metrics": json.loads(r["metrics_json"]) if r["metrics_json"] else None,
        })
    return results
