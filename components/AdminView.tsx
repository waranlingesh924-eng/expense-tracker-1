import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Settings, 
  Activity, 
  Database, 
  Server, 
  Check, 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { AppSettings, User } from '../types';

interface AdminViewProps {
  onSettingsUpdated: () => void;
  onDataReset: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onSettingsUpdated,
  onDataReset
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'settings'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Settings form states
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [warningThreshold, setWarningThreshold] = useState(80);
  const [dangerThreshold, setDangerThreshold] = useState(100);
  const [fiscalStartDay, setFiscalStartDay] = useState(1);
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (activeTab === 'users') {
        const data = await api.getAdminUsers();
        setUsers(data.users || []);
      } else if (activeTab === 'system') {
        const stats = await api.getSystemStats();
        setSystemStats(stats);
      } else if (activeTab === 'settings') {
        const s = await api.getSettings();
        setSettings(s);
        setCurrencyCode(s.currencyCode);
        setCurrencySymbol(s.currencySymbol);
        setWarningThreshold(s.budgetWarningThreshold);
        setDangerThreshold(s.budgetDangerThreshold);
        setFiscalStartDay(s.fiscalMonthStartDay);
        setDateFormat(s.dateFormat);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch administrative data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    try {
      await api.updateUserStatus(user.id, { isActive: !user.isActive });
      setSuccessMsg(`Updated account status for ${user.username}`);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update user');
    }
  };

  const handleToggleUserRole = async (user: any) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await api.updateUserStatus(user.id, { role: newRole });
      setSuccessMsg(`Role for ${user.username} changed to ${newRole}`);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update role');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        currencyCode,
        currencySymbol,
        budgetWarningThreshold: Number(warningThreshold),
        budgetDangerThreshold: Number(dangerThreshold),
        fiscalMonthStartDay: Number(fiscalStartDay),
        dateFormat
      });
      setSuccessMsg('Application settings successfully persisted.');
      onSettingsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings');
    }
  };

  const handleResetDemoData = async () => {
    if (confirm('Are you sure you want to reset the database to sample seed data? All custom entries will be reverted.')) {
      try {
        await api.resetDemoData();
        setSuccessMsg('Database has been re-seeded with initial sample records.');
        onDataReset();
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to reset database');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-700 uppercase">
              Super Admin Console
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & User Administration</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Control accounts, system configuration, database telemetry, and security policies.
          </p>
        </div>

        <button
          id="admin-reset-demo-data-btn"
          onClick={handleResetDemoData}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reset Sample Database</span>
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold">&times;</button>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-rose-700 font-bold">&times;</button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          id="admin-users-tab-btn"
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
        </button>

        <button
          id="admin-system-tab-btn"
          onClick={() => setActiveTab('system')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'system'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Telemetry & Audit</span>
        </button>

        <button
          id="admin-settings-tab-btn"
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Application Settings</span>
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-800">Platform Users Directory</h2>
            <span className="text-xs text-slate-500">{users.length} Registered Accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Expenses Logged</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4 text-center">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={u.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                          alt={u.fullName} 
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{u.fullName}</p>
                          <p className="text-[11px] text-slate-500">@{u.username} • {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`flex items-center gap-1 text-[11px] font-semibold ${
                        u.isActive ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {u.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                      {u.expenseCount} items
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">
                      ${u.totalSpent?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          id={`toggle-status-${u.id}-btn`}
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                            u.isActive 
                              ? 'border-slate-200 text-slate-600 hover:bg-slate-100' 
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          id={`toggle-role-${u.id}-btn`}
                          onClick={() => handleToggleUserRole(u)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
                        >
                          {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: System Telemetry */}
      {activeTab === 'system' && systemStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Users</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{systemStats.totalUsers}</p>
              <span className="text-xs text-emerald-600 font-medium">{systemStats.activeUsers} active accounts</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Platform Volume</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">${systemStats.totalPlatformVolume.toFixed(2)}</p>
              <span className="text-xs text-slate-500 font-medium">Expenses + Income recorded</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Active Budgets</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{systemStats.activeBudgetsCount}</p>
              <span className="text-xs text-slate-500 font-medium">{systemStats.totalCategoriesCount} Categories active</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Server Engine</span>
              <p className="text-sm font-bold text-slate-900 mt-2">Node.js Express / TSX</p>
              <span className="text-[11px] text-purple-700 font-mono font-medium">SQLite/Postgres Ready</span>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>System Security Audit Logs</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">Immutable append-only ledger</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {systemStats.auditLogs?.map((log: any) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-800">@{log.username}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Application Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-2xl">
          <h2 className="text-base font-bold text-slate-900 mb-1">Global Application Configuration</h2>
          <p className="text-xs text-slate-500 mb-6">
            Configure system currency, default alert thresholds, and format standards.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Code</label>
                <input
                  id="settings-currency-code"
                  type="text"
                  value={currencyCode}
                  onChange={e => setCurrencyCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
                <input
                  id="settings-currency-symbol"
                  type="text"
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Budget Warning Threshold (%)</label>
                <input
                  id="settings-warning-threshold"
                  type="number"
                  value={warningThreshold}
                  onChange={e => setWarningThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Budget Exceeded Threshold (%)</label>
                <input
                  id="settings-danger-threshold"
                  type="number"
                  value={dangerThreshold}
                  onChange={e => setDangerThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fiscal Month Start Day</label>
                <input
                  id="settings-fiscal-day"
                  type="number"
                  min="1"
                  max="28"
                  value={fiscalStartDay}
                  onChange={e => setFiscalStartDay(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date Display Format</label>
                <select
                  id="settings-date-format"
                  value={dateFormat}
                  onChange={e => setDateFormat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                id="save-settings-btn"
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
              >
                Save System Settings
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
