import numpy as np
from scipy.ndimage import uniform_filter, gaussian_filter
from typing import Tuple, Dict, Any, Optional


def lee_filter(img: np.ndarray, size: int = 5) -> np.ndarray:
    """
    Speckle reduction for SAR radar amplitude/intensity using a Lee filter.
    Preserves edges while smoothing speckle noise in homogenous regions.
    """
    if img.ndim != 2:
        return img
    img_mean = uniform_filter(img, (size, size))
    img_sqr_mean = uniform_filter(img ** 2, (size, size))
    img_variance = np.maximum(img_sqr_mean - img_mean ** 2, 0)

    overall_variance = np.var(img)
    if overall_variance == 0:
        return img

    weights = img_variance / (img_variance + overall_variance + 1e-8)
    filtered = img_mean + weights * (img - img_mean)
    return np.clip(filtered, 0, None)


def compute_sar_change(
    pre_sar: np.ndarray,
    post_sar: np.ndarray,
    threshold_db: float = -3.2,
    debris_threshold_db: float = 2.5,
    speckle_size: int = 5
) -> Dict[str, np.ndarray]:
    """
    Compute radar backscatter difference and classify candidate changes:
    - Specular water reflection (floodwater): backscatter decrease <= threshold_db (e.g. -3.2 dB)
    - Surface disruption / wet debris / sediment: backscatter increase >= debris_threshold_db (+2.5 dB)
    - Uncertain / subtle changes: between -3.2 dB and -1.8 dB
    """
    pre_clean = lee_filter(pre_sar, size=speckle_size)
    post_clean = lee_filter(post_sar, size=speckle_size)

    # Avoid zero division
    pre_safe = np.maximum(pre_clean, 1e-4)
    post_safe = np.maximum(post_clean, 1e-4)

    # Ratio in decibels: 10 * log10(post / pre)
    diff_db = 10.0 * np.log10(post_safe / pre_safe)

    # Masks
    # Inundated pixels: significant attenuation due to specular reflection
    water_mask = diff_db <= threshold_db

    # Sediment / debris / saturated mud: increased surface roughness or deposit
    debris_mask = diff_db >= debris_threshold_db

    # Inundation probability: normalized sigmoid map
    # A drop of -5 dB or more maps close to 1.0; 0 dB maps to 0.0
    inundation_prob = 1.0 / (1.0 + np.exp((diff_db + 2.5) * 1.5))
    inundation_prob = np.clip(inundation_prob, 0.0, 1.0)

    # Uncertain mask: marginal backscatter drop
    uncertain_mask = (diff_db > threshold_db) & (diff_db <= -1.8)

    return {
        "diff_db": diff_db,
        "water_mask": water_mask.astype(bool),
        "debris_mask": debris_mask.astype(bool),
        "uncertain_mask": uncertain_mask.astype(bool),
        "inundation_prob": inundation_prob,
    }


def compute_ndwi(green_band: np.ndarray, nir_band: np.ndarray) -> np.ndarray:
    """
    Normalized Difference Water Index (McFeeters 1996):
    NDWI = (Green - NIR) / (Green + NIR)
    Positive values (> 0.1) indicate open water.
    """
    denom = green_band.astype(float) + nir_band.astype(float)
    diff = green_band.astype(float) - nir_band.astype(float)
    ndwi = np.divide(diff, denom, out=np.zeros_like(diff, dtype=float), where=denom > 1e-5)
    return np.clip(ndwi, -1.0, 1.0)


def combine_radar_optical_evidence(
    radar_water_mask: np.ndarray,
    ndwi: Optional[np.ndarray] = None,
    cloud_mask: Optional[np.ndarray] = None,
    ndwi_threshold: float = 0.18
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Fuses radar and optical evidence when optical imagery is clear.
    If clouds obscure the scene, radar alone is preserved with an uncertainty flag.
    Returns: (confirmed_water_mask, confidence_grid)
    """
    if ndwi is None or cloud_mask is None:
        # Optical unavailable: radar is primary evidence with medium baseline confidence
        confidence = np.where(radar_water_mask, 0.75, 0.0)
        return radar_water_mask, confidence

    # Valid optical pixels (not cloud)
    clear_optical = ~cloud_mask
    optical_water = (ndwi >= ndwi_threshold) & clear_optical

    # Fusion rules:
    # 1. High confidence: both radar & clear optical agree on water
    high_conf = radar_water_mask & optical_water

    # 2. Medium confidence: radar indicates water where optical is cloudy (radar penetrates clouds)
    med_conf_cloud = radar_water_mask & cloud_mask

    # 3. Medium confidence: optical indicates water where radar had borderline response
    med_conf_opt = optical_water & (~radar_water_mask)

    # Combined confirmed water:
    confirmed = high_conf | med_conf_cloud | (radar_water_mask & clear_optical)

    confidence = np.zeros_like(radar_water_mask, dtype=float)
    confidence[high_conf] = 0.95
    confidence[med_conf_cloud] = 0.80
    confidence[radar_water_mask & clear_optical & (~optical_water)] = 0.60
    confidence[med_conf_opt] = 0.70

    return confirmed, confidence
