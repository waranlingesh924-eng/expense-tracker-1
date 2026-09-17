import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { IncomeView } from './components/IncomeView';
import { CategoriesView } from './components/CategoriesView';
import { BudgetsView } from './components/BudgetsView';
import { ReportsView } from './components/ReportsView';
import { NotificationsView } from './components/NotificationsView';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { ApiTesterModal } from './components/ApiTesterModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { api } from './services/api';
import { getCurrencySymbol } from './utils/currencies';
import { DEFAULT_CATEGORIES } from './utils/defaultCategories';
import { 
  Expense, 
  Income, 
  Category, 
  Budget, 
  AppNotification, 
  DashboardStats, 
  AppSettings 
} from './types';

function MainAppContent() {
  const { user, isAuthenticated, setCurrency, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'income' | 'categories' | 'budgets' | 'reports' | 'notifications' | 'admin'>('dashboard');
  const [budgetMonth, setBudgetMonth] = useState('2026-09');

  // Core domain states with robust initial defaults
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgetsData, setBudgetsData] = useState<any>({ budgets: [], totalLimit: 0, totalSpent: 0, overallUsage: 0 });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isApiTesterOpen, setIsApiTesterOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // Fetch all user domain data
  const refreshAllData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      const [
        statsData,
        expensesData,
        incomesData,
        catsData,
        budgetsResponse,
        notifsData,
        settingsData
      ] = await Promise.all([
        api.getDashboardStats(budgetMonth),
        api.getExpenses(),
        api.getIncomes(),
        api.getCategories(),
        api.getBudgets(budgetMonth),
        api.getNotifications(),
        api.getSettings()
      ]);

      setDashboardStats(statsData);
      setExpenses(expensesData.expenses || []);
      setIncomes(incomesData.incomes || []);
      setCategories(catsData);
      setBudgetsData(budgetsResponse);
      setNotifications(notifsData.notifications || []);
      setSettings(settingsData);
    } catch (err) {
      console.error('Error fetching domain data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, budgetMonth]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handler functions
  const handleAddExpense = async (data: any) => {
    await api.createExpense(data);
    await refreshAllData();
  };

  const handleEditExpense = async (id: string, data: any) => {
    await api.updateExpense(id, data);
    await refreshAllData();
  };

  const handleDeleteExpense = async (id: string) => {
    // Optimistically remove from state for instant feedback
    setExpenses(prev => prev.filter(e => e.id !== id));
    await api.deleteExpense(id);
    await refreshAllData();
  };

  const handleAddIncome = async (data: any) => {
    await api.createIncome(data);
    await refreshAllData();
  };

  const handleEditIncome = async (id: string, data: any) => {
    await api.updateIncome(id, data);
    await refreshAllData();
  };

  const handleDeleteIncome = async (id: string) => {
    // Optimistically remove from state for instant feedback
    setIncomes(prev => prev.filter(i => i.id !== id));
    await api.deleteIncome(id);
    await refreshAllData();
  };

  const handleCreateCategory = async (data: any) => {
    await api.createCategory(data);
    await refreshAllData();
  };

  const handleUpdateCategory = async (id: string, data: any) => {
    await api.updateCategory(id, data);
    await refreshAllData();
  };

  const handleDeleteCategory = async (id: string) => {
    await api.deleteCategory(id);
    await refreshAllData();
  };

  const handleCreateBudget = async (data: any) => {
    await api.createBudget(data);
    await refreshAllData();
  };

  const handleUpdateBudget = async (id: string, data: any) => {
    await api.updateBudget(id, data);
    await refreshAllData();
  };

  const handleDeleteBudget = async (id: string) => {
    await api.deleteBudget(id);
    await refreshAllData();
  };

  const handleMarkNotifRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotifsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDeleteNotif = async (id: string) => {
    await api.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const activeCurrencyCode = user?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(activeCurrencyCode);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg animate-pulse">
            FT
          </div>
          <p className="text-xs font-semibold text-slate-500">Loading FinTrack Financial Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectTab={setActiveTab}
        currencyCode={activeCurrencyCode}
        onCurrencyChange={setCurrency}
        notifications={notifications || []}
        unreadNotificationsCount={(notifications || []).filter(n => !n.isRead).length}
        onMarkNotificationRead={handleMarkNotifRead}
        onMarkAllNotificationsRead={handleMarkAllNotifsRead}
        onOpenQuickAdd={(type) => setActiveTab(type === 'income' ? 'income' : 'expenses')}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuthModal={(m) => { 
          if (m === 'profile' || m === 'password') {
            setIsProfileModalOpen(true);
          } else {
            setAuthMode(m); 
            setIsAuthModalOpen(true); 
          }
        }}
        onOpenApiTester={() => setIsApiTesterOpen(true)}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            summary={dashboardStats}
            stats={dashboardStats}
            currencySymbol={currencySymbol}
            currencyCode={activeCurrencyCode}
            onOpenQuickAdd={(type) => setActiveTab(type === 'income' ? 'income' : 'expenses')}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            categories={categories}
            currencySymbol={currencySymbol}
            currencyCode={activeCurrencyCode}
            onCurrencyChange={setCurrency}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'income' && (
          <IncomeView
            incomes={incomes}
            categories={categories}
            currencySymbol={currencySymbol}
            currencyCode={activeCurrencyCode}
            onCurrencyChange={setCurrency}
            onAddIncome={handleAddIncome}
            onEditIncome={handleEditIncome}
            onDeleteIncome={handleDeleteIncome}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            currencySymbol={currencySymbol}
            currencyCode={activeCurrencyCode}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            budgets={budgetsData.budgets || []}
            categories={categories}
            currencySymbol={currencySymbol}
            totalLimit={budgetsData.totalLimit || 0}
            totalSpent={budgetsData.totalSpent || 0}
            overallUsage={budgetsData.overallUsage || 0}
            currentMonth={budgetMonth}
            onSetMonth={setBudgetMonth}
            onCreateBudget={handleCreateBudget}
            onUpdateBudget={handleUpdateBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            currencySymbol={currencySymbol}
            expenses={expenses}
            incomes={incomes}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            onMarkRead={handleMarkNotifRead}
            onMarkAllRead={handleMarkAllNotifsRead}
            onDeleteNotification={handleDeleteNotif}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            onSettingsUpdated={refreshAllData}
            onDataReset={refreshAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/60 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">FinTrack</span>
            <span>• Full-Stack Expense & Budget Management System</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsApiTesterOpen(true)}
              className="hover:text-emerald-700 font-medium transition-colors"
            >
              Postman API Tester
            </button>
            <button 
              onClick={() => setIsArchitectureModalOpen(true)}
              className="hover:text-emerald-700 font-medium transition-colors"
            >
              Django / Spring Boot Architecture
            </button>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <ApiTesterModal
        isOpen={isApiTesterOpen}
        onClose={() => setIsApiTesterOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
