import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Calendar, 
  DollarSign, 
  SlidersHorizontal,
  X,
  CreditCard,
  ArrowUpDown,
  AlertTriangle
} from 'lucide-react';
import { Expense, Category, PaymentMethod } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from '../utils/currencies';
import { DEFAULT_CATEGORIES } from '../utils/defaultCategories';

interface ExpensesViewProps {
  expenses?: Expense[];
  categories?: Category[];
  currencySymbol: string;
  currencyCode?: string;
  onCurrencyChange?: (code: string) => Promise<void> | void;
  onAddExpense: (data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'categoryName' | 'categoryIcon' | 'categoryColor'>) => Promise<void>;
  onEditExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses = [],
  categories = [],
  currencySymbol,
  currencyCode = 'USD',
  onCurrencyChange,
  onAddExpense,
  onEditExpense,
  onDeleteExpense
}) => {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const baseCategories = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;
  const expenseCategories = baseCategories.filter(c => !c.type || c.type === 'expense');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState(currencyCode);
  const [formCategory, setFormCategory] = useState(expenseCategories[0]?.id || 'cat-food');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep form currency in sync if prop changes
  useEffect(() => {
    if (currencyCode) {
      setFormCurrency(currencyCode);
    }
  }, [currencyCode]);

  // Keep form category aligned if categories update
  useEffect(() => {
    if (expenseCategories.length > 0) {
      if (!formCategory || !expenseCategories.some(c => c.id === formCategory)) {
        setFormCategory(expenseCategories[0].id);
      }
    }
  }, [expenseCategories, formCategory]);

  // Filter computation
  const filteredExpenses = safeExpenses.filter(exp => {
    // text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = exp.description.toLowerCase().includes(q);
      const matchCat = exp.categoryName.toLowerCase().includes(q);
      const matchNotes = exp.notes ? exp.notes.toLowerCase().includes(q) : false;
      const matchMethod = exp.paymentMethod.toLowerCase().includes(q);
      if (!matchDesc && !matchCat && !matchNotes && !matchMethod) return false;
    }

    // category filter
    if (selectedCategory !== 'all' && exp.categoryId !== selectedCategory) {
      return false;
    }

    // date filters
    if (startDate && exp.date < startDate) return false;
    if (endDate && exp.date > endDate) return false;

    // amount filters
    if (minAmount && exp.amount < Number(minAmount)) return false;
    if (maxAmount && exp.amount > Number(maxAmount)) return false;

    return true;
  }).sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'amount') return (a.amount - b.amount) * order;
    if (sortBy === 'category') return a.categoryName.localeCompare(b.categoryName) * order;
    return a.date.localeCompare(b.date) * order;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormAmount('');
    setFormCategory(expenseCategories[0]?.id || 'cat-food');
    setFormCurrency(currencyCode);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDescription('');
    setFormPaymentMethod('Credit Card');
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setFormAmount(exp.amount.toString());
    setFormCategory(exp.categoryId || expenseCategories[0]?.id || 'cat-food');
    setFormCurrency(currencyCode);
    setFormDate(exp.date);
    setFormDescription(exp.description);
    setFormPaymentMethod(exp.paymentMethod);
    setFormNotes(exp.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
      if (isModalOpen && editingExpense?.id === expenseToDelete.id) {
        setIsModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || isNaN(Number(formAmount)) || Number(formAmount) <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Please enter a short description of the expense.');
      return;
    }
    if (!formDate) {
      setFormError('Please pick a date.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingExpense) {
        await onEditExpense(editingExpense.id, {
          amount: Number(formAmount),
          categoryId: formCategory,
          date: formDate,
          description: formDescription.trim(),
          paymentMethod: formPaymentMethod,
          notes: formNotes.trim()
        });
      } else {
        await onAddExpense({
          amount: Number(formAmount),
          categoryId: formCategory,
          date: formDate,
          description: formDescription.trim(),
          paymentMethod: formPaymentMethod,
          notes: formNotes.trim()
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || startDate || endDate || minAmount || maxAmount;

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expense Management</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Log, track, search, and categorize your everyday spending.
          </p>
        </div>

        <button
          id="add-expense-modal-trigger-btn"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="expense-search-input"
              type="text"
              placeholder="Search by title, category, payment method or notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Category Filter */}
          <div className="w-full md:w-48">
            <select
              id="expense-category-filter-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories ({expenseCategories.length})</option>
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Toggle More Filters Button */}
          <button
            id="toggle-advanced-filters-btn"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors w-full md:w-auto ${
              showFilters || hasActiveFilters
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            )}
          </button>
        </div>

        {/* Collapsible Advanced Filters (Dates, Amounts, Sort) */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">From Date</label>
              <input
                id="filter-start-date"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">To Date</label>
              <input
                id="filter-end-date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Amount Range ({currencySymbol})</label>
              <div className="flex items-center gap-2">
                <input
                  id="filter-min-amount"
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={e => setMinAmount(e.target.value)}
                  className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
                <span className="text-slate-400">-</span>
                <input
                  id="filter-max-amount"
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={e => setMaxAmount(e.target.value)}
                  className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Sort By</label>
              <div className="flex items-center gap-2">
                <select
                  id="filter-sort-by-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                </select>
                <button
                  id="filter-sort-order-toggle-btn"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700"
                  title="Toggle order"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-1">
                <button
                  id="reset-all-filters-btn"
                  onClick={clearFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong className="text-slate-800">{filteredExpenses.length}</strong> transactions</span>
        <span>Filtered Total: <strong className="text-slate-900 font-bold">{currencySymbol}{totalFilteredAmount.toFixed(2)}</strong></span>
      </div>

      {/* Expenses Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No expense records found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new expense.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: item.categoryColor }}
                        >
                          <CategoryIcon name={item.categoryIcon} size={14} className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-semibold text-slate-800">{item.categoryName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900">{item.description}</p>
                      {item.notes && (
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{item.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {item.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {currencySymbol}{item.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          id={`edit-expense-${item.id}-btn`}
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                          title="Edit expense"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-expense-${item.id}-btn`}
                          onClick={() => setExpenseToDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Expense */}
      {isModalOpen && (
        <div 
          id="expense-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
              </h2>
              <button
                id="close-expense-modal-btn"
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Amount *
                  </label>
                  <span className="text-xs font-semibold text-slate-500">
                    Currency: <strong className="text-emerald-700">{formCurrency} ({getCurrencySymbol(formCurrency)})</strong>
                  </span>
                </div>
                <div className="flex rounded-lg overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500 bg-white shadow-2xs">
                  <select
                    id="form-expense-currency-select"
                    value={formCurrency}
                    onChange={e => {
                      const newCur = e.target.value;
                      setFormCurrency(newCur);
                      if (onCurrencyChange) onCurrencyChange(newCur);
                    }}
                    className="px-2.5 sm:px-3 py-2 bg-slate-100 border-r border-slate-300 text-xs font-bold text-slate-700 outline-none hover:bg-slate-200 cursor-pointer"
                    title="Choose currency (USD, EUR, GBP, INR, JPY, CAD, etc.)"
                  >
                    {SUPPORTED_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.symbol}) - {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    id="form-expense-amount-input"
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 font-bold text-slate-900 outline-none text-base"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Category *
                  </label>
                  <span className="text-xs text-slate-400">
                    {expenseCategories.length} categories available
                  </span>
                </div>
                <select
                  id="form-expense-category-select"
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium cursor-pointer"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <input
                  id="form-expense-desc-input"
                  type="text"
                  required
                  placeholder="e.g. Grocery shopping, Metro card reload"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    id="form-expense-date-input"
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    id="form-expense-method-select"
                    value={formPaymentMethod}
                    onChange={e => setFormPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Digital Wallet">Digital Wallet</option>
                    <option value="UPI">UPI</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Additional Notes</label>
                <textarea
                  id="form-expense-notes-input"
                  rows={2}
                  placeholder="Optional tags, receipt notes, location details..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                {editingExpense ? (
                  <button
                    type="button"
                    id="modal-delete-expense-btn"
                    onClick={() => setExpenseToDelete(editingExpense)}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-expense-form-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                  >
                    {isSubmitting ? 'Saving...' : editingExpense ? 'Save Changes' : 'Record Expense'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div 
          id="delete-expense-confirmation-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Expense Record?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to delete <strong className="text-slate-800">"{expenseToDelete.description}"</strong> for <strong className="text-slate-800">{currencySymbol}{expenseToDelete.amount.toFixed(2)}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                id="cancel-delete-expense-btn"
                disabled={isDeleting}
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-expense-btn"
                disabled={isDeleting}
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
