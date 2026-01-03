import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Trade {
  id: number;
  pair: string;
  direction: 'BUY' | 'SELL';
  entry_price: number;
  exit_price?: number;
  stop_loss: number;
  take_profit: number;
  position_size: number;
  notes?: string;
  screenshot?: string;
  status: 'OPEN' | 'CLOSED';
  opened_at: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  risk_reward?: number;
  result_pips?: number;
  result_usd?: number;
}

export interface TradingStats {
  total_profit: number;
  win_rate: number;
  avg_risk_reward: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  daily_profit?: number;
  max_loss?: number;
}

export interface EquityPoint {
  date: string;
  balance: number;
}

export interface PnLByPair {
  pair: string;
  wins: number;
  losses: number;
  total_pnl: number;
}

export interface WinLossDistribution {
  wins: number;
  win_percentage: number;
  losses: number;
  loss_percentage: number;
}

export interface DailyPerformance {
  date: string;
  profit: number;
  trades: number;
}

export interface DateRangeStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  avg_risk_reward: number;
  total_profit: number;
  avg_profit: number;
}

// Journal Entry Types
export interface JournalEntry {
  id: number;
  user_id: number;
  trade_id?: number;
  entry_type: 'ANALYSIS' | 'MISTAKE' | 'SUCCESS' | 'STRATEGY';
  pair: string;
  title: string;
  content: string;
  tags?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryCreate {
  entry_type: 'ANALYSIS' | 'MISTAKE' | 'SUCCESS' | 'STRATEGY';
  pair: string;
  title: string;
  content: string;
  tags?: string;
  trade_id?: number;
}

export interface JournalEntryUpdate {
  entry_type?: 'ANALYSIS' | 'MISTAKE' | 'SUCCESS' | 'STRATEGY';
  pair?: string;
  title?: string;
  content?: string;
  tags?: string;
}

// Template Types
export interface TradeTemplate {
  id: number;
  user_id: number;
  name: string;
  pair: string;
  trade_type: string;
  entry_strategy?: string;
  exit_strategy?: string;
  risk_reward?: number;
  description?: string;
  tags?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface TradeTemplateCreate {
  name: string;
  pair: string;
  trade_type: string;
  entry_strategy?: string;
  exit_strategy?: string;
  risk_reward?: number;
  description?: string;
  tags?: string;
}

export interface TradeTemplateUpdate {
  name?: string;
  pair?: string;
  trade_type?: string;
  entry_strategy?: string;
  exit_strategy?: string;
  risk_reward?: number;
  description?: string;
  tags?: string;
}

// Goal Types
export interface TradingGoal {
  id: number;
  user_id: number;
  goal_type: string;
  period: string;
  target_value: number;
  current_value: number;
  status: string;
  progress_percentage: number;
  is_on_track: boolean;
  created_at: string;
  updated_at: string;
}

export interface TradingGoalCreate {
  goal_type: string;
  period: string;
  target_value: number;
  current_value?: number;
}

export interface TradingGoalUpdate {
  goal_type?: string;
  period?: string;
  target_value?: number;
  current_value?: number;
  status?: string;
}

export interface TradeStreak {
  id: number;
  user_id: number;
  streak_type: string;
  current_count: number;
  best_count: number;
  created_at: string;
  updated_at: string;
}

// 2FA Types
export interface TwoFactorSetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export interface TwoFactorStatus {
  is_enabled: boolean;
  backup_codes_remaining: number;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  signup: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/signup', { name, email, password });
    return response.data;
  },
  
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Trades API
export const tradesAPI = {
  getTrades: async (params?: {
    pair?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<Trade[]> => {
    const response = await api.get('/trades/', { params });
    return response.data;
  },
  
  getTrade: async (id: number): Promise<Trade> => {
    const response = await api.get(`/trades/${id}`);
    return response.data;
  },
  
  createTrade: async (trade: Partial<Trade>): Promise<Trade> => {
    const response = await api.post('/trades/', trade);
    return response.data;
  },
  
  updateTrade: async (id: number, trade: Partial<Trade>): Promise<Trade> => {
    const response = await api.put(`/trades/${id}`, trade);
    return response.data;
  },
  
  deleteTrade: async (id: number): Promise<void> => {
    await api.delete(`/trades/${id}`);
  },
  
  closeTrade: async (id: number, exitPrice: number): Promise<Trade> => {
    const response = await api.patch(`/trades/${id}/close?exit_price=${exitPrice}`);
    return response.data;
  },
};

// Stats API
export const statsAPI = {
  getSummary: async (): Promise<TradingStats> => {
    const response = await api.get('/stats/summary');
    return response.data;
  },
  
  getEquityCurve: async (): Promise<EquityPoint[]> => {
    const response = await api.get('/stats/equity_curve');
    return response.data;
  },

  getPnLByPair: async (): Promise<PnLByPair[]> => {
    const response = await api.get('/stats/pnl_by_pair');
    return response.data;
  },

  getWinLossDistribution: async (): Promise<WinLossDistribution> => {
    const response = await api.get('/stats/win_loss_distribution');
    return response.data;
  },

  getDailyPerformance: async (days: number = 30): Promise<DailyPerformance[]> => {
    const response = await api.get('/stats/daily_performance', { params: { days } });
    return response.data;
  },

  getStatsByDateRange: async (startDate?: string, endDate?: string): Promise<DateRangeStats> => {
    const response = await api.get('/stats/by_date_range', { 
      params: { start_date: startDate, end_date: endDate } 
    });
    return response.data;
  },
};

// Journal API
export const journalAPI = {
  getEntries: async (params?: {
    skip?: number;
    limit?: number;
    entry_type?: string;
    pair?: string;
  }): Promise<{ data: JournalEntry[]; total: number; skip: number; limit: number }> => {
    const response = await api.get('/journal', { params });
    return response.data;
  },
  
  getEntry: async (id: number): Promise<JournalEntry> => {
    const response = await api.get(`/journal/${id}`);
    return response.data;
  },
  
  createEntry: async (entry: JournalEntryCreate): Promise<JournalEntry> => {
    const response = await api.post('/journal', entry);
    return response.data;
  },
  
  updateEntry: async (id: number, entry: JournalEntryUpdate): Promise<JournalEntry> => {
    const response = await api.put(`/journal/${id}`, entry);
    return response.data;
  },
  
  deleteEntry: async (id: number): Promise<{ status: string }> => {
    const response = await api.delete(`/journal/${id}`);
    return response.data;
  },
  
  getEntriesByTrade: async (tradeId: number): Promise<JournalEntry[]> => {
    const response = await api.get(`/journal/trade/${tradeId}`);
    return response.data;
  },
};

// Templates API
export const templatesAPI = {
  getTemplates: async (params?: {
    skip?: number;
    limit?: number;
    pair?: string;
  }): Promise<{ data: TradeTemplate[]; total: number; skip: number; limit: number }> => {
    const response = await api.get('/templates', { params });
    return response.data;
  },
  
  getTemplate: async (id: number): Promise<TradeTemplate> => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },
  
  createTemplate: async (template: TradeTemplateCreate): Promise<TradeTemplate> => {
    const response = await api.post('/templates', template);
    return response.data;
  },
  
  updateTemplate: async (id: number, template: TradeTemplateUpdate): Promise<TradeTemplate> => {
    const response = await api.put(`/templates/${id}`, template);
    return response.data;
  },
  
  deleteTemplate: async (id: number): Promise<{ status: string }> => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  },
  
  useTemplate: async (id: number, data: { pair?: string; entry_price?: number; position_size?: number }): Promise<{ status: string; trade: Trade }> => {
    const response = await api.post(`/templates/${id}/use`, data);
    return response.data;
  },
};

// Goals API
export const goalsAPI = {
  getGoals: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: TradingGoal[]; total: number; skip: number; limit: number }> => {
    const response = await api.get('/goals', { params });
    return response.data;
  },
  
