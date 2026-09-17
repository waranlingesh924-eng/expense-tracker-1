import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Trash2, 
  Check, 
  Clock, 
  Filter,
  AlertCircle
} from 'lucide-react';
import { AppNotification, NotificationType } from '../types';

interface NotificationsViewProps {
  notifications?: AppNotification[];
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onDeleteNotification: (id: string) => Promise<void>;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification
}) => {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifications = safeNotifications.filter(n => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    return true;
  });

  const unreadCount = safeNotifications.filter(n => !n.isRead).length;

  const getSeverityIcon = (severity: string, type: NotificationType) => {
    switch (severity) {
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time budget alerts, velocity warnings, and periodic financial summaries.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            id="mark-all-read-page-btn"
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors self-start sm:self-auto"
          >
            <Check className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3 text-xs font-medium">
        {[
          { id: 'all', label: 'All Notifications', count: safeNotifications.length },
          { id: 'budget_alert', label: 'Budget Alerts', count: safeNotifications.filter(n => n.type === 'budget_alert').length },
          { id: 'expense_reminder', label: 'Reminders', count: safeNotifications.filter(n => n.type === 'expense_reminder').length },
          { id: 'monthly_summary', label: 'Summaries', count: safeNotifications.filter(n => n.type === 'monthly_summary').length }
        ].map(tab => (
          <button
            key={tab.id}
            id={`notif-filter-${tab.id}-btn`}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              filterType === tab.id
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              filterType === tab.id ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No alerts in this category</p>
            <p className="text-xs text-slate-500 mt-1">
              You're fully up to date with your expense thresholds and alerts.
            </p>
          </div>
        ) : (
          filteredNotifications.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                !n.isRead
                  ? 'bg-white border-emerald-200 shadow-xs ring-1 ring-emerald-100'
                  : 'bg-white/80 border-slate-200 opacity-90'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 shrink-0">
                  {getSeverityIcon(n.severity, n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" title="Unread" />
                    )}
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {n.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!n.isRead && (
                  <button
                    id={`mark-read-${n.id}-btn`}
                    onClick={() => onMarkRead(n.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  id={`delete-notif-${n.id}-btn`}
                  onClick={() => onDeleteNotification(n.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Dismiss notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
