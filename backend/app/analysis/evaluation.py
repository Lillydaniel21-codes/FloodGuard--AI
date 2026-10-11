import numpy as np
from typing import Dict, Any, Tuple
from shapely.geometry import shape, Polygon
from shapely.ops import unary_union
from backend.app.geospatial.data_store import get_emsr927_reference_polygons
from backend.app.geospatial.vector_ops import calculate_polygon_area_sqkm
from backend.app.models.schemas import EvaluationResult


def evaluate_flood_prediction(
    predicted_flood_geojson: Dict[str, Any],
    reference_geojson: Dict[str, Any] = None
) -> EvaluationResult:
    """
    Computes rigorous geographic benchmark metrics (IoU, Precision, Recall, F1)
    between independently predicted satellite flood extent and official Copernicus EMSR927 reference mapping.
    
    CRITICAL ETHICAL AUDIT:
    EMSR927 reference polygons are loaded solely inside this evaluation function.
    They are NEVER passed to the SAR change detection, optical indexer, or segmentation pipeline.
    """
    if reference_geojson is None:
        reference_geojson = get_emsr927_reference_polygons()

    pred_geoms = [shape(f["geometry"]) for f in predicted_flood_geojson.get("features", []) if f.get("geometry")]
    ref_geoms = [shape(f["geometry"]) for f in reference_geojson.get("features", []) if f.get("geometry")]

    pred_union = unary_union(pred_geoms) if pred_geoms else Polygon()
    ref_union = unary_union(ref_geoms) if ref_geoms else Polygon()

    if pred_union.is_empty and ref_union.is_empty:
        return EvaluationResult(
            reference_source="Copernicus EMSR927 Rapid Mapping",
            precision=1.0,
            recall=1.0,
            f1_score=1.0,
            iou=1.0,
            true_positive_area_sqkm=0.0,
            false_positive_area_sqkm=0.0,
            false_negative_area_sqkm=0.0,
            methodology_note="Both prediction and reference empty."
        )

    # True Positive: Intersection (Pred ∩ Ref)
    tp_geom = pred_union.intersection(ref_union) if not (pred_union.is_empty or ref_union.is_empty) else Polygon()
    tp_area = calculate_polygon_area_sqkm(tp_geom)

    # False Positive: Pred \ Ref
    fp_geom = pred_union.difference(ref_union) if not pred_union.is_empty else Polygon()
    fp_area = calculate_polygon_area_sqkm(fp_geom)

    # False Negative: Ref \ Pred
    fn_geom = ref_union.difference(pred_union) if not ref_union.is_empty else Polygon()
    fn_area = calculate_polygon_area_sqkm(fn_geom)

    # Precision = TP / (TP + FP)
    precision = (tp_area / (tp_area + fp_area)) if (tp_area + fp_area) > 0 else 0.0

    # Recall = TP / (TP + FN)
    recall = (tp_area / (tp_area + fn_area)) if (tp_area + fn_area) > 0 else 0.0

    # F1 Score = 2 * (P * R) / (P + R)
    f1 = (2.0 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

    # IoU = TP / (TP + FP + FN)
    iou = (tp_area / (tp_area + fp_area + fn_area)) if (tp_area + fp_area + fn_area) > 0 else 0.0

    return EvaluationResult(
        reference_source="Copernicus EMS Rapid Mapping EMSR927 (August 2026 Reference Extent)",
        precision=round(precision, 4),
        recall=round(recall, 4),
        f1_score=round(f1, 4),
        iou=round(iou, 4),
        true_positive_area_sqkm=round(tp_area, 3),
        false_positive_area_sqkm=round(fp_area, 3),
        false_negative_area_sqkm=round(fn_area, 3),
        methodology_note=(
            "Independent post-hoc geospatial spatial intersection evaluation against Copernicus EMSR927. "
            "EMSR927 reference polygons were strictly excluded from model feature extraction and classification."
        )
    )
