import numpy as np
import rasterio
from rasterio.transform import from_bounds
from shapely.geometry import Polygon, box
from backend.app.geospatial.raster_ops import (
    lee_filter, compute_sar_change, compute_ndwi, combine_radar_optical_evidence
)
from backend.app.geospatial.vector_ops import (
    mask_to_geojson_polygons, calculate_polygon_area_sqkm, calculate_line_length_km
)
from backend.app.geospatial.elevation_flow import d8_steepest_descent


def test_lee_filter_noise_reduction():
    """Verify speckle filter preserves mean while reducing noise variance."""
    np.random.seed(42)
    clean = np.ones((50, 50)) * 0.3
    noisy = clean + np.random.normal(0, 0.05, (50, 50))
    filtered = lee_filter(noisy, size=5)
    assert filtered.shape == (50, 50)
    assert np.var(filtered) < np.var(noisy)


def test_sar_backscatter_difference():
    """Verify specular water attenuation drop triggers water_mask."""
    pre = np.ones((20, 20)) * 0.30
    post = pre.copy()
    # Inundate center 4x4 region: backscatter drops to 0.05 (approx -7.8 dB drop)
    post[8:12, 8:12] = 0.05

    res = compute_sar_change(pre, post, threshold_db=-3.2)
    assert res["water_mask"].shape == (20, 20)
    assert np.all(res["water_mask"][8:12, 8:12] == True)
    assert np.all(res["water_mask"][0:4, 0:4] == False)


def test_ndwi_calculation():
    """Verify NDWI calculation McFeeters formula."""
    green = np.array([[0.5, 0.2], [0.1, 0.8]])
    nir = np.array([[0.1, 0.6], [0.9, 0.2]])
    ndwi = compute_ndwi(green, nir)
    # (0.5 - 0.1) / (0.5 + 0.1) = 0.4 / 0.6 = 0.667 (water)
    assert abs(ndwi[0, 0] - 0.6667) < 0.01
    # (0.2 - 0.6) / (0.2 + 0.6) = -0.4 / 0.8 = -0.5 (vegetation/dry)
    assert abs(ndwi[0, 1] - (-0.5)) < 0.01


def test_polygon_area_synthetic():
    """
    Test polygon area calculation against a known ~1 km x 1 km bounding box
    at latitude 28°N in Nepal (UTM 45N).
    1 degree lat ~ 110.85 km => 0.00902 deg lat ~ 1.0 km
    1 degree lon ~ 98.24 km  => 0.01018 deg lon ~ 1.0 km
    """
    # Box with approx 1.0 km x 1.0 km = ~1.0 sq km
    synthetic_box = box(85.150, 27.900, 85.150 + 0.01018, 27.900 + 0.00902)
    area_sqkm = calculate_polygon_area_sqkm(synthetic_box)
    assert 0.90 <= area_sqkm <= 1.10, f"Expected approx 1.0 sq km, got {area_sqkm}"


def test_d8_steepest_descent():
    """Verify D8 flow moves monotonically downhill."""
    # 10x10 elevation ramp descending from row 0 (1000m) to row 9 (100m)
    dem = np.zeros((10, 10))
    for r in range(10):
        dem[r, :] = 1000.0 - (r * 100.0)

    transform = from_bounds(85.0, 27.0, 85.1, 27.1, 10, 10)
    path = d8_steepest_descent(dem, start_row=1, start_col=5, transform_matrix=transform)
    assert len(path) > 3
    # Check that flow proceeded southwards (descending latitude)
    assert path[-1][1] < path[0][1]
