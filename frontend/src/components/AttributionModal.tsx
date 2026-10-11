import React from 'react';
import { X, Database, ShieldCheck, ExternalLink, Globe } from 'lucide-react';
import { DataSourceInfo } from '../types';

interface AttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSources: DataSourceInfo[];
}

export const AttributionModal: React.FC<AttributionModalProps> = ({
  isOpen,
  onClose,
  dataSources,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-dark-900 border border-dark-750 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-dark-800 flex items-center justify-between bg-dark-850">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Data Sources, Licensing & Attributions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-dark-750 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Official Mandated Attributions */}
          <div className="bg-dark-850 border border-dark-750 p-4 rounded-lg space-y-2.5">
            <div className="font-bold text-slate-100 text-xs">
              Mandatory Hackathon Data Attributions:
            </div>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  <b>Sentinel-1 / Sentinel-2:</b> "Contains modified Copernicus Sentinel data 2026."
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <b>Copernicus WorldDEM:</b> "Produced using Copernicus WorldDEM-30 &copy; DLR e.V.
                  2010&ndash;2014 and &copy; Airbus Defence and Space GmbH 2014&ndash;2018 provided under
                  COPERNICUS by the European Union and ESA; all rights reserved."
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <b>OpenStreetMap:</b> "&copy; OpenStreetMap contributors (ODbL 1.0 license)."
                </span>
              </li>
            </ul>
          </div>

          {/* Data Sources Registry */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Registered System Data Adapters
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {dataSources.map((ds, idx) => (
                <div
                  key={idx}
                  className="bg-dark-850 p-3 rounded-lg border border-dark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-200 text-xs">{ds.name}</div>
                    <div className="text-[11px] text-slate-400">
                      <b>Provider:</b> {ds.provider} | <b>Access:</b> {ds.access_type}
                    </div>
                    <div className="text-[10px] text-slate-500">{ds.coverage}</div>
                  </div>
                  <div className="shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {ds.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Model Benchmark Citations */}
          <div className="bg-dark-850 border border-dark-750 p-4 rounded-lg space-y-2">
            <h4 className="font-bold text-slate-200 text-xs">
              AI Benchmark Citations & Model Provenance:
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <b>Kuro Siwo Benchmark:</b> Recommended global SAR + Optical + DEM flood dataset (CC-BY 4.0).
              <br />
              <b>Sen1Floods11:</b> Open access multi-sensor flood benchmark by Cloud to Street / NASA Impact.
              <br />
              <b>Operational Disclaimer:</b> Untrained deep learning models are never masqueraded as trained models. When external deep learning weights are absent, the system operates in transparent radiometric physical baseline mode.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-dark-850 border-t border-dark-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-dark-800 hover:bg-dark-700 text-slate-200 rounded-md text-xs font-semibold transition-colors"
          >
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
};
