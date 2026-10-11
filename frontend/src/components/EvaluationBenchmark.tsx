import React from 'react';
import {
  ShieldCheck,
  Target,
  BarChart2,
  FileCheck,
  AlertCircle,
  Award,
} from 'lucide-react';
import { EvaluationResult } from '../types';

interface EvaluationBenchmarkProps {
  evaluation: EvaluationResult | null;
}

export const EvaluationBenchmark: React.FC<EvaluationBenchmarkProps> = ({ evaluation }) => {
  if (!evaluation) {
    return (
      <div className="flex-1 p-6 bg-dark-950 text-slate-400 text-xs">
        No evaluation data available. Run an analysis first.
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-dark-950 overflow-y-auto select-none space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-100">
            Copernicus EMSR927 Benchmark Cross-Validation
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Rigorous post-hoc geographic intersection benchmark comparing independently predicted satellite flood
          extents against official Copernicus Emergency Management Service (EMS) Rapid Mapping EMSR927 observed
          flood reference delineations.
        </p>
      </div>

      {/* Ethical Integrity Badge */}
      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 flex items-start space-x-3 text-emerald-200 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-emerald-300">
            Strict Scientific Independence Guarantee:
          </div>
          <p className="mt-0.5 text-emerald-200/90 leading-relaxed">
            {evaluation.methodology_note}
          </p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-900 border border-dark-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">Intersection over Union (IoU)</div>
          <div className="text-2xl font-black text-indigo-400 font-mono mt-1">
            {(evaluation.iou * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Jaccard index score</p>
        </div>

        <div className="bg-dark-900 border border-dark-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">Precision</div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            {(evaluation.precision * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">True positive / predicted</p>
        </div>

        <div className="bg-dark-900 border border-dark-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">Recall (Sensitivity)</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {(evaluation.recall * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">True positive / reference</p>
        </div>

        <div className="bg-dark-900 border border-dark-800 p-4 rounded-lg">
          <div className="text-xs text-slate-400 font-medium">F1-Score</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {(evaluation.f1_score * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Harmonic mean P & R</p>
        </div>
      </div>

      {/* Spatial Confusion Matrix Breakdown */}
      <div className="bg-dark-900 border border-dark-800 rounded-lg p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Spatial Polygon Confusion Breakdown (km²)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-dark-850 p-3.5 rounded border border-dark-750">
            <span className="text-emerald-400 font-bold">True Positive (TP) Extent:</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {evaluation.true_positive_area_sqkm} km²
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Confirmed spatial agreement between SAR detection and Copernicus EMSR927.
            </p>
          </div>

          <div className="bg-dark-850 p-3.5 rounded border border-dark-750">
            <span className="text-amber-400 font-bold">False Positive (FP) Extent:</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {evaluation.false_positive_area_sqkm} km²
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Candidate water / wet sediment detected by radar outside official EMSR927 extent.
            </p>
          </div>

          <div className="bg-dark-850 p-3.5 rounded border border-dark-750">
            <span className="text-rose-400 font-bold">False Negative (FN) Extent:</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {evaluation.false_negative_area_sqkm} km²
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Portions mapped by EMSR927 obscured by mountain radar shadow or steep terrain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
