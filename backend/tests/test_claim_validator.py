from backend.app.ai.claim_validator import NumericalClaimValidator


def test_claim_validator_redacts_hallucinated_casualties():
    """Verify validator strips unprovable casualty or total destruction claims."""
    metrics = {"total_flood_area_sqkm": 3.8, "buildings_affected": 5}
    settlements = [{"name": "Dhunche", "is_isolated": True}]
    validator = NumericalClaimValidator(metrics, settlements)

    fake_text = "The satellite reveals 250 casualties and 40 deaths. Trishuli Bazaar was destroyed completely."
    sanitized, verified, corrections = validator.validate_and_correct(fake_text)

    assert "casualties" not in sanitized.lower()
    assert "deaths" not in sanitized.lower()
    assert len(corrections) > 0


def test_claim_validator_flags_divergent_numbers():
    """Verify validator catches and flags exaggerated area or building counts."""
    metrics = {"total_flood_area_sqkm": 3.8, "buildings_affected": 4}
    settlements = []
    validator = NumericalClaimValidator(metrics, settlements)

    hallucinated_text = "Satellite radar detects 150 sq km of flooding impacting 800 buildings."
    _, _, corrections = validator.validate_and_correct(hallucinated_text)

    # Must contain corrections flagging the exaggerated 150 sq km and 800 buildings
    assert any("150" in c for c in corrections)
    assert any("800" in c for c in corrections)
