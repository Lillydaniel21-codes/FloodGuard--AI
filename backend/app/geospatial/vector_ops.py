import numpy as np
import rasterio.features
from shapely.geometry import shape, mapping, Polygon, MultiPolygon, LineString, Point, box
from shapely.ops import unary_union, transform
import pyproj
from typing import List, Dict, Any, Tuple, Optional


def mask_to_geojson_polygons(
    mask: np.ndarray,
    transform_matrix: rasterio.Affine,
    min_area_pixels: int = 4,
    properties_template: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Convert a boolean binary raster mask into a GeoJSON FeatureCollection of polygons.
    Filters out isolated single-pixel noise below min_area_pixels.
    """
    if not np.any(mask):
        return {"type": "FeatureCollection", "features": []}

    features = []
    # rasterio.features.shapes extracts contours with the spatial affine transform
    shapes_gen = rasterio.features.shapes(
        mask.astype(np.uint8),
        mask=(mask > 0),
        transform=transform_matrix,
        connectivity=8
    )

    for geom_dict, val in shapes_gen:
        if val != 1:
            continue
        geom = shape(geom_dict)
        if geom.is_empty or not geom.is_valid:
            geom = geom.buffer(0)
            if geom.is_empty:
                continue

        # Approximate pixel count check
        pixel_width = abs(transform_matrix.a)
        pixel_height = abs(transform_matrix.e)
        approx_pixel_area = pixel_width * pixel_height
        if geom.area < (min_area_pixels * approx_pixel_area):
            continue

        props = dict(properties_template or {})
        features.append({
            "type": "Feature",
            "geometry": mapping(geom),
            "properties": props
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }


def calculate_polygon_area_sqkm(
    geom_or_geojson: Any,
    source_crs: str = "EPSG:4326",
    target_utm_crs: str = "EPSG:32645"  # UTM Zone 45N covers Nepal (84°E to 90°E)
) -> float:
    """
    Calculate accurate projected planar area in square kilometers.
    Transforms WGS84 geographic coordinates to UTM projected coordinates in meters.
    """
    if isinstance(geom_or_geojson, dict):
        if geom_or_geojson.get("type") == "FeatureCollection":
            total_sqkm = 0.0
            for feat in geom_or_geojson.get("features", []):
                total_sqkm += calculate_polygon_area_sqkm(feat.get("geometry", {}), source_crs, target_utm_crs)
            return round(total_sqkm, 4)
        elif geom_or_geojson.get("type") == "Feature":
            return calculate_polygon_area_sqkm(geom_or_geojson.get("geometry", {}), source_crs, target_utm_crs)
        else:
            geom = shape(geom_or_geojson)
    else:
        geom = geom_or_geojson

    if geom.is_empty:
        return 0.0

    try:
        project = pyproj.Transformer.from_crs(source_crs, target_utm_crs, always_xy=True).transform
        projected_geom = transform(project, geom)
        area_m2 = projected_geom.area
        return round(area_m2 / 1_000_000.0, 4)
    except Exception:
        # Fallback approximation at 28° latitude: 1 deg lat ~ 110.8 km, 1 deg lon ~ 98.2 km
        lat_approx_deg = 28.0
        deg_lon_km = 111.32 * np.cos(np.radians(lat_approx_deg))
        deg_lat_km = 110.85
        return round(geom.area * (deg_lon_km * deg_lat_km), 4)


def calculate_line_length_km(
    geom_or_geojson: Any,
    source_crs: str = "EPSG:4326",
    target_utm_crs: str = "EPSG:32645"
) -> float:
    """Calculate accurate line length in kilometers using projected coordinates."""
    if isinstance(geom_or_geojson, dict):
        geom = shape(geom_or_geojson)
    else:
        geom = geom_or_geojson

    if geom.is_empty:
        return 0.0

    try:
        project = pyproj.Transformer.from_crs(source_crs, target_utm_crs, always_xy=True).transform
        projected_geom = transform(project, geom)
        length_m = projected_geom.length
        return round(length_m / 1000.0, 3)
    except Exception:
        # Fallback length approx
        lat_approx_deg = 28.0
        deg_lon_km = 111.32 * np.cos(np.radians(lat_approx_deg))
        deg_lat_km = 110.85
        coords = list(geom.coords)
        total_km = 0.0
        for i in range(len(coords) - 1):
            dx = (coords[i+1][0] - coords[i][0]) * deg_lon_km
            dy = (coords[i+1][1] - coords[i][1]) * deg_lat_km
            total_km += np.hypot(dx, dy)
        return round(total_km, 3)


def get_unified_geometry(geojson_fc: Dict[str, Any]):
    """Unify all polygon features into a single validated Shapely geometry."""
    geoms = []
    for feat in geojson_fc.get("features", []):
        g = shape(feat.get("geometry", {}))
        if not g.is_empty and g.is_valid:
            geoms.append(g)
    if not geoms:
        return Polygon()
    return unary_union(geoms)
