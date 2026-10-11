from backend.app.analysis.damage_estimator import estimate_infrastructure_damage


def test_infrastructure_intersection_and_classification():
    """Verify assets are correctly categorized without ungrounded destruction claims."""
    # Synthetic flood polygon covering (85.14 to 85.15, 27.92 to 27.93)
    flood_geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [85.14, 27.92], [85.15, 27.92], [85.15, 27.93], [85.14, 27.93], [85.14, 27.92]
                ]]
            },
            "properties": {"hazard_type": "Flood"}
        }]
    }

    osm_infrastructure = {
        "buildings": [
            # Direct intersection
            {"id": "bldg-1", "name": "Flooded Store", "coordinates": [85.145, 27.925]},
            # Slightly outside (< 120m buffer)
            {"id": "bldg-2", "name": "Near Bank House", "coordinates": [85.1505, 27.925]},
            # Far outside (> 5km away)
            {"id": "bldg-3", "name": "Hilltop School", "coordinates": [85.200, 27.990]},
        ],
        "roads": [
            {
                "id": "road-1",
                "name": "Riverside Road",
                "class": "secondary",
                "coordinates": [[85.138, 27.925], [85.145, 27.925], [85.155, 27.925]]
            }
        ],
        "bridges": [
            {"id": "bridge-1", "name": "Main Bridge", "coordinates": [85.145, 27.925], "spans": "Trishuli"}
        ],
        "hospitals": [
            {"id": "hosp-1", "name": "High Hospital", "coordinates": [85.180, 27.950]}
        ]
    }

    items, counts = estimate_infrastructure_damage(
        flood_geojson=flood_geojson,
        surface_change_geojson={"type": "FeatureCollection", "features": []},
        osm_infrastructure=osm_infrastructure,
        exposure_buffer_meters=120.0
    )

    item_map = {i.id: i for i in items}

    # Verify building 1 is "Potentially affected"
    assert item_map["bldg-1"].exposure_class == "Potentially affected"
    assert "destroyed" not in item_map["bldg-1"].exposure_class.lower()

    # Verify building 2 is "Possibly exposed"
    assert item_map["bldg-2"].exposure_class == "Possibly exposed"

    # Verify building 3 is "No detected overlap"
    assert item_map["bldg-3"].exposure_class == "No detected overlap"

    # Verify bridge is potentially affected
    assert item_map["bridge-1"].exposure_class == "Potentially affected"
    assert counts["bridges_severed"] == 1
    assert counts["buildings_affected"] == 1
