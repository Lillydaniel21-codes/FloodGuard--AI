import axios from 'axios';
import {
  AnalysisRequest,
  AnalysisResponse,
  CaseStudyPreset,
  DataSourceInfo,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  SupportedLanguage,
  UserProfile,
} from '../types';

const API_BASE = '/api';

// Attach authorization header automatically if token exists in localStorage
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('fg_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiClient = {
  login: async (creds: LoginRequest): Promise<LoginResponse> => {
    const res = await axios.post(`${API_BASE}/auth/login`, creds);
    if (res.data?.token) {
      localStorage.setItem('fg_auth_token', res.data.token);
      localStorage.setItem('fg_auth_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const res = await axios.post(`${API_BASE}/auth/register`, data);
    if (res.data?.token) {
      localStorage.setItem('fg_auth_token', res.data.token);
      localStorage.setItem('fg_auth_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await axios.post(`${API_BASE}/auth/logout`);
    } catch (e) {
      // Continue client cleanup even if network fails
    } finally {
      localStorage.removeItem('fg_auth_token');
      localStorage.removeItem('fg_auth_user');
    }
  },

  getMe: async (): Promise<UserProfile> => {
    const res = await axios.get(`${API_BASE}/auth/me`);
    return res.data;
  },

  getHealth: async () => {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  getDataSources: async (): Promise<DataSourceInfo[]> => {
    const res = await axios.get(`${API_BASE}/data-sources`);
    return res.data;
  },

  getCaseStudies: async (): Promise<CaseStudyPreset[]> => {
    const res = await axios.get(`${API_BASE}/case-studies`);
    return res.data;
  },

  runAnalysis: async (params: AnalysisRequest): Promise<AnalysisResponse> => {
    const res = await axios.post(`${API_BASE}/analysis`, params);
    return res.data;
  },

  getAnalysis: async (id: string): Promise<AnalysisResponse> => {
    const res = await axios.get(`${API_BASE}/analysis/${id}`);
    return res.data;
  },

  copilotChat: async (
    analysisId: string,
    message: string,
    language: SupportedLanguage = 'en'
  ) => {
    const res = await axios.post(`${API_BASE}/analysis/${analysisId}/copilot/chat`, {
      message,
      language,
    });
    return res.data;
  },

  globalCopilotChat: async (
    message: string,
    language: SupportedLanguage = 'en'
  ) => {
    const res = await axios.post(`${API_BASE}/copilot/chat`, {
      message,
      language,
    });
    return res.data;
  },

  getReportPdfUrl: (analysisId: string) => {
    return `${API_BASE}/analysis/${analysisId}/report.pdf`;
  },

  getExportJsonUrl: (analysisId: string) => {
    return `${API_BASE}/analysis/${analysisId}/export.json`;
  },
};
