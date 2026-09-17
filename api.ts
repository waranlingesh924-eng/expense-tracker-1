import { 
  User, 
  Expense, 
  Income, 
  Category, 
  Budget, 
  AppNotification, 
  AppSettings, 
  DashboardSummary 
} from '../types';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('fintrack_token') || '';
  const userStr = localStorage.getItem('fintrack_user');
  let userId = 'usr-demo-1';
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u && u.id) userId = u.id;
    } catch {
      // fallback
    }
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-user-id': userId
  };
}

export const api = {
  // Auth
  async login(identifier: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    return res.json();
  },

  async register(data: { username: string; email: string; password: string; fullName: string; phone?: string; occupation?: string }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getProfile(): Promise<User> {
    const res = await fetch('/api/auth/profile', {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(data: Partial<User>) {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to change password');
    }
    return res.json();
  },

  // Expenses
  async getExpenses(params?: { search?: string; category?: string; startDate?: string; endDate?: string; minAmount?: number; maxAmount?: number; sortBy?: string; sortOrder?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.minAmount) query.set('minAmount', params.minAmount.toString());
    if (params?.maxAmount) query.set('maxAmount', params.maxAmount.toString());
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);

    const res = await fetch(`/api/expenses?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json() as Promise<{ count: number; totalAmount: number; expenses: Expense[] }>;
  },

  async createExpense(expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(expense)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create expense');
    }
    return res.json();
  },

  async updateExpense(id: string, expense: Partial<Expense>) {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(expense)
    });
    if (!res.ok) throw new Error('Failed to update expense');
    return res.json();
  },

  async deleteExpense(id: string) {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete expense');
    return res.json();
  },

  // Income
  async getIncomes(params?: { search?: string; source?: string; startDate?: string; endDate?: string; minAmount?: number; maxAmount?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.source) query.set('source', params.source);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.minAmount) query.set('minAmount', params.minAmount.toString());
    if (params?.maxAmount) query.set('maxAmount', params.maxAmount.toString());

    const res = await fetch(`/api/incomes?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch incomes');
    return res.json() as Promise<{ count: number; totalAmount: number; incomes: Income[] }>;
  },

  async createIncome(income: Omit<Income, 'id' | 'userId' | 'createdAt'>) {
    const res = await fetch('/api/incomes', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(income)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create income');
    }
    return res.json();
  },

  async updateIncome(id: string, income: Partial<Income>) {
    const res = await fetch(`/api/incomes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(income)
    });
    if (!res.ok) throw new Error('Failed to update income');
    return res.json();
  },

  async deleteIncome(id: string) {
    const res = await fetch(`/api/incomes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete income');
    return res.json();
  },

  // Categories
  async getCategories(type?: 'expense' | 'income'): Promise<Category[]> {
    const url = type ? `/api/categories?type=${type}` : '/api/categories';
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(data: Partial<Category>) {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create category');
    }
    return res.json();
  },

  async updateCategory(id: string, data: Partial<Category>) {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  async deleteCategory(id: string) {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete category');
    }
    return res.json();
  },

  // Budgets
  async getBudgets(month?: string) {
    const url = month ? `/api/budgets?month=${month}` : '/api/budgets';
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json() as Promise<{
      month: string;
      totalBudgetLimit: number;
      totalBudgetSpent: number;
      overallUsagePercent: number;
      budgets: (Budget & { remaining: number; usagePercent: number; isOverBudget: boolean; isWarning: boolean })[];
    }>;
  },

  async createBudget(data: { categoryId: string; monthlyLimit: number; month?: string; alertThresholdPercent?: number }) {
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to set budget');
    }
    return res.json();
  },

  async updateBudget(id: string, data: Partial<Budget>) {
    const res = await fetch(`/api/budgets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update budget');
    return res.json();
  },

  async deleteBudget(id: string) {
    const res = await fetch(`/api/budgets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete budget');
    return res.json();
  },

  // Dashboard & Analytics
  async getDashboardStats(month?: string): Promise<DashboardSummary> {
    const url = month ? `/api/dashboard/stats?month=${month}` : '/api/dashboard/stats';
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  async getReportsAnalytics(timeframe?: string) {
    const url = timeframe ? `/api/reports/analytics?timeframe=${timeframe}` : '/api/reports/analytics';
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch reports analytics');
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<{ unreadCount: number; notifications: AppNotification[] }> {
    const res = await fetch('/api/notifications', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async deleteNotification(id: string) {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Admin
  async getAdminUsers() {
    const res = await fetch('/api/admin/users', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async updateUserStatus(id: string, data: { isActive?: boolean; role?: 'user' | 'admin' }) {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update user status');
    return res.json();
  },

  async getSystemStats() {
    const res = await fetch('/api/admin/system-stats', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch system stats');
    return res.json();
  },

  async getSettings(): Promise<AppSettings> {
    const res = await fetch('/api/admin/settings', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings>) {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async resetDemoData() {
    const res = await fetch('/api/seed-demo-data', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getApiEndpoints() {
    const res = await fetch('/api/docs/endpoints');
    return res.json();
  }
};
