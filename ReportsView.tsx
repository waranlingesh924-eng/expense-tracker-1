import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  PieChart as PieIcon, 
  Layers,
  ArrowDownToLine
} from 'lucide-react';
import { api } from '../services/api';
import { Expense, Income } from '../types';

interface ReportsViewProps {
  currencySymbol: string;
  expenses?: Expense[];
  incomes?: Income[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currencySymbol,
  expenses = [],
  incomes = []
}) => {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];

  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [reportType]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReportsAnalytics(reportType);
      setAnalyticsData(data);
    } catch (err) {
      console.error("Failed to load reports analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Type', 'Date', 'Category/Source', 'Description', 'Amount', 'Payment Method'];
    const expenseRows = safeExpenses.map(e => ['Expense', e.date, `"${e.categoryName}"`, `"${e.description}"`, e.amount, `"${e.paymentMethod}"`]);
    const incomeRows = safeIncomes.map(i => ['Income', i.date, `"${i.source}"`, `"${i.description}"`, i.amount, `"${i.paymentMode}"`]);
    const allRows = [headers.join(','), ...expenseRows.map(r => r.join(',')), ...incomeRows.map(r => r.join(','))];

    const blob = new Blob([allRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinTrack_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      expenses: safeExpenses,
      incomes: safeIncomes,
      summary: {
        totalExpenses: safeExpenses.reduce((s, e) => s + e.amount, 0),
        totalIncome: safeIncomes.reduce((s, i) => s + i.amount, 0),
        netBalance: safeIncomes.reduce((s, i) => s + i.amount, 0) - safeExpenses.reduce((s, e) => s + e.amount, 0)
      }
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinTrack_Ledger_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const { dailyReport, monthlyComparison, categoryAnalysis, paymentMethodsDistribution } = analyticsData;

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-800">
          <p className="font-bold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="flex justify-between gap-4 font-medium">
              <span>{entry.name}:</span>
              <span>{currencySymbol}{Number(entry.value).toFixed(2)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Multi-dimensional financial telemetry, trend comparisons, and ledger export.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Timeframe selector */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-xs text-xs font-semibold">
            <button
              id="report-timeframe-daily-btn"
              onClick={() => setReportType('daily')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                reportType === 'daily' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              id="report-timeframe-weekly-btn"
              onClick={() => setReportType('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                reportType === 'weekly' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              id="report-timeframe-monthly-btn"
              onClick={() => setReportType('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                reportType === 'monthly' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Export CSV */}
          <button
            id="export-csv-btn"
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Export JSON */}
          <button
            id="export-json-btn"
            onClick={exportToJSON}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
            title="Download JSON ledger"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      </div>

      {/* Main Income vs Expense Trends Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {reportType === 'daily' ? '14-Day Inflow vs Outflow Velocity' : 'Monthly Cashflow & Savings Performance'}
            </h2>
            <p className="text-xs text-slate-500">Income received versus expenses incurred over time</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-700">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500" />
              <span className="text-slate-700">Expenses</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {reportType === 'daily' ? (
              <AreaChart data={dailyReport} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#incomeGradient)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#expenseGradient)" />
              </AreaChart>
            ) : (
              <BarChart data={monthlyComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Category Breakdown (Pie) + Payment Methods Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category-wise Expense Analysis */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Category-wise Expense Analysis</h2>
              <p className="text-xs text-slate-500">Distribution across classification categories</p>
            </div>
            <PieIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {categoryAnalysis.length === 0 ? (
              <p className="text-xs text-slate-400">No expense data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryAnalysis}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="name"
                  >
                    {categoryAnalysis.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`${currencySymbol}${Number(val).toFixed(2)}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {categoryAnalysis.map((cat: any) => (
              <div key={cat.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-slate-700">{cat.name}</span>
                  <span className="text-[10px] text-slate-400">({cat.count} items)</span>
                </div>
                <div className="font-semibold text-slate-900">
                  {currencySymbol}{cat.amount.toFixed(2)} ({cat.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Channels & Modes Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Payment Channel Breakdown</h2>
                <p className="text-xs text-slate-500">Method distribution across credit, debit, cash, & UPI</p>
              </div>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {paymentMethodsDistribution.map((pm: any) => {
                const total = paymentMethodsDistribution.reduce((s: number, p: any) => s + p.amount, 0);
                const percent = total > 0 ? Math.round((pm.amount / total) * 100) : 0;
                return (
                  <div key={pm.method} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{pm.method}</span>
                      <span className="font-bold text-slate-900">
                        {currencySymbol}{pm.amount.toFixed(2)} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-800 rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mt-6 text-xs text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">Financial Intelligence Note</p>
            <p>
              Credit cards represent the highest velocity of discretionary transactions. Maintaining payment balance under 30% of credit limit boosts credit scoring.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
