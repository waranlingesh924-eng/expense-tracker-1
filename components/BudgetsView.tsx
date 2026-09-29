import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  PieChart, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Calendar,
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import { Budget, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { DEFAULT_CATEGORIES } from '../utils/defaultCategories';

interface BudgetsViewProps {
  budgets?: (Budget & { remaining: number; usagePercent: number; isOverBudget: boolean; isWarning: boolean })[];
  categories?: Category[];
  currencySymbol: string;
  totalLimit?: number;
  totalSpent?: number;
  overallUsage?: number;
  currentMonth: string;
  onSetMonth: (m: string) => void;
  onCreateBudget: (data: { categoryId: string; monthlyLimit: number; month: string; alertThresholdPercent?: number }) => Promise<void>;
  onUpdateBudget: (id: string, data: Partial<Budget>) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets = [],
  categories = [],
  currencySymbol,
  totalLimit = 0,
  totalSpent = 0,
  overallUsage = 0,
  currentMonth,
  onSetMonth,
  onCreateBudget,
  onUpdateBudget,
  onDeleteBudget
}) => {
  const safeBudgets = Array.isArray(budgets) ? budgets : [];
  const baseCategories = (Array.isArray(categories) && categories.length > 0) ? categories : DEFAULT_CATEGORIES;
  const expenseCategories = baseCategories.filter(c => !c.type || c.type === 'expense');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form
  const [formCategory, setFormCategory] = useState(expenseCategories[0]?.id || 'cat-food');
  const [formLimit, setFormLimit] = useState('');
  const [formThreshold, setFormThreshold] = useState('80');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (expenseCategories.length > 0 && (!formCategory || !expenseCategories.some(c => c.id === formCategory))) {
      setFormCategory(expenseCategories[0].id);
    }
  }, [expenseCategories, formCategory]);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setFormCategory(expenseCategories[0]?.id || 'cat-food');
    setFormLimit('');
    setFormThreshold('80');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setFormCategory(b.categoryId);
    setFormLimit(b.monthlyLimit.toString());
    setFormThreshold(b.alertThresholdPercent.toString());
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLimit || isNaN(Number(formLimit)) || Number(formLimit) <= 0) {
      setFormError('Please specify a positive budget limit amount.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingBudget) {
        await onUpdateBudget(editingBudget.id, {
          monthlyLimit: Number(formLimit),
          alertThresholdPercent: Number(formThreshold)
        });
      } else {
        await onCreateBudget({
          categoryId: formCategory,
          monthlyLimit: Number(formLimit),
          month: currentMonth,
          alertThresholdPercent: Number(formThreshold)
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingTotal = Math.max(0, totalLimit - totalSpent);

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Budget Management</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Set monthly category spending caps, prevent budget overruns, and track usage.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              id="budget-month-picker"
              type="month"
              value={currentMonth}
              onChange={e => onSetMonth(e.target.value)}
              className="bg-transparent border-none focus:outline-none cursor-pointer font-bold text-slate-900"
            />
          </div>

          <button
            id="set-budget-modal-btn"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Set Category Budget</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {currentMonth} Monthly Budget Summary
            </span>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              {currencySymbol}{totalSpent.toFixed(2)} / {currencySymbol}{totalLimit.toFixed(2)}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Total Remaining</span>
            <span className={`text-xl font-bold ${
              totalSpent > totalLimit ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {totalSpent > totalLimit ? '-' : ''}{currencySymbol}{Math.abs(totalLimit - totalSpent).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Overall Usage Progress</span>
            <span className="font-bold">{overallUsage}%</span>
          </div>
          <div className="w-full bg-slate-700/60 h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                overallUsage > 100 
                  ? 'bg-rose-500' 
                  : overallUsage > 80 
                  ? 'bg-amber-500' 
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallUsage)}%` }}
            />
          </div>
        </div>

        {overallUsage > 100 && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Monthly limit exceeded! Review high-spend categories below.</span>
          </div>
        )}
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeBudgets.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-xl border border-slate-200 text-center">
            <PieChart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No category budgets established for {currentMonth}</p>
            <p className="text-xs text-slate-500 mt-1">
              Click "Set Category Budget" to allocate spend limits for Food, Travel, Shopping, etc.
            </p>
          </div>
        ) : (
          safeBudgets.map(b => (
            <div 
              key={b.id} 
              className={`bg-white p-5 rounded-xl border transition-all shadow-xs flex flex-col justify-between ${
                b.isOverBudget 
                  ? 'border-rose-300 ring-1 ring-rose-300' 
                  : b.isWarning 
                  ? 'border-amber-300' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: b.categoryColor }}
                    >
                      <CategoryIcon name={b.categoryIcon} size={20} className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{b.categoryName}</h3>
                      <p className="text-xs text-slate-500">Alert at {b.alertThresholdPercent}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      id={`edit-budget-${b.id}-btn`}
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit limit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      id={`delete-budget-${b.id}-btn`}
                      onClick={() => {
                        if (confirm(`Remove budget for "${b.categoryName}"?`)) {
                          onDeleteBudget(b.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Numbers */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500">Spent:</span>
                    <span className="ml-1 text-base font-bold text-slate-900">
                      {currencySymbol}{(b.spent || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Cap:</span>
                    <span className="ml-1 text-sm font-semibold text-slate-700">
                      {currencySymbol}{b.monthlyLimit.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.isOverBudget 
                          ? 'bg-rose-500' 
                          : b.isWarning 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.usagePercent)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-semibold ${
                      b.isOverBudget ? 'text-rose-600' : b.isWarning ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      {b.usagePercent}% used
                    </span>
                    <span className="text-slate-500">
                      Remaining: <strong className="text-slate-800">{currencySymbol}{b.remaining.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {b.isOverBudget ? (
                  <span className="flex items-center gap-1 text-rose-600 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Over by {currencySymbol}{((b.spent || 0) - b.monthlyLimit).toFixed(2)}
                  </span>
                ) : b.isWarning ? (
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Approaching limit ({b.usagePercent}%)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Within target
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-medium">{b.month}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Set or Edit Budget */}
      {isModalOpen && (
        <div 
          id="budget-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingBudget ? `Edit ${editingBudget.categoryName} Budget` : 'Set Monthly Budget'}
              </h2>
              <button
                id="close-budget-modal-btn"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs sm:text-sm">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              {!editingBudget && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense Category *</label>
                  <select
                    id="form-budget-category-select"
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  >
                    {expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Monthly Spending Cap ({currencySymbol}) *
                </label>
                <input
                  id="form-budget-limit-input"
                  type="number"
                  step="1"
                  required
                  placeholder="e.g. 500"
                  value={formLimit}
                  onChange={e => setFormLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Warning Alert Threshold (%)
                </label>
                <select
                  id="form-budget-threshold-select"
                  value={formThreshold}
                  onChange={e => setFormThreshold(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                >
                  <option value="70">70% of budget reached</option>
                  <option value="75">75% of budget reached</option>
                  <option value="80">80% of budget reached (Recommended)</option>
                  <option value="90">90% of budget reached</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  id="submit-budget-form-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : editingBudget ? 'Save Changes' : 'Establish Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
