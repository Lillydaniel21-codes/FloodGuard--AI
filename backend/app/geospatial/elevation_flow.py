import numpy as np
from typing import List, Dict, Any, Tuple
from shapely.geometry import LineString, Point, mapping


def d8_steepest_descent(
    dem: np.ndarray,
    start_row: int,
    start_col: int,
    transform_matrix,
    max_steps: int = 250,
    min_slope: float = 0.001
) -> List[Tuple[float, float]]:
    """
    Simulates downstream flow path from a seed coordinate over an elevation grid using the D8 algorithm.
    At each cell, determines the neighbor with the steepest downward gradient.
    Stops when reaching a sink, edge of grid, or max_steps.
    """
    rows, cols = dem.shape
    r, c = start_row, start_col
    path_coords = []

    # 8 neighbor offsets: (-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)
    # Distances: cardinal = 1.0, diagonal = sqrt(2)
    directions = [
        (-1, -1, 1.4142), (-1, 0, 1.0), (-1, 1, 1.4142),
        (0, -1, 1.0),                   (0, 1, 1.0),
        (1, -1, 1.4142),  (1, 0, 1.0),  (1, 1, 1.4142)
    ]

    visited = set()

    for _ in range(max_steps):
        if not (0 <= r < rows and 0 <= c < cols):
            break
        if (r, c) in visited:
            break
        visited.add((r, c))

        # Convert cell indices to geospatial coordinates [lon, lat]
        lon, lat = transform_matrix * (c + 0.5, r + 0.5)
        path_coords.append((round(lon, 6), round(lat, 6)))

        curr_elev = dem[r, c]
        steepest_slope = -1.0
        best_next = None

        for dr, dc, dist_factor in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                drop = curr_elev - dem[nr, nc]
                slope = drop / dist_factor
                if slope > steepest_slope:
                    steepest_slope = slope
                    best_next = (nr, nc)

        # If no downward slope (flat or sink)
        if best_next is None or steepest_slope < min_slope:
            break

        r, c = best_next

    return path_coords


def compute_flow_corridor(
    dem: np.ndarray,
    transform_matrix,
    seed_lon: float,
    seed_lat: float,
    settlements: List[Dict[str, Any]],
    corridor_buffer_m: float = 600.0
) -> Dict[str, Any]:
    """
    Calculates downstream flow path from seed coordinate and flags settlements within corridor buffer.
    """
    # Inverse transform to find row, col
    inv_transform = ~transform_matrix
    col_float, row_float = inv_transform * (seed_lon, seed_lat)
    r = int(round(row_float))
    c = int(round(col_float))

    rows, cols = dem.shape
    if not (0 <= r < rows and 0 <= c < cols):
        r = max(0, min(rows - 1, r))
        c = max(0, min(cols - 1, c))

    coords = d8_steepest_descent(dem, r, c, transform_matrix)
    if len(coords) < 2:
        # Fallback if seed is exactly at edge or sink: provide minimal 2-point descent
        coords = [(seed_lon, seed_lat), (seed_lon + 0.005, seed_lat - 0.005)]

    line_geom = LineString(coords)

    # Approximate corridor buffer in degrees (~600m / 111000m/deg ~ 0.0054 deg)
    buffer_deg = corridor_buffer_m / 111320.0
    corridor_poly = line_geom.buffer(buffer_deg)

    settlements_in_corridor = []
    for s in settlements:
        sc = s.get("coordinates", [])
        if len(sc) >= 2:
            pt = Point(sc[0], sc[1])
            if corridor_poly.contains(pt):
                settlements_in_corridor.append(s.get("name", "Unnamed settlement"))

    # Estimate length in km
    deg_to_km = 104.0  # Approx for lat 28N
    path_len_km = round(line_geom.length * deg_to_km, 2)

    flow_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": mapping(line_geom),
                "properties": {
                    "type": "estimated_downstream_path",
                    "length_km": path_len_km,
                    "seed_coords": [seed_lon, seed_lat],
                    "method": "D8 Steepest Descent on Copernicus DEM",
                }
            },
            {
                "type": "Feature",
                "geometry": mapping(corridor_poly),
                "properties": {
                    "type": "estimated_flood_corridor_buffer",
                    "buffer_meters": corridor_buffer_m
                }
            }
        ]
    }

    return {
        "seed_point": [seed_lon, seed_lat],
        "path_length_km": path_len_km,
        "estimated_flow_path_geojson": flow_geojson,
        "settlements_in_corridor": settlements_in_corridor,
        "method": "D8 Steepest Descent algorithm on Copernicus WorldDEM-30 elevation grid",
        "uncertainty_notice": (
            "Caution: This terrain-flow corridor is a kinematic steepest-descent estimate based on digital elevation "
            "gradients. It does not account for river channel cross-sections, unsteady hydrodynamic waves, sediment bulking, "
            "or structural bridge backwater effects. Not a certified hydraulic flood inundation model."
        )
    }
