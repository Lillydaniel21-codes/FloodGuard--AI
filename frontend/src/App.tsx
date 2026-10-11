import React, { useState, useEffect } from 'react';
import { Navbar, ViewState } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { DashboardOverview } from './components/DashboardOverview';
import { BeforeAfterComparison } from './components/BeforeAfterComparison';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { FloatingChatbot } from './components/FloatingChatbot';
import { ControlPanel } from './components/ControlPanel';
import { MapView } from './components/MapView';
import { IntelligencePanel } from './components/IntelligencePanel';
import { InfrastructureTable } from './components/InfrastructureTable';
import { IsolatedSettlements } from './components/IsolatedSettlements';
import { DownstreamFlow } from './components/DownstreamFlow';
import { EvaluationBenchmark } from './components/EvaluationBenchmark';
import { AttributionModal } from './components/AttributionModal';
import { apiClient } from './services/api';
import {
  AnalysisRequest,
  AnalysisResponse,
  CaseStudyPreset,
  DataSourceInfo,
  UserProfile,
} from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [caseStudies, setCaseStudies] = useState<CaseStudyPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('trishuli-aug-2026');
  const [dataSources, setDataSources] = useState<DataSourceInfo[]>([]);
  const [isAttributionOpen, setIsAttributionOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Analysis Request Parameters
  const [requestParams, setRequestParams] = useState<AnalysisRequest>({
    preset_id: 'trishuli-aug-2026',
    aoi_bbox: {
      min_lon: 85.08,
      min_lat: 27.88,
      max_lon: 85.35,
      max_lat: 28.18,
    },
    event_date: '2026-08-26',
    pre_event_window_days: 14,
    post_event_window_days: 10,
    satellite_platform: 'combined',
    radar_threshold_db: -3.2,
    ndwi_threshold: 0.18,
    cloud_threshold_pct: 40.0,
    include_dem_analysis: true,
    use_ai_model: false,
  });

  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [stageMessage, setStageMessage] = useState<string>('');

  // Initial Load: Fetch Session, Case Studies & Run Baseline Analysis
  useEffect(() => {
    const initialize = async () => {
      // 1. Restore local session or check token
      const storedUser = localStorage.getItem('fg_auth_user');
      const token = localStorage.getItem('fg_auth_token');

      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          // ignore parsing error
        }
      } else if (token) {
        try {
          const me = await apiClient.getMe();
          setCurrentUser(me);
        } catch (e) {
          // ignore
        }
      }

      // 2. Load case study presets & data sources
      try {
        const [csList, dsList] = await Promise.all([
          apiClient.getCaseStudies(),
          apiClient.getDataSources(),
        ]);
        setCaseStudies(csList);
        setDataSources(dsList);

        // Preload baseline analysis for Trishuli
        handleRunAnalysis();
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    initialize();
  }, []);

  const handleRunAnalysis = async (paramsToRun?: AnalysisRequest) => {
    const params = paramsToRun || requestParams;
    setIsProcessing(true);
    setProgressPercent(15);
    setStageMessage('Searching Copernicus Sentinel catalog...');

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 40) {
          setStageMessage('Processing Sentinel-1 SAR backscatter...');
          return prev + 15;
        } else if (prev < 70) {
          setStageMessage('Overlaying pre-event OpenStreetMap assets...');
          return prev + 15;
        } else if (prev < 90) {
          setStageMessage('Running NetworkX road graph reachability engine...');
          return prev + 10;
        }
        return prev;
      });
    }, 400);

    try {
      const result = await apiClient.runAnalysis(params);
      clearInterval(interval);
      setProgressPercent(100);
      setStageMessage('Analysis completed successfully.');
      setAnalysis(result);
    } catch (err) {
      clearInterval(interval);
      console.error('Pipeline execution error:', err);
      setStageMessage('Analysis failed. Check server logs.');
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = caseStudies.find((c) => c.id === presetId);
    if (preset) {
      const updated: AnalysisRequest = {
        ...requestParams,
        preset_id: preset.id,
        aoi_bbox: preset.bbox,
        event_date: preset.event_date,
        satellite_platform: preset.recommended_platform,
      };
      setRequestParams(updated);
      handleRunAnalysis(updated);
    }
  };

  const handleResetParams = () => {
    const defaultParams: AnalysisRequest = {
      preset_id: 'trishuli-aug-2026',
      aoi_bbox: {
        min_lon: 85.08,
        min_lat: 27.88,
        max_lon: 85.35,
        max_lat: 28.18,
      },
      event_date: '2026-08-26',
      pre_event_window_days: 14,
      post_event_window_days: 10,
      satellite_platform: 'combined',
      radar_threshold_db: -3.2,
      ndwi_threshold: 0.18,
      cloud_threshold_pct: 40.0,
      include_dem_analysis: true,
      use_ai_model: false,
    };
    setRequestParams(defaultParams);
  };

  const handleDownloadPdf = () => {
    if (!analysis) return;
    const url = apiClient.getReportPdfUrl(analysis.analysis_id);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FloodGuard_SitRep_${analysis.analysis_id.slice(0, 8)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    if (!analysis) return;
    const url = apiClient.getExportJsonUrl(analysis.analysis_id);
    window.open(url, '_blank');
  };

  const handleLogout = async () => {
    await apiClient.logout();
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleRegisterSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-dark-950 text-slate-100 relative">
      {/* Universal Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        caseStudies={caseStudies}
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        analysis={analysis}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAttribution={() => setIsAttributionOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        onExportJson={handleExportJson}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* 1. Home / Landing Page */}
        {currentView === 'home' && (
          <HomePage
            currentUser={currentUser}
            onNavigateToMap={() => setCurrentView('map')}
            onNavigateToDashboard={() => setCurrentView('dashboard')}
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToRegister={() => setCurrentView('register')}
            onNavigateToComparison={() => setCurrentView('satellite')}
            onOpenAttribution={() => setIsAttributionOpen(true)}
            onTriggerChat={() => setIsChatOpen(true)}
          />
        )}

        {/* 2. User Dashboard */}
        {currentView === 'dashboard' && (
          <DashboardOverview
            analysis={analysis}
            currentUser={currentUser}
            onNavigateToMap={() => setCurrentView('map')}
            onNavigateToInfrastructure={() => setCurrentView('infrastructure')}
            onNavigateToSettlements={() => setCurrentView('settlements')}
            onNavigateToFlow={() => setCurrentView('flow')}
            onNavigateToComparison={() => setCurrentView('satellite')}
            onDownloadPdf={handleDownloadPdf}
            onExportJson={handleExportJson}
          />
        )}

        {/* 3. Before & After Satellite Comparison */}
        {currentView === 'satellite' && (
          <BeforeAfterComparison
            onNavigateToMap={() => setCurrentView('map')}
          />
        )}

        {/* 4. Incident Command Login */}
        {currentView === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentView('register')}
            onNavigateToHome={() => setCurrentView('home')}
          />
        )}

        {/* 5. Incident Command Register */}
        {currentView === 'register' && (
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToHome={() => setCurrentView('home')}
          />
        )}

        {/* 6. Live Interactive Command Map & Control Center */}
        {currentView === 'map' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Control Panel for Raster Parameters */}
            <ControlPanel
              requestParams={requestParams}
              onChangeParams={setRequestParams}
              onRunAnalysis={() => handleRunAnalysis()}
              isProcessing={isProcessing}
              progressPercent={progressPercent}
              stageMessage={stageMessage}
              onResetParams={handleResetParams}
            />

            {/* Leaflet Map & Right Intelligence Panel */}
            <div className="flex-1 flex overflow-hidden">
              <MapView
                analysis={analysis}
                onSelectCoordinate={(coords) => {
                  console.log('Selected coordinate:', coords);
                }}
              />
              <IntelligencePanel analysis={analysis} />
            </div>
          </div>
        )}

        {/* 7. Damaged Infrastructure Analysis Table */}
        {currentView === 'infrastructure' && (
          <InfrastructureTable items={analysis?.infrastructure_summary || []} />
        )}

        {/* 8. Isolated Settlements & Airdrop Dropzones */}
        {currentView === 'settlements' && (
          <IsolatedSettlements
            settlements={analysis?.isolated_settlements || []}
          />
        )}

        {/* 9. Downstream Hydrologic Terrain Flow Simulation */}
        {currentView === 'flow' && (
          <DownstreamFlow
            flowPath={analysis?.flow_path_bonus || null}
            settlements={analysis?.isolated_settlements || []}
            onTriggerFlowSimulation={(seedLon, seedLat) => {
              const updated = {
                ...requestParams,
                aoi_bbox: {
                  ...requestParams.aoi_bbox!,
                  min_lon: Math.min(requestParams.aoi_bbox!.min_lon, seedLon - 0.05),
                  max_lon: Math.max(requestParams.aoi_bbox!.max_lon, seedLon + 0.05),
                },
              };
              handleRunAnalysis(updated);
            }}
          />
        )}

        {/* 10. Copernicus EMS EMSR927 Rapid Mapping Validation */}
        {currentView === 'evaluation' && (
          <EvaluationBenchmark
            evaluation={analysis?.evaluation_benchmark || null}
          />
        )}
      </main>

      {/* Global Floating AI Situation Copilot across all pages */}
      <FloatingChatbot
        currentAnalysisId={analysis?.analysis_id || null}
        isOpen={isChatOpen}
        onToggleOpen={setIsChatOpen}
      />

      {/* Legal Licensing & Data Attribution Modal */}
      <AttributionModal
        isOpen={isAttributionOpen}
        onClose={() => setIsAttributionOpen(false)}
        dataSources={dataSources}
      />
    </div>
  );
};

export default App;
