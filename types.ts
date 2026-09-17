export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  currency: string;
  createdAt: string;
  isActive: boolean;
  phone?: string;
  occupation?: string;
}

export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  description?: string;
  isDefault?: boolean;
  budgetLimit?: number;
}

export type PaymentMethod = 
  | 'Cash' 
  | 'Credit Card' 
  | 'Debit Card' 
  | 'Bank Transfer' 
  | 'Digital Wallet' 
  | 'UPI'
  | 'Other';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export type IncomeSource = 
  | 'Salary' 
  | 'Freelancing' 
  | 'Investments' 
  | 'Business' 
  | 'Rental' 
  | 'Dividends' 
  | 'Bonus' 
  | 'Gift' 
  | 'Other';

export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: IncomeSource;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMode: string;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string; // or 'total'
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  monthlyLimit: number;
  spent?: number;
  month: string; // YYYY-MM
  alertThresholdPercent: number; // e.g. 80
}

export type NotificationType = 'budget_alert' | 'expense_reminder' | 'monthly_summary' | 'system';
export type NotificationSeverity = 'info' | 'warning' | 'danger' | 'success';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  isRead: boolean;
  createdAt: string;
}

export interface AppSettings {
  currencyCode: string;
  currencySymbol: string;
  budgetWarningThreshold: number; // percentage, e.g. 80
  budgetDangerThreshold: number; // percentage, e.g. 100
  fiscalMonthStartDay: number;
  dateFormat: string;
  allowGuestMode: boolean;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  monthToDateExpense: number;
  monthToDateIncome: number;
  totalBudgetLimit: number;
  budgetUsagePercent: number;
  recentTransactions: Array<{
    id: string;
    type: 'expense' | 'income';
    amount: number;
    title: string;
    category: string;
    date: string;
    icon: string;
    color: string;
    paymentMethod: string;
  }>;
  categoryBreakdown: Array<{
    name: string;
    amount: number;
    percentage: number;
    color: string;
    icon: string;
  }>;
}

export type DashboardStats = DashboardSummary;

export interface ApiTestPreset {
  id: string;
  category: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  defaultHeaders?: Record<string, string>;
  defaultBody?: any;
}
