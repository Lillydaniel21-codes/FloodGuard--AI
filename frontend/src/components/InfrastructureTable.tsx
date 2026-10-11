import React, { useState } from 'react';
import {
  Building,
  Route,
  AlertTriangle,
  Hospital,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { InfrastructureItem } from '../types';

interface InfrastructureTableProps {
  items: InfrastructureItem[];
}

export const InfrastructureTable: React.FC<InfrastructureTableProps> = ({ items }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExposure, setSelectedExposure] = useState<string>('all');

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesExposure = selectedExposure === 'all' || item.exposure_class === selectedExposure;
    const matchesQuery =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evidence_method.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesExposure && matchesQuery;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'building':
        return <Building className="w-3.5 h-3.5 text-amber-400" />;
      case 'road':
        return <Route className="w-3.5 h-3.5 text-rose-400" />;
      case 'bridge':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
      case 'hospital':
        return <Hospital className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Building className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getExposureBadge = (expClass: string) => {
    switch (expClass) {
      case 'Potentially affected':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
            Potentially affected
          </span>
        );
      case 'Possibly exposed':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
            Possibly exposed
          </span>
        );
      case 'No detected overlap':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">
            No detected overlap
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-850 text-slate-400">
            {expClass}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-6 bg-dark-950 overflow-y-auto select-none space-y-4">
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>Pre-Event Infrastructure Exposure Assessment</span>
          </h2>
          <p className="text-xs text-slate-400">
            Deduplicated pre-event OpenStreetMap assets overlaid with satellite flood extents
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-dark-900 border border-dark-750 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-44 sm:w-56"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-dark-900 border border-dark-750 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            <option value="building">Buildings</option>
            <option value="road">Roads</option>
            <option value="bridge">Bridges</option>
            <option value="hospital">Hospitals</option>
          </select>

          {/* Exposure Filter */}
          <select
            value={selectedExposure}
            onChange={(e) => setSelectedExposure(e.target.value)}
            className="bg-dark-900 border border-dark-750 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Exposure Classes</option>
            <option value="Potentially affected">Potentially affected</option>
            <option value="Possibly exposed">Possibly exposed</option>
            <option value="No detected overlap">No detected overlap</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-dark-900 border border-dark-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-dark-850 border-b border-dark-800 text-slate-400 uppercase text-[10px] font-mono">
              <tr>
                <th className="py-3 px-4">Asset ID / Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Exposure Class</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Geospatial Evidence & Method</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No infrastructure assets matched your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-850/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{item.name || 'Unnamed'}</div>
                      <div className="text-[10px] font-mono text-slate-400">{item.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5 capitalize font-medium text-slate-300">
                        {getCategoryIcon(item.category)}
                        <span>{item.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getExposureBadge(item.exposure_class)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          item.confidence === 'High'
                            ? 'text-emerald-400'
                            : item.confidence === 'Medium'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.confidence}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-300 leading-snug">
                      {item.evidence_method}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-slate-400">{item.verification_status}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {item.coordinates[1].toFixed(4)}°N, {item.coordinates[0].toFixed(4)}°E
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