  getGoal: async (id: number): Promise<TradingGoal> => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },
  
  createGoal: async (goal: TradingGoalCreate): Promise<TradingGoal> => {
    const response = await api.post('/goals', goal);
    return response.data;
  },
  
  updateGoal: async (id: number, goal: TradingGoalUpdate): Promise<TradingGoal> => {
    const response = await api.put(`/goals/${id}`, goal);
    return response.data;
  },
  
  deleteGoal: async (id: number): Promise<{ status: string }> => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },
  
  getStreaks: async (params?: { skip?: number; limit?: number }): Promise<{ data: TradeStreak[]; total: number; skip: number; limit: number }> => {
    const response = await api.get('/goals/streaks/list', { params });
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getSummary: async (): Promise<{
    total_trades: number;
    closed_trades: number;
    open_trades: number;
    win_rate: number;
    total_profit: number;
    roi: number;
    average_profit: number;
  }> => {
    const response = await api.get('/reports/summary');
    return response.data;
  },
  
  getMonthlyReport: async (months?: number): Promise<Array<[string, any]>> => {
    const response = await api.get('/reports/monthly', { params: { months } });
    return response.data;
  },
  
  getWeeklyReport: async (weeks?: number): Promise<Array<[string, any]>> => {
    const response = await api.get('/reports/weekly', { params: { weeks } });
    return response.data;
  },
  
  getPairStats: async (): Promise<{ [pair: string]: any }> => {
    const response = await api.get('/reports/by-pair');
    return response.data;
  },
  
  getDrawdown: async (): Promise<{
    max_drawdown: number;
    drawdown_percentage: number;
    peak_capital: number;
    current_capital: number;
  }> => {
    const response = await api.get('/reports/drawdown');
    return response.data;
  },
};

// 2FA API
export const twoFAAPI = {
  setup: async (): Promise<TwoFactorSetup> => {
    const response = await api.post('/auth/2fa/setup', { enable: true });
    return response.data;
  },
  
  verify: async (otpCode: string): Promise<{ status: string }> => {
    const response = await api.post('/auth/2fa/verify', { otp_code: otpCode });
    return response.data;
  },
  
  getStatus: async (): Promise<TwoFactorStatus> => {
    const response = await api.get('/auth/2fa/status');
    return response.data;
  },
  
  disable: async (otpCode: string): Promise<{ status: string }> => {
    const response = await api.post('/auth/2fa/disable', { otp_code: otpCode });
    return response.data;
  },
  
  regenerateBackupCodes: async (otpCode: string): Promise<{ status: string; backup_codes: string[] }> => {
    const response = await api.post('/auth/2fa/regenerate-backups', { otp_code: otpCode });
    return response.data;
  },
};
