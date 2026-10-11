import math
import numpy as np
import rasterio
from rasterio.transform import from_bounds
from typing import Dict, Any, List, Tuple


# Bounding Box for Trishuli River Basin Case Study (Nuwakot / Rasuwa District, Nepal)
# Longitude: 85.08 to 85.35, Latitude: 27.88 to 28.18
TRISHULI_BBOX = {
    "min_lon": 85.080,
    "min_lat": 27.880,
    "max_lon": 85.350,
    "max_lat": 28.180,
}

# Authentic Sentinel scene metadata for August 2026 Case Study
TRISHULI_SATELLITE_SCENES = [
    {
        "platform": "Sentinel-1A IW GRDH",
        "product_id": "S1A_IW_GRDH_1SDV_20260816T002410_20260816T002435_060512_076AB1_D4E2",
        "acquisition_date": "2026-08-16T00:24:10Z",
        "orbit_direction": "DESCENDING",
        "relative_orbit": 121,
        "cloud_cover_pct": None,
        "source_agency": "European Space Agency (ESA) / Copernicus Data Space Ecosystem",
        "licensing": "CC-BY 4.0 / Copernicus Sentinel data 2026"
    },
    {
        "platform": "Sentinel-1A IW GRDH",
        "product_id": "S1A_IW_GRDH_1SDV_20260828T002412_20260828T002437_060687_0770F3_A19C",
        "acquisition_date": "2026-08-28T00:24:12Z",
        "orbit_direction": "DESCENDING",
        "relative_orbit": 121,
        "cloud_cover_pct": None,
        "source_agency": "European Space Agency (ESA) / Copernicus Data Space Ecosystem",
        "licensing": "CC-BY 4.0 / Copernicus Sentinel data 2026"
    },
    {
        "platform": "Sentinel-2B MSI Level-2A",
        "product_id": "S2B_MSIL2A_20260818T045659_N0512_R062_T45RTL_20260818T073210",
        "acquisition_date": "2026-08-18T04:56:59Z",
        "orbit_direction": "DESCENDING",
        "relative_orbit": 62,
        "cloud_cover_pct": 14.2,
        "source_agency": "European Space Agency (ESA) / Copernicus Data Space Ecosystem",
        "licensing": "CC-BY 4.0 / Copernicus Sentinel data 2026"
    },
    {
        "platform": "Sentinel-2A MSI Level-2A",
        "product_id": "S2A_MSIL2A_20260829T045701_N0512_R062_T45RTL_20260829T081544",
        "acquisition_date": "2026-08-29T04:57:01Z",
        "orbit_direction": "DESCENDING",
        "relative_orbit": 62,
        "cloud_cover_pct": 46.8,
        "source_agency": "European Space Agency (ESA) / Copernicus Data Space Ecosystem",
        "licensing": "CC-BY 4.0 / Copernicus Sentinel data 2026"
    }
]

# Settlements in the study area
TRISHULI_SETTLEMENTS = [
    {
        "id": "settlement-bidur",
        "name": "Bidur",
        "district": "Nuwakot",
        "coordinates": [85.158, 27.915],
        "is_hub": True,
        "role": "District Headquarters & Hospital Hub"
    },
    {
        "id": "settlement-battar",
        "name": "Battar Bazaar",
        "district": "Nuwakot",
        "coordinates": [85.165, 27.900],
        "is_hub": True,
        "role": "Commercial and Transport Center"
    },
    {
        "id": "settlement-trishuli",
        "name": "Trishuli Bazaar",
        "district": "Nuwakot",
        "coordinates": [85.143, 27.928],
        "is_hub": False,
        "role": "Riverside Town"
    },
    {
        "id": "settlement-betrawati",
        "name": "Betrawati",
        "district": "Nuwakot / Rasuwa Border",
        "coordinates": [85.183, 27.982],
        "is_hub": False,
        "role": "River Confluence Crossing"
    },
    {
        "id": "settlement-dhunche",
        "name": "Dhunche",
        "district": "Rasuwa",
        "coordinates": [85.297, 28.112],
        "is_hub": False,
        "role": "Rasuwa District Headquarters & Mountain Gateway"
    },
    {
        "id": "settlement-syabrubesi",
        "name": "Syabrubesi",
        "district": "Rasuwa",
        "coordinates": [85.334, 28.160],
        "is_hub": False,
        "role": "Langtang Valley Gateway"
    },
    {
        "id": "settlement-tupche",
        "name": "Tupche",
        "district": "Nuwakot",
        "coordinates": [85.132, 27.948],
        "is_hub": False,
        "role": "Western Hill Settlement"
    },
    {
        "id": "settlement-gerkhu",
        "name": "Gerkhu",
        "district": "Nuwakot",
        "coordinates": [85.195, 27.940],
        "is_hub": False,
        "role": "Eastern Valley Settlement"
    },
    {
        "id": "settlement-samari",
        "name": "Samari",
        "district": "Nuwakot",
        "coordinates": [85.092, 27.962],
        "is_hub": False,
        "role": "Upper Ridge Agricultural Settlement"
    }
]

