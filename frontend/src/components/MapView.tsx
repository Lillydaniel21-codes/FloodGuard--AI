import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  Crosshair,
  AlertOctagon,
  ShieldAlert,
  Hospital,
  Building,
  Navigation,
} from 'lucide-react';
import {
  AnalysisResponse,
  InfrastructureItem,
  SettlementStatus,
} from '../types';

interface MapViewProps {
  analysis: AnalysisResponse | null;
  onSelectCoordinate?: (coords: [number, number]) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  analysis,
  onSelectCoordinate,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.LayerGroup }>({});

  const [basemapType, setBasemapType] = useState<'dark' | 'satellite'>('dark');
  const [visibleLayers, setVisibleLayers] = useState({
    flood: true,
    debris: true,
    roads: true,
    bridges: true,
    buildings: true,
    settlements: true,
    hospitals: true,
    routes: true,
    downstreamFlow: true,
    emsrReference: false,
  });

  const [cursorCoords, setCursorCoords] = useState<[number, number] | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around Trishuli River Valley, Nuwakot / Rasuwa, Nepal
    const map = L.map(mapContainerRef.current, {
      center: [27.97, 85.18],
      zoom: 11,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Dark CartoDB Base
    const darkTile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }
    );

    // ESRI Satellite Base
    const satTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18,
      }
    );

    darkTile.addTo(map);
    layersRef.current['base_dark'] = L.layerGroup([darkTile]);
    layersRef.current['base_sat'] = L.layerGroup([satTile]);

    // Initialize overlay groups
    layersRef.current['flood'] = L.layerGroup().addTo(map);
    layersRef.current['debris'] = L.layerGroup().addTo(map);
    layersRef.current['roads'] = L.layerGroup().addTo(map);
    layersRef.current['bridges'] = L.layerGroup().addTo(map);
    layersRef.current['buildings'] = L.layerGroup().addTo(map);
    layersRef.current['settlements'] = L.layerGroup().addTo(map);
    layersRef.current['hospitals'] = L.layerGroup().addTo(map);
    layersRef.current['routes'] = L.layerGroup().addTo(map);
    layersRef.current['downstreamFlow'] = L.layerGroup().addTo(map);
    layersRef.current['emsrReference'] = L.layerGroup();

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords([e.latlng.lat, e.latlng.lng]);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onSelectCoordinate) {
        onSelectCoordinate([e.latlng.lng, e.latlng.lat]);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Basemap Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (basemapType === 'dark') {
      map.removeLayer(layersRef.current['base_sat']);
      map.addLayer(layersRef.current['base_dark']);
    } else {
      map.removeLayer(layersRef.current['base_dark']);
      map.addLayer(layersRef.current['base_sat']);
    }
  }, [basemapType]);

  // Handle Overlay Layer Toggles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.entries(visibleLayers).forEach(([key, isVis]) => {
      const group = layersRef.current[key];
      if (group) {
        if (isVis && !map.hasLayer(group)) {
          map.addLayer(group);
        } else if (!isVis && map.hasLayer(group)) {
          map.removeLayer(group);
        }
      }
    });
  }, [visibleLayers]);

  // Render Geospatial Overlays from Analysis Response
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !analysis) return;

    // Clear previous overlay contents
    ['flood', 'debris', 'roads', 'bridges', 'buildings', 'settlements', 'hospitals', 'routes', 'downstreamFlow', 'emsrReference'].forEach(
      (k) => layersRef.current[k]?.clearLayers()
    );

    // 1. Flood Inundation Polygons (Cyan/Sky)
    if (analysis.flood_geojson) {
      L.geoJSON(analysis.flood_geojson, {
        style: {
          color: '#06b6d4',
          weight: 1.5,
          fillColor: '#0284c7',
          fillOpacity: 0.55,
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`
            <div class="text-xs">
              <div class="font-bold text-cyan-400 mb-1">Satellite Flood Inundation Area</div>
              <p><b>Sensor:</b> ${feature.properties?.sensor || 'Sentinel-1/2'}</p>
              <p><b>Confidence:</b> ${feature.properties?.confidence || 'High'}</p>
              <p><b>Classification:</b> Specular backscatter drop (&le; -3.2 dB) / NDWI confirmation</p>
            </div>
          `);
        },
      }).addTo(layersRef.current['flood']);
    }

    // 2. Surface Change / Debris Polygons (Amber)
    if (analysis.surface_change_geojson) {
      L.geoJSON(analysis.surface_change_geojson, {
        style: {
          color: '#f59e0b',
          weight: 1.5,
          fillColor: '#d97706',
          fillOpacity: 0.45,
          dashArray: '4, 4',
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`
            <div class="text-xs">
              <div class="font-bold text-amber-400 mb-1">Surface Change / Wet Debris Fan</div>
              <p><b>Backscatter Delta:</b> &ge; +2.5 dB (Increased surface roughness / deposit)</p>
              <p><b>Status:</b> Unverified potential mud/debris deposit</p>
            </div>
          `);
        },
      }).addTo(layersRef.current['debris']);
    }

    // 3. Infrastructure Items (Buildings, Roads, Bridges, Hospitals)
    if (analysis.infrastructure_summary) {
      analysis.infrastructure_summary.forEach((item: InfrastructureItem) => {
        const [lon, lat] = item.coordinates;

        if (item.category === 'building') {
          const isAffected = item.exposure_class === 'Potentially affected';
          const isExposed = item.exposure_class === 'Possibly exposed';
          const color = isAffected ? '#ef4444' : isExposed ? '#f59e0b' : '#38bdf8';

          const marker = L.circleMarker([lat, lon], {
            radius: isAffected ? 6 : 4,
            fillColor: color,
            color: '#ffffff',
            weight: 1,
            fillOpacity: 0.85,
          });

          marker.bindPopup(`
            <div class="text-xs">
              <div class="font-bold text-slate-100">${item.name}</div>
              <p class="text-[10px] text-slate-400 font-mono">ID: ${item.id}</p>
              <div class="mt-1">
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isAffected ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  isExposed ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-slate-800 text-slate-300'
                }">
                  ${item.exposure_class}
                </span>
              </div>
              <p class="mt-1.5 text-[11px] text-slate-300"><b>Evidence:</b> ${item.evidence_method}</p>
              <p class="text-[10px] text-slate-400"><b>Status:</b> ${item.verification_status}</p>
            </div>
          `);

          marker.addTo(layersRef.current['buildings']);
        } else if (item.category === 'bridge') {
          const isSevered = item.exposure_class === 'Potentially affected';

          const iconHtml = `
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${
              isSevered ? 'bg-rose-600 beacon-isolated shadow-lg shadow-rose-900' : 'bg-emerald-600'
            } text-white font-bold border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19h16M4 15h16M8 15v4M16 15v4M4 11l4-6h8l4 6"/></svg>
            </div>
          `;

          const bridgeIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-bridge-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([lat, lon], { icon: bridgeIcon });
          marker.bindPopup(`
            <div class="text-xs">
              <div class="font-bold text-rose-400 text-sm mb-1">${item.name}</div>
              <p><b>Crossing:</b> ${item.details?.spans || 'Trishuli River'}</p>
              <p><b>Highway:</b> ${item.details?.road_ref || 'NH09'}</p>
              <p><b>Status:</b> <span class="text-rose-400 font-bold">${item.verification_status}</span></p>
              <p class="text-[11px] text-slate-300 mt-1">${item.evidence_method}</p>
            </div>
          `);
          marker.addTo(layersRef.current['bridges']);
        } else if (item.category === 'hospital') {
          const iconHtml = `
            <div class="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600 text-white font-bold border-2 border-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 6v12M6 12h12"/></svg>
            </div>
          `;

          const hospIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-hosp-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([lat, lon], { icon: hospIcon });
          marker.bindPopup(`
            <div class="text-xs">
              <div class="font-bold text-blue-400 text-sm mb-1">${item.name}</div>
              <p><b>Facility Category:</b> Emergency Referral Hospital</p>
              <p><b>Capacity:</b> ${item.details?.capacity_beds || 150} beds</p>
              <p><b>Flood Exposure:</b> <span class="text-emerald-400 font-bold">${item.exposure_class}</span></p>
              <p class="text-[11px] text-slate-300 mt-1">${item.verification_status}</p>
            </div>
          `);
          marker.addTo(layersRef.current['hospitals']);
        }
      });
    }

    // 4. Isolated & Connected Settlements
    if (analysis.isolated_settlements) {
      analysis.isolated_settlements.forEach((s: SettlementStatus) => {
        const [lon, lat] = s.coordinates;

        const iconHtml = s.is_isolated
          ? `
            <div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-rose-600 beacon-isolated text-white font-black text-xs border-2 border-white shadow-xl shadow-rose-950">
              <span>!</span>
            </div>
          `
          : `
            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] border border-white shadow-md">
              <span>✓</span>
            </div>
          `;

        const settlementIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-settlement-icon',
          iconSize: s.is_isolated ? [36, 36] : [24, 24],
          iconAnchor: s.is_isolated ? [18, 18] : [12, 12],
        });

        const marker = L.marker([lat, lon], { icon: settlementIcon });

        marker.bindPopup(`
          <div class="text-xs">
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-sm text-slate-100">${s.name}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                s.is_isolated ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
              }">
                ${s.is_isolated ? 'CUT OFF / ISOLATED' : 'ROAD CONNECTED'}
              </span>
            </div>
            <p><b>District:</b> ${s.district}</p>
            <p><b>Nearest Hospital:</b> ${s.nearest_hospital_name} (${s.baseline_travel_distance_km} km baseline)</p>
            ${
              s.is_isolated
                ? `<div class="mt-2 p-1.5 bg-rose-950/60 border border-rose-900 rounded text-rose-200">
                     <b>Isolation Reason:</b> ${s.isolation_reason}<br/>
                     <b>Severed Bottleneck:</b> ${s.critical_bottleneck_road || 'Betrawati Bridge'}
                   </div>`
                : `<p class="text-emerald-400 mt-1">✓ Open vehicular access maintained</p>`
            }
          </div>
        `);

        marker.addTo(layersRef.current['settlements']);
      });
    }

    // 5. Evacuation & Disrupted Routes
    if (analysis.evacuation_routes_geojson) {
      L.geoJSON(analysis.evacuation_routes_geojson, {
        style: (feature) => {
          const isSevered = feature?.properties?.status === 'severed_bottleneck';
          return {
            color: isSevered ? '#ef4444' : '#10b981',
            weight: isSevered ? 4 : 2.5,
            dashArray: isSevered ? '6, 6' : undefined,
            opacity: 0.85,
          };
        },
        onEachFeature: (feature, layer) => {
          const isSevered = feature?.properties?.status === 'severed_bottleneck';
          layer.bindPopup(`
            <div class="text-xs">
              <div class="font-bold ${isSevered ? 'text-rose-400' : 'text-emerald-400'} mb-1">
                ${isSevered ? 'Severed Road Bottleneck' : 'Intact Evacuation Route'}
              </div>
              <p><b>Segment:</b> ${feature.properties?.road_name || 'Highway Corridor'}</p>
              <p><b>Status:</b> ${isSevered ? 'Inundated / Structurally Disrupted' : 'Clear for emergency vehicular transport'}</p>
            </div>
          `);
        },
      }).addTo(layersRef.current['routes']);
    }

    // 6. Downstream Flow Bonus Path
    if (analysis.flow_path_bonus?.estimated_flow_path_geojson) {
      L.geoJSON(analysis.flow_path_bonus.estimated_flow_path_geojson, {
        style: (feature) => {
          const isBuffer = feature?.properties?.type === 'estimated_flood_corridor_buffer';
          return {
            color: isBuffer ? '#ec4899' : '#d946ef',
            weight: isBuffer ? 1 : 3.5,
            fillColor: '#ec4899',
            fillOpacity: isBuffer ? 0.2 : 0,
            dashArray: isBuffer ? '4, 4' : undefined,
          };
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`
            <div class="text-xs">
              <div class="font-bold text-fuchsia-400 mb-1">Terrain Downstream Flow Corridor (D8 Bonus)</div>
              <p><b>Method:</b> D8 Steepest Descent on Copernicus DEM 30m</p>
              <p><b>Length:</b> ${analysis.flow_path_bonus?.path_length_km} km</p>
              <p><b>Settlements along Corridor:</b> ${analysis.flow_path_bonus?.settlements_in_corridor.join(', ') || 'None detected'}</p>
            </div>
          `);
        },
      }).addTo(layersRef.current['downstreamFlow']);
    }
  }, [analysis]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-dark-950">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Layer Control Floating Box (Top Right) */}
      <div className="absolute top-3 right-3 z-20 bg-dark-900/90 backdrop-blur-md border border-dark-800 rounded-lg p-3 text-xs shadow-xl w-60 select-none">
        <div className="flex items-center justify-between font-bold text-slate-200 border-b border-dark-800 pb-2 mb-2">
          <div className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Map Layers</span>
          </div>
          {/* Basemap Toggle */}
          <button
            onClick={() => setBasemapType(basemapType === 'dark' ? 'satellite' : 'dark')}
            className="px-2 py-0.5 rounded bg-dark-800 hover:bg-dark-700 text-[10px] text-cyan-300 font-mono transition-all"
          >
            {basemapType === 'dark' ? '🛰️ Satellite' : '🗺️ Dark Carto'}
          </button>
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
            <span className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
              <span>Flood Inundation (SAR/Opt)</span>
            </span>
            <input
              type="checkbox"
              checked={visibleLayers.flood}
              onChange={(e) => setVisibleLayers({ ...visibleLayers, flood: e.target.checked })}
              className="accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
            <span className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
              <span>Surface Change / Debris</span>
            </span>
            <input
              type="checkbox"
              checked={visibleLayers.debris}
              onChange={(e) => setVisibleLayers({ ...visibleLayers, debris: e.target.checked })}
              className="accent-amber-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
            <span className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Isolated Settlements (Cut off)</span>
            </span>
            <input
              type="checkbox"
              checked={visibleLayers.settlements}
              onChange={(e) => setVisibleLayers({ ...visibleLayers, settlements: e.target.checked })}
              className="accent-rose-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
            <span className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-600"></span>
              <span>Severed Bridges (Washouts)</span>
            </span>
            <input
              type="checkbox"
              checked={visibleLayers.bridges}
              onChange={(e) => setVisibleLayers({ ...visibleLayers, bridges: e.target.checked })}
              className="accent-rose-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
            <span className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
              <span>Referral Hospitals</span>
            </span>
            <input
              type="checkbox"
              checked={visibleLayers.hospitals}
              onChange={(e) => setVisibleLayers({ ...visibleLayers, hospitals: e.target.checked })}
              className="accent-blue-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
            <span className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              <span>Evacuation Routes</span>
            </span>
            <input
              type="checkbox"
              checked={visibleLayers.routes}
              onChange={(e) => setVisibleLayers({ ...visibleLayers, routes: e.target.checked })}
              className="accent-emerald-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer py-0.5">
            <span className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-fuchsia-500"></span>
              <span>DEM Flow Path Bonus</span>
            </span>
            <input
              type="checkbox"
              checked={visibleLayers.downstreamFlow}
              onChange={(e) => setVisibleLayers({ ...visibleLayers, downstreamFlow: e.target.checked })}
              className="accent-fuchsia-500 rounded"
            />
          </label>
        </div>
      </div>

      {/* Coordinate & Inspector Bar (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-3 bg-dark-900/90 backdrop-blur-md border border-dark-800 rounded-md px-3 py-1.5 text-[11px] font-mono text-slate-400 select-none shadow-lg">
        <div className="flex items-center space-x-1.5">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {cursorCoords
              ? `${cursorCoords[0].toFixed(4)}°N, ${cursorCoords[1].toFixed(4)}°E`
              : 'Hover to inspect coordinates'}
          </span>
        </div>
        <span className="text-dark-700">|</span>
        <span className="text-slate-500">Datum: WGS84 / EPSG:4326</span>
      </div>

      {/* Map Legend Overlay (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20 bg-dark-900/90 backdrop-blur-md border border-dark-800 rounded-lg p-2.5 text-[11px] shadow-xl flex items-center space-x-4 select-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping opacity-75"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-4 mr-1"></span>
          <span className="text-slate-300 font-medium">Cut-Off Settlement</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-sm bg-cyan-500 opacity-80"></span>
          <span className="text-slate-300 font-medium">Detected Flood</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1 bg-rose-500"></span>
          <span className="text-slate-300 font-medium">Severed Road/Bridge</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1 bg-emerald-500"></span>
          <span className="text-slate-300 font-medium">Open Road</span>
        </div>
      </div>
    </div>
  );
};
