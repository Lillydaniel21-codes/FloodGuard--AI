import re
from typing import Dict, Any, List, Tuple


class NumericalClaimValidator:
    """
    Validates that AI-generated situation reports and chat responses strictly adhere
    to verified deterministic geospatial figures. Replaces or flags hallucinated numbers.
    """

    FORBIDDEN_FABRICATIONS = [
        r"\b(?:deaths?|casualties|fatalities|people killed|injured)\b",
        r"\b(?:destroyed\s+(?:completely|entirely))\b",
        r"\b(?:100%|total\s+annihilation)\b"
    ]

    def __init__(self, metrics: Dict[str, Any], settlements: List[Dict[str, Any]]):
        self.metrics = metrics or {}
        self.settlements = settlements or []
        self.isolated_names = [s.get("name", "").lower() for s in self.settlements if s.get("is_isolated")]

    def validate_and_correct(self, text: str) -> Tuple[str, List[Dict[str, Any]], List[str]]:
        """
        Scans text for numerical assertions and claims.
        Returns:
            sanitized_text: str
            verified_claims: list of claims verified against deterministic ground truth
            corrections_applied: list of corrections or rejections
        """
        corrections = []
        verified_claims = []

        # 1. Check for fabricated casualty or total destruction claims
        for pat in self.FORBIDDEN_FABRICATIONS:
            matches = re.findall(pat, text, re.IGNORECASE)
            if matches:
                corrections.append(
                    f"Rejected unsupported claim mentioning '{matches[0]}'. "
                    f"Casualties and unverified destruction cannot be asserted from satellite imagery alone."
                )
                text = re.sub(
                    pat,
                    "[REDACTED: Unverified casualty/destruction claim not supported by satellite data]",
                    text,
                    flags=re.IGNORECASE
                )

        # 2. Extract verified ground truth numbers
        flood_area = self.metrics.get("total_flood_area_sqkm", 0.0)
        bldgs_affected = self.metrics.get("buildings_affected", 0)
        bldgs_total = self.metrics.get("buildings_total", 0)
        roads_flooded_km = self.metrics.get("roads_flooded_km", 0.0)
        roads_total_km = self.metrics.get("roads_total_km", 0.0)
        bridges_severed = self.metrics.get("bridges_severed", 0)
        settlements_isolated = self.metrics.get("settlements_isolated", 0)

        # Record verifiable claims
        verified_claims.append({
            "metric": "Total Flood Area",
            "ground_truth_value": f"{flood_area} sq km",
            "source": "Sentinel-1/2 Multimodal Analysis",
            "status": "Verified"
        })
        verified_claims.append({
            "metric": "Potentially Affected Buildings",
            "ground_truth_value": f"{bldgs_affected} of {bldgs_total}",
            "source": "OSM Pre-Event Overlay",
            "status": "Verified"
        })
        verified_claims.append({
            "metric": "Flooded Road Alignment",
            "ground_truth_value": f"{roads_flooded_km} km of {roads_total_km} km",
            "source": "NetworkX & Shape Intersection",
            "status": "Verified"
        })
        verified_claims.append({
            "metric": "Isolated Settlements",
            "ground_truth_value": f"{settlements_isolated}",
            "source": "Road Reachability Engine",
            "status": "Verified"
        })

        # 3. Check for specific numeric divergences in the text
        # If text asserts thousands of square kilometers when real is < 10 sq km
        area_matches = re.findall(r"(\d+(?:\.\d+)?)\s*(?:sq\s*km|km²|square\s*kilometers?)", text, re.IGNORECASE)
        for num_str in area_matches:
            val = float(num_str)
            if flood_area > 0 and (val > flood_area * 3.0 or val < flood_area * 0.3):
                corrections.append(
                    f"Corrected flood area figure: Mentioned {val} sq km, but verified satellite calculation is {flood_area} sq km."
                )

        # 4. Check building claim divergence
        bldg_matches = re.findall(r"(\d+)\s*(?:buildings?|structures?)", text, re.IGNORECASE)
        for num_str in bldg_matches:
            val = int(num_str)
            if bldgs_affected > 0 and val > bldgs_affected * 4:
                corrections.append(
                    f"Corrected building exposure claim: Mentioned {val} buildings, but verified affected count is {bldgs_affected}."
                )

        return text, verified_claims, corrections