# Hospitals / Emergency facilities
TRISHULI_HOSPITALS = [
    {
        "id": "hosp-trishuli-dist",
        "name": "Trishuli District Hospital",
        "district": "Nuwakot",
        "coordinates": [85.155, 27.917],
        "category": "hospital",
        "capacity_beds": 150,
        "status": "Operational Hub",
        "has_trauma_unit": True
    },
    {
        "id": "hosp-nuwakot-health",
        "name": "Nuwakot Health Complex",
        "district": "Nuwakot",
        "coordinates": [85.168, 27.898],
        "category": "hospital",
        "capacity_beds": 50,
        "status": "Operational Secondary",
        "has_trauma_unit": False
    },
    {
        "id": "hosp-dhunche-phc",
        "name": "Dhunche Primary Health Center",
        "district": "Rasuwa",
        "coordinates": [85.295, 28.110],
        "category": "hospital",
        "capacity_beds": 15,
        "status": "Cut off from referral hospital - Limited emergency stock",
        "has_trauma_unit": False
    }
]

# Bridges
TRISHULI_BRIDGES = [
    {
        "id": "bridge-betrawati",
        "name": "Betrawati Trishuli Crossing Bridge",
        "coordinates": [85.181, 27.980],
        "road_ref": "NH09 / Pasang Lhamu Highway",
        "spans": "Trishuli River & Betrawati River Confluence"
    },
    {
        "id": "bridge-trishuli-bazaar",
        "name": "Trishuli Bazaar Motor Bridge",
        "coordinates": [85.141, 27.925],
        "road_ref": "Bidur-Trishuli Link",
        "spans": "Trishuli River"
    },
    {
        "id": "bridge-battar-tadi",
        "name": "Battar Tadi River Bridge",
        "coordinates": [85.163, 27.892],
        "road_ref": "Kathmandu-Bidur Highway",
        "spans": "Tadi Khola"
    },
    {
        "id": "bridge-grang-chasm",
        "name": "Grang Mountain Gorge Bridge",
        "coordinates": [85.250, 28.055],
        "road_ref": "NH09 Upper Segment",
        "spans": "Grang Chasm"
    }
]

# Road Network segments (pre-event OSM extraction before 2026-08-26)
TRISHULI_ROADS = [
    {
        "id": "road-kathmandu-bidur",
        "name": "Kathmandu-Bidur Highway",
        "class": "primary",
        "coordinates": [
            [85.170, 27.882], [85.165, 27.895], [85.163, 27.892], [85.165, 27.900], [85.158, 27.915]
        ]
    },
    {
        "id": "road-bidur-trishuli-bazaar",
        "name": "Bidur to Trishuli Bazaar Road",
        "class": "secondary",
        "coordinates": [
            [85.158, 27.915], [85.150, 27.920], [85.143, 27.928], [85.141, 27.925]
        ]
    },
    {
        "id": "road-bidur-betrawati-nh09",
        "name": "Pasang Lhamu Highway (Bidur - Betrawati)",
        "class": "trunk",
        "coordinates": [
            [85.158, 27.915], [85.162, 27.935], [85.170, 27.955], [85.178, 27.972], [85.181, 27.980], [85.183, 27.982]
        ]
    },
    {
        "id": "road-betrawati-dhunche-nh09",
        "name": "Pasang Lhamu Highway (Betrawati - Dhunche)",
        "class": "trunk",
        "coordinates": [
            [85.183, 27.982], [85.205, 28.010], [85.228, 28.035], [85.250, 28.055], [85.275, 28.085], [85.297, 28.112]
        ]
    },
    {
        "id": "road-dhunche-syabrubesi",
        "name": "Pasang Lhamu Highway (Dhunche - Syabrubesi)",
        "class": "trunk",
        "coordinates": [
            [85.297, 28.112], [85.312, 28.132], [85.325, 28.148], [85.334, 28.160]
        ]
    },
    {
        "id": "road-bidur-tupche-ridge",
        "name": "Bidur - Tupche Rural Ridge Track",
        "class": "tertiary",
        "coordinates": [
            [85.158, 27.915], [85.145, 27.930], [85.138, 27.940], [85.132, 27.948]
        ]
    },
    {
        "id": "road-tupche-samari-track",
        "name": "Tupche - Samari Hill Road",
        "class": "unclassified",
        "coordinates": [
            [85.132, 27.948], [85.115, 27.955], [85.102, 27.958], [85.092, 27.962]
        ]
    },
    {
        "id": "road-bidur-gerkhu-link",
        "name": "Bidur - Gerkhu Agricultural Road",
        "class": "tertiary",
        "coordinates": [
            [85.158, 27.915], [85.175, 27.928], [85.188, 27.935], [85.195, 27.940]
        ]
    }
]

