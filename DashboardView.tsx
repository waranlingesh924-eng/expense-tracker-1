import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  AlertTriangle,
  Receipt,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { DashboardSummary } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface DashboardViewProps {
  summary?: DashboardSummary | null;
  stats?: DashboardSummary | null;
  currencySymbol: string;
  onOpenQuickAdd?: (type: 'expense' | 'income') => void;
  onOpenAddExpense?: () => void;
  onOpenAddIncome?: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary: propSummary,
  stats: propStats,
  currencySymbol,
  onOpenQuickAdd,
  onOpenAddExpense,
  onOpenAddIncome,
  onNavigateTab
}) => {
  const summary = propSummary || propStats;

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const handleQuickAdd = (type: 'expense' | 'income') => {
    if (onOpenQuickAdd) {
      onOpenQuickAdd(type);
    } else if (type === 'expense' && onOpenAddExpense) {
      onOpenAddExpense();
    } else if (type === 'income' && onOpenAddIncome) {
      onOpenAddIncome();
    } else {
      onNavigateTab(type === 'income' ? 'income' : 'expenses');
    }
  };

  const {
    totalIncome = 0,
    totalExpenses = 0,
    netBalance = 0,
    savingsRate = 0,
    monthToDateExpense = 0,
    totalBudgetLimit = 0,
    budgetUsagePercent = 0,
    recentTransactions = [],
    categoryBreakdown = []
  } = summary;

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Financial Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Smart Money Dashboard</h1>
          <p className="text-sm text-slate-300 mt-1">
            Track daily expenses, monitor income streams, and maintain healthy budget discipline.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            id="dashboard-quick-add-income-btn"
            onClick={() => handleQuickAdd('income')}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Add Income</span>
          </button>
          <button
            id="dashboard-quick-add-expense-btn"
            onClick={() => handleQuickAdd('expense')}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 4 Core KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Income</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {currencySymbol}{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Includes salaries & freelance</span>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-rose-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {currencySymbol}{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>MTD: {currencySymbol}{monthToDateExpense.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Net Remaining Balance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Balance</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              netBalance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold tracking-tight ${
              netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}>
              {currencySymbol}{netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
              <span>{netBalance >= 0 ? 'Surplus liquid funds' : 'Deficit spending detected'}</span>
            </div>
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Savings Rate</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {savingsRate}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium">
              <span>{savingsRate >= 20 ? 'Optimal target (>=20%)' : 'Caution: Below 20% target'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Budget Usage Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Current Month Budget Meter</h2>
            <p className="text-xs text-slate-500">
              Aggregated spending versus established category budgets for this month
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {currencySymbol}{monthToDateExpense.toFixed(2)} of {currencySymbol}{totalBudgetLimit.toFixed(2)}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              budgetUsagePercent > 100 
                ? 'bg-rose-100 text-rose-700' 
                : budgetUsagePercent > 80 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {budgetUsagePercent}% Used
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              budgetUsagePercent > 100 
                ? 'bg-rose-500' 
                : budgetUsagePercent > 80 
                ? 'bg-amber-500' 
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
          />
        </div>

        {budgetUsagePercent > 80 && (
          <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {budgetUsagePercent > 100 
                ? 'You have surpassed your overall budget limit for this month.'
                : 'Caution: You have utilized over 80% of your allocated monthly budget.'}
            </span>
          </div>
        )}
      </div>

      {/* Grid: Category Breakdown + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spending Category Breakdown */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Spending by Category</h2>
              <button
                id="view-all-categories-link"
                onClick={() => onNavigateTab('categories')}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {categoryBreakdown.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No expense records logged yet.
                </div>
              ) : (
                categoryBreakdown.slice(0, 5).map(cat => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                          style={{ backgroundColor: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} size={14} className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-medium text-slate-800">{cat.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {currencySymbol}{cat.amount.toFixed(2)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-center">
            <button
              id="view-analytics-link"
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-semibold text-slate-600 hover:text-emerald-600"
            >
              Open Interactive Charts & Analytics &rarr;
            </button>
          </div>
        </div>

        {/* Recent Transactions Module */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Transactions</h2>
              <p className="text-xs text-slate-500">Live feed of incomes and expenses</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="view-all-expenses-link"
                onClick={() => onNavigateTab('expenses')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
              >
                All Expenses
              </button>
              <button
                id="view-all-incomes-link"
                onClick={() => onNavigateTab('income')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
              >
                All Income
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No recent transactions found. Click "Add Record" to start.
              </div>
            ) : (
              recentTransactions.map(item => {
                const isIncome = item.type === 'income';
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 rounded-lg px-2 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: `${item.color}18`, color: item.color }}
                      >
                        <CategoryIcon name={item.icon} size={18} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-600">{item.category}</span>
                          <span>•</span>
                          <span>{item.date}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px]">{item.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-sm font-bold ${
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {isIncome ? '+' : '-'}{currencySymbol}{item.amount.toFixed(2)}
                      </div>
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                        isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
