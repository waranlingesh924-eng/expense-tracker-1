import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ArrowDownLeft, 
  TrendingUp, 
  Briefcase, 
  Laptop, 
  Store, 
  Building, 
  Gift, 
  DollarSign,
  X 
} from 'lucide-react';
import { Income, IncomeSource } from '../types';
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from '../utils/currencies';

interface IncomeViewProps {
  incomes?: Income[];
  categories?: any[];
  currencySymbol: string;
  currencyCode?: string;
  onCurrencyChange?: (code: string) => Promise<void> | void;
  onAddIncome: (data: Omit<Income, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  onEditIncome: (id: string, data: Partial<Income>) => Promise<void>;
  onDeleteIncome: (id: string) => Promise<void>;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  incomes = [],
  currencySymbol,
  currencyCode = 'USD',
  onCurrencyChange,
  onAddIncome,
  onEditIncome,
  onDeleteIncome
}) => {
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState(currencyCode);
  const [formSource, setFormSource] = useState<IncomeSource>('Salary');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formPaymentMode, setFormPaymentMode] = useState('Direct Deposit');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currencyCode) {
      setFormCurrency(currencyCode);
    }
  }, [currencyCode]);

  const sourcesList: IncomeSource[] = [
    'Salary',
    'Freelancing',
    'Investments',
    'Business',
    'Rental',
    'Dividends',
    'Bonus',
    'Gift',
    'Other'
  ];

  const filteredIncomes = safeIncomes.filter(inc => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = inc.description.toLowerCase().includes(q);
      const matchSource = inc.source.toLowerCase().includes(q);
      const matchNotes = inc.notes ? inc.notes.toLowerCase().includes(q) : false;
      if (!matchDesc && !matchSource && !matchNotes) return false;
    }
    if (selectedSource !== 'all' && inc.source.toLowerCase() !== selectedSource.toLowerCase()) {
      return false;
    }
    return true;
  });

  const totalFilteredAmount = filteredIncomes.reduce((s, i) => s + i.amount, 0);

  // Calculate source totals
  const sourceBreakdown = sourcesList.map(src => {
    const total = safeIncomes.filter(i => i.source.toLowerCase() === src.toLowerCase()).reduce((s, i) => s + i.amount, 0);
    return { source: src, total };
  }).filter(s => s.total > 0);

  const handleOpenAdd = () => {
    setEditingIncome(null);
    setFormAmount('');
    setFormCurrency(currencyCode);
    setFormSource('Salary');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDescription('');
    setFormPaymentMode('Direct Deposit');
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inc: Income) => {
    setEditingIncome(inc);
    setFormAmount(inc.amount.toString());
    setFormCurrency(currencyCode);
    setFormSource(inc.source);
    setFormDate(inc.date);
    setFormDescription(inc.description);
    setFormPaymentMode(inc.paymentMode);
    setFormNotes(inc.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!incomeToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteIncome(incomeToDelete.id);
      setIncomeToDelete(null);
      if (isModalOpen && editingIncome?.id === incomeToDelete.id) {
        setIsModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete income');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || isNaN(Number(formAmount)) || Number(formAmount) <= 0) {
      setFormError('Please enter a valid positive income amount.');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Please provide a description of the income.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingIncome) {
        await onEditIncome(editingIncome.id, {
          amount: Number(formAmount),
          source: formSource,
          date: formDate,
          description: formDescription.trim(),
          paymentMode: formPaymentMode,
          notes: formNotes.trim()
        });
      } else {
        await onAddIncome({
          amount: Number(formAmount),
          source: formSource,
          date: formDate,
          description: formDescription.trim(),
          paymentMode: formPaymentMode,
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Income Streams</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Record, organize, and monitor all revenue channels and deposits.
          </p>
        </div>

        <button
          id="add-income-modal-trigger-btn"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Income</span>
        </button>
      </div>

      {/* Source Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sourceBreakdown.map(sb => (
          <div 
            key={sb.source}
            onClick={() => setSelectedSource(selectedSource === sb.source ? 'all' : sb.source)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              selectedSource === sb.source 
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' 
                : 'bg-white border-slate-200 hover:border-emerald-200'
            }`}
          >
            <span className="text-[11px] font-semibold text-slate-500 block truncate">{sb.source}</span>
            <div className="text-base font-bold text-slate-900 mt-1">
              {currencySymbol}{sb.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="income-search-input"
            type="text"
            placeholder="Search income by description, notes or channel..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            id="income-source-filter-select"
            value={selectedSource}
            onChange={e => setSelectedSource(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Sources</option>
            {sourcesList.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Displaying <strong className="text-slate-800">{filteredIncomes.length}</strong> revenue deposits</span>
        <span>Filtered Total: <strong className="text-emerald-700 font-bold">{currencySymbol}{totalFilteredAmount.toFixed(2)}</strong></span>
      </div>

      {/* Incomes Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredIncomes.length === 0 ? (
          <div className="p-12 text-center">
            <ArrowDownLeft className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No income records found</p>
            <p className="text-xs text-slate-500 mt-1">Record a deposit or reset filter options.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Transfer Mode</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncomes.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-900">{item.source}</span>
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
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
                        {item.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                      +{currencySymbol}{item.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          id={`edit-income-${item.id}-btn`}
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                          title="Edit income"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-income-${item.id}-btn`}
                          onClick={() => setIncomeToDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete income"
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

      {/* Modal: Add / Edit Income */}
      {isModalOpen && (
        <div 
          id="income-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingIncome ? 'Edit Income Record' : 'Record New Income'}
              </h2>
              <button
                id="close-income-modal-btn"
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
                    id="form-income-currency-select"
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
                    id="form-income-amount-input"
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Income Source Channel *
                </label>
                <select
                  id="form-income-source-select"
                  value={formSource}
                  onChange={e => setFormSource(e.target.value as IncomeSource)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                >
                  {sourcesList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <input
                  id="form-income-desc-input"
                  type="text"
                  required
                  placeholder="e.g. Monthly salary, UI design milestone"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    id="form-income-date-input"
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    id="form-income-mode-select"
                    value={formPaymentMode}
                    onChange={e => setFormPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Direct Deposit">Direct Deposit</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Invoice Ref</label>
                <textarea
                  id="form-income-notes-input"
                  rows={2}
                  placeholder="Optional reference, tax withholding notes, client details..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                {editingIncome ? (
                  <button
                    type="button"
                    id="modal-delete-income-btn"
                    onClick={() => setIncomeToDelete(editingIncome)}
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
                    id="submit-income-form-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                  >
                    {isSubmitting ? 'Saving...' : editingIncome ? 'Save Changes' : 'Record Deposit'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {incomeToDelete && (
        <div 
          id="delete-income-confirmation-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Income Deposit?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to delete <strong className="text-slate-800">"{incomeToDelete.description}"</strong> for <strong className="text-slate-800">{currencySymbol}{incomeToDelete.amount.toFixed(2)}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                id="cancel-delete-income-btn"
                disabled={isDeleting}
                onClick={() => setIncomeToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-income-btn"
                disabled={isDeleting}
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Income'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