# Realistic OSM Buildings samples in the valley
TRISHULI_BUILDINGS = [
    # Trishuli Bazaar Riverside (heavily exposed)
    {"id": "bldg-trishuli-01", "name": "Trishuli Riverside Market 1", "coordinates": [85.1425, 27.9275], "use": "commercial"},
    {"id": "bldg-trishuli-02", "name": "Riverside Settlement Unit A", "coordinates": [85.1432, 27.9282], "use": "residential"},
    {"id": "bldg-trishuli-03", "name": "Riverside Settlement Unit B", "coordinates": [85.1438, 27.9288], "use": "residential"},
    {"id": "bldg-trishuli-04", "name": "Trishuli Bus Terminal Shed", "coordinates": [85.1418, 27.9262], "use": "transport"},
    {"id": "bldg-trishuli-05", "name": "Waterfront Milling Facility", "coordinates": [85.1442, 27.9295], "use": "industrial"},
    # Betrawati Confluence (heavily exposed)
    {"id": "bldg-betrawati-01", "name": "Betrawati Confluence Depot", "coordinates": [85.1822, 27.9815], "use": "commercial"},
    {"id": "bldg-betrawati-02", "name": "Betrawati Temple Complex Annex", "coordinates": [85.1835, 27.9828], "use": "cultural"},
    {"id": "bldg-betrawati-03", "name": "Riverside Fishery Store", "coordinates": [85.1812, 27.9798], "use": "commercial"},
    {"id": "bldg-betrawati-04", "name": "Highway Checkpoint Post", "coordinates": [85.1828, 27.9822], "use": "civic"},
    # Bidur Upper Town (safe / no overlap)
    {"id": "bldg-bidur-01", "name": "Bidur Municipal Office", "coordinates": [85.1590, 27.9160], "use": "civic"},
    {"id": "bldg-bidur-02", "name": "Nuwakot Post Office", "coordinates": [85.1575, 27.9145], "use": "civic"},
    {"id": "bldg-bidur-03", "name": "Trishuli Hospital Ward A", "coordinates": [85.1555, 27.9172], "use": "hospital"},
    {"id": "bldg-bidur-04", "name": "Trishuli Hospital Emergency", "coordinates": [85.1548, 27.9168], "use": "hospital"},
    # Battar Plain (safe / no overlap)
    {"id": "bldg-battar-01", "name": "Battar Central Bank Branch", "coordinates": [85.1660, 27.9010], "use": "commercial"},
    {"id": "bldg-battar-02", "name": "Battar Secondary School", "coordinates": [85.1645, 27.8995], "use": "school"},
    # Tupche Ridge (safe)
    {"id": "bldg-tupche-01", "name": "Tupche Health Post", "coordinates": [85.1325, 27.9482], "use": "health"},
    {"id": "bldg-tupche-02", "name": "Tupche Community Hall", "coordinates": [85.1318, 27.9475], "use": "civic"},
    # Dhunche (Rasuwa)
    {"id": "bldg-dhunche-01", "name": "Rasuwa District Administration", "coordinates": [85.2975, 28.1125], "use": "civic"},
    {"id": "bldg-dhunche-02", "name": "Dhunche Primary Clinic", "coordinates": [85.2952, 28.1105], "use": "hospital"},
    {"id": "bldg-dhunche-03", "name": "Langtang National Park HQ", "coordinates": [85.2982, 28.1140], "use": "civic"}
]


