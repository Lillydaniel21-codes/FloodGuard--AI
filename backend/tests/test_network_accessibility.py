import networkx as nx
from backend.app.analysis.network_accessibility import (
    build_pre_event_road_graph, analyze_road_accessibility
)


def test_broken_edge_causes_isolation():
    """
    Mandatory Test: Construct a road graph where a known bridge/road edge is severed,
    and verify that a previously connected settlement transitions from connected to disconnected!
    """
    # 3 settlements: HospitalTown (A), Junction (B), MountainVillage (C)
    # Road 1: A -> B (Hospital road)
    # Road 2: B -> C (Mountain bridge road)
    roads = [
        {
            "id": "road-A-B",
            "name": "Arterial Highway",
            "class": "primary",
            "coordinates": [[85.100, 27.900], [85.120, 27.920]]
        },
        {
            "id": "road-B-C",
            "name": "Mountain Gorge Bridge Road",
            "class": "secondary",
            "coordinates": [[85.120, 27.920], [85.150, 27.950]]
        }
    ]

    settlements = [
        {"id": "settle-c", "name": "Mountain Village C", "district": "Upper Basin", "coordinates": [85.150, 27.950]}
    ]

    hospitals = [
        {"id": "hosp-a", "name": "Regional Hospital A", "coordinates": [85.100, 27.900]}
    ]

    # Baseline: No flood
    empty_flood = {"type": "FeatureCollection", "features": []}
    statuses_pre, _ = analyze_road_accessibility(roads, settlements, hospitals, empty_flood)
    assert len(statuses_pre) == 1
    assert statuses_pre[0].is_isolated == False
    assert statuses_pre[0].baseline_travel_distance_km > 0

    # Post-flood: A flood polygon directly severs road B-C (covering [85.13, 27.93])
    severing_flood = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [85.125, 27.925], [85.145, 27.925], [85.145, 27.945], [85.125, 27.945], [85.125, 27.925]
                ]]
            },
            "properties": {"hazard_type": "Flood Surge"}
        }]
    }

    statuses_post, routes = analyze_road_accessibility(roads, settlements, hospitals, severing_flood)
    assert len(statuses_post) == 1
    assert statuses_post[0].is_isolated == True
    assert statuses_post[0].post_event_travel_distance_km is None
    assert "severed" in statuses_post[0].isolation_reason.lower()


def test_alternative_route_discovery():
    """Verify that when a primary bridge is severed, an alternative open ridge road is chosen."""
    # Triangular graph: Hospital A connected to B; B connected to C; alternative ridge road directly from A to C!
    roads = [
        {
            "id": "road-A-B",
            "name": "Highway",
            "class": "primary",
            "coordinates": [[85.100, 27.900], [85.120, 27.920]]
        },
        {
            "id": "road-B-C",
            "name": "Flooded Valley Road",
            "class": "secondary",
            "coordinates": [[85.120, 27.920], [85.150, 27.950]]
        },
        {
            "id": "road-A-C-ridge",
            "name": "High Mountain Ridge Track",
            "class": "tertiary",
            "coordinates": [[85.100, 27.900], [85.105, 27.950], [85.150, 27.950]]
        }
    ]

    settlements = [{"id": "settle-c", "name": "Village C", "coordinates": [85.150, 27.950]}]
    hospitals = [{"id": "hosp-a", "name": "Hospital A", "coordinates": [85.100, 27.900]}]

    # Flood only severs road B-C
    severing_flood = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [85.125, 27.925], [85.145, 27.925], [85.145, 27.945], [85.125, 27.945], [85.125, 27.925]
                ]]
            }
        }]
    }

    statuses, _ = analyze_road_accessibility(roads, settlements, hospitals, severing_flood)
    # Village C remains connected via the alternative ridge track!
    assert statuses[0].is_isolated == False
    assert statuses[0].post_event_travel_distance_km is not None
