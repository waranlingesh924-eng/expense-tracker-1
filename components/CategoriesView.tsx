import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Tags, 
  Layers, 
  Check, 
  X, 
  DollarSign,
  Palette,
  FolderOpen
} from 'lucide-react';
import { Category, TransactionType } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { DEFAULT_CATEGORIES } from '../utils/defaultCategories';

interface CategoriesViewProps {
  categories?: Category[];
  currencySymbol: string;
  currencyCode?: string;
  onCreateCategory: (data: Partial<Category>) => Promise<void>;
  onUpdateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

const AVAILABLE_COLORS = [
  '#f97316', '#0ea5e9', '#ec4899', '#eab308', 
  '#8b5cf6', '#ef4444', '#6366f1', '#14b8a6', 
  '#10b981', '#06b6d4', '#3b82f6', '#f59e0b', 
  '#84cc16', '#d946ef', '#64748b', '#78716c'
];

const AVAILABLE_ICONS = [
  'Utensils', 'Car', 'ShoppingBag', 'Zap', 
  'Home', 'HeartPulse', 'Film', 'GraduationCap', 
  'Briefcase', 'Laptop', 'TrendingUp', 'Store', 
  'Building', 'Gift', 'Coffee', 'Plane', 
  'Smartphone', 'Shield', 'BookOpen', 'Wifi', 
  'PawPrint', 'PiggyBank', 'Tag'
];

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories = [],
  currencySymbol,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const safeCategories = (Array.isArray(categories) && categories.length > 0) 
    ? categories 
    : DEFAULT_CATEGORIES;
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formColor, setFormColor] = useState('#6366f1');
  const [formIcon, setFormIcon] = useState('Tag');
  const [formDescription, setFormDescription] = useState('');
  const [formBudgetLimit, setFormBudgetLimit] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayedCategories = safeCategories.filter(c => c.type === activeTab);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormName('');
    setFormType(activeTab);
    setFormColor(AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)]);
    setFormIcon('Tag');
    setFormDescription('');
    setFormBudgetLimit('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormType(cat.type);
    setFormColor(cat.color);
    setFormIcon(cat.icon);
    setFormDescription(cat.description || '');
    setFormBudgetLimit(cat.budgetLimit ? cat.budgetLimit.toString() : '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, {
          name: formName.trim(),
          color: formColor,
          icon: formIcon,
          description: formDescription.trim(),
          budgetLimit: formBudgetLimit ? Number(formBudgetLimit) : undefined
        });
      } else {
        await onCreateCategory({
          name: formName.trim(),
          type: formType,
          color: formColor,
          icon: formIcon,
          description: formDescription.trim(),
          budgetLimit: formBudgetLimit ? Number(formBudgetLimit) : undefined
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define classification buckets, custom visual tags, and default spending thresholds.
          </p>
        </div>

        <button
          id="create-category-btn"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Expense vs Income Type Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          id="tab-expense-categories-btn"
          onClick={() => setActiveTab('expense')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'expense'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Expense Categories ({safeCategories.filter(c => c.type === 'expense').length})</span>
        </button>
        <button
          id="tab-income-categories-btn"
          onClick={() => setActiveTab('income')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'income'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Income Categories ({safeCategories.filter(c => c.type === 'income').length})</span>
        </button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedCategories.map(cat => (
          <div 
            key={cat.id} 
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={20} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">{cat.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {cat.isDefault && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          System Default
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">{cat.color}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    id={`edit-cat-${cat.id}-btn`}
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {!cat.isDefault && (
                    <button
                      id={`delete-cat-${cat.id}-btn`}
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                          onDeleteCategory(cat.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {cat.description && (
                <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                  {cat.description}
                </p>
              )}
            </div>

            {cat.budgetLimit && cat.type === 'expense' && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Suggested Budget:</span>
                <span className="font-bold text-slate-800">{currencySymbol}{cat.budgetLimit.toFixed(2)}/mo</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Create or Edit Category */}
      {isModalOpen && (
        <div 
          id="category-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create Custom Category'}
              </h2>
              <button
                id="close-category-modal-btn"
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  id="form-category-name-input"
                  type="text"
                  required
                  placeholder="e.g. Subscriptions, Pet Care, Fitness"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                />
              </div>

              {!editingCategory && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType('expense')}
                      className={`p-2 rounded-lg border text-center font-medium ${
                        formType === 'expense'
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('income')}
                      className={`p-2 rounded-lg border text-center font-medium ${
                        formType === 'income'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>
              )}

              {/* Color Swatches */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Theme Color</span>
                  <span className="font-mono text-[11px] text-slate-400">{formColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                        formColor === c ? 'scale-110 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {formColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Select Icon</label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {AVAILABLE_ICONS.map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormIcon(iconName)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                        formIcon === iconName 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'hover:bg-slate-200 text-slate-600'
                      }`}
                      title={iconName}
                    >
                      <CategoryIcon name={iconName} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  id="form-category-desc-input"
                  type="text"
                  placeholder="e.g. Daily meals, coffee, grocery store runs"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              {formType === 'expense' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Suggested Monthly Budget ({currencySymbol})
                  </label>
                  <input
                    id="form-category-budget-input"
                    type="number"
                    step="1"
                    placeholder="Optional budget benchmark, e.g. 500"
                    value={formBudgetLimit}
                    onChange={e => setFormBudgetLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  id="submit-category-form-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