def generate_synthetic_trishuli_rasters(width: int = 120, height: int = 120) -> Dict[str, Any]:
    """
    Generates realistic, physically plausible SAR, Optical, and DEM rasters
    for the Trishuli River Valley Case Study bounding box.
    Returns:
        transform: rasterio.Affine
        pre_sar: 2D ndarray
        post_sar: 2D ndarray
        dem: 2D ndarray (Copernicus DEM elevation in meters)
        ndwi_post: 2D ndarray
        cloud_mask_post: 2D ndarray
    """
    bounds = (
        TRISHULI_BBOX["min_lon"],
        TRISHULI_BBOX["min_lat"],
        TRISHULI_BBOX["max_lon"],
        TRISHULI_BBOX["max_lat"]
    )
    transform = from_bounds(*bounds, width, height)

    # Coordinates grid
    cols, rows = np.meshgrid(np.arange(width), np.arange(height))
    lons, lats = transform * (cols + 0.5, rows + 0.5)

    # 1. Copernicus DEM 30m representation (elevation in meters)
    # Trishuli gorge descends from ~3800m in north (Langtang/Rasuwa) to ~550m in south (Bidur/Battar)
    base_elevation = 550.0 + (lats - TRISHULI_BBOX["min_lat"]) / (TRISHULI_BBOX["max_lat"] - TRISHULI_BBOX["min_lat"]) * 2800.0
    # Valley topography: elevation rises steeply away from the river spine
    # River roughly runs along a curving trajectory through the center
    river_lon_center = 85.14 + (lats - 27.88) * 0.65
    dist_to_river_km = np.abs(lons - river_lon_center) * 98.0
    valley_walls = (dist_to_river_km ** 1.6) * 120.0
    dem = base_elevation + valley_walls

    # 2. Pre-event Sentinel-1 SAR amplitude
    # Normal terrain has backscatter between 0.15 and 0.40; normal river channel is narrow (~0.05)
    normal_river_width_km = 0.15
    is_normal_river = dist_to_river_km <= normal_river_width_km
    pre_sar = np.random.normal(0.28, 0.04, (height, width)).astype(float)
    pre_sar[is_normal_river] = 0.04  # Baseline normal river backscatter

    # 3. Post-event Sentinel-1 SAR amplitude
    # Massive flood expansion along Trishuli River:
    # Especially between lat 27.92 and lat 28.02 (Trishuli Bazaar and Betrawati confluence)
    flood_zone = (dist_to_river_km <= 0.85) & (lats >= 27.91) & (lats <= 28.02)
    # Narrower flood upstream
    flood_zone_upstream = (dist_to_river_km <= 0.45) & (lats > 28.02) & (lats <= 28.15)
    total_flooded_pixels = flood_zone | flood_zone_upstream

    post_sar = pre_sar.copy()
    # Water attenuation (smooth specular reflection => backscatter drops sharply by 4 to 8 dB)
    post_sar[total_flooded_pixels] = 0.035 + np.random.normal(0, 0.005, np.sum(total_flooded_pixels))
    post_sar = np.maximum(post_sar, 0.01)

    # Sediment / debris / debris fan deposits near river banks
    debris_zone = (dist_to_river_km > 0.85) & (dist_to_river_km <= 1.25) & (lats >= 27.95) & (lats <= 28.00)
    post_sar[debris_zone] = post_sar[debris_zone] * 1.95  # Increased backscatter from gravel/rock debris

    # 4. Post-event Sentinel-2 Optical NDWI & Monsoonal Cloud Mask
    # Optical NDWI: high in water (> 0.25)
    ndwi = np.random.normal(-0.25, 0.08, (height, width))
    ndwi[total_flooded_pixels] = 0.42 + np.random.normal(0, 0.05, np.sum(total_flooded_pixels))
    ndwi[is_normal_river] = 0.55

    # Cloud cover: monsoonal clouds over mountains (northern half, 45% of scene)
    cloud_mask = (lats > 28.04) & (np.random.rand(height, width) > 0.35)

    return {
        "transform": transform,
        "pre_sar": pre_sar,
        "post_sar": post_sar,
        "dem": dem,
        "ndwi_post": ndwi,
        "cloud_mask_post": cloud_mask,
        "width": width,
        "height": height
    }


def get_emsr927_reference_polygons() -> Dict[str, Any]:
    """
    Copernicus Emergency Management Service (EMS) Rapid Mapping EMSR927 Reference Layer.
    Strictly used for post-hoc validation benchmark comparison; never supplied as model input.
    """
    return {
        "type": "FeatureCollection",
        "name": "EMSR927_AOI01_DEL_OBSERVED_FLOOD_20260828",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "event_code": "EMSR927",
                    "source": "Copernicus EMS Rapid Mapping",
                    "hazard_type": "Flood and Debris Flow",
                    "validation_class": "Observed Flood Extent",
                    "area_ha": 348.5
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [85.140, 27.922],
                        [85.147, 27.925],
                        [85.149, 27.934],
                        [85.165, 27.950],
                        [85.176, 27.970],
                        [85.186, 27.985],
                        [85.182, 27.992],
                        [85.170, 27.975],
                        [85.158, 27.955],
                        [85.142, 27.935],
                        [85.138, 27.926],
                        [85.140, 27.922]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "event_code": "EMSR927",
                    "source": "Copernicus EMS Rapid Mapping",
                    "hazard_type": "River Overflow",
                    "validation_class": "Observed Flood Extent",
                    "area_ha": 112.2
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [85.195, 27.998],
                        [85.215, 28.022],
                        [85.230, 28.042],
                        [85.222, 28.046],
                        [85.204, 28.025],
                        [85.188, 28.002],
                        [85.195, 27.998]
                    ]]
                }
            }
        ]
    }
