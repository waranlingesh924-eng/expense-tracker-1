import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  ArrowDownLeft, 
  Tags, 
  PieChart, 
  BarChart3, 
  Bell, 
  ShieldCheck, 
  Terminal, 
  Code2, 
  Plus, 
  User, 
  LogOut, 
  KeyRound, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppNotification } from '../types';
import { SUPPORTED_CURRENCIES } from '../utils/currencies';

interface NavbarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  currencyCode?: string;
  onCurrencyChange?: (code: string) => Promise<void> | void;
  onOpenQuickAdd?: (type?: 'expense' | 'income') => void;
  onOpenApiTester: () => void;
  onOpenArchitecture: () => void;
  onOpenAuthModal: (mode: 'login' | 'register' | 'profile' | 'password') => void;
  onOpenProfile?: () => void;
  notifications?: AppNotification[];
  unreadNotificationsCount?: number;
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  currencyCode = 'USD',
  onCurrencyChange,
  onOpenQuickAdd,
  onOpenApiTester,
  onOpenArchitecture,
  onOpenAuthModal,
  onOpenProfile,
  notifications = [],
  unreadNotificationsCount,
  onMarkNotificationRead,
  onMarkAllNotificationsRead
}) => {
  const { user, isAdmin, logout, switchUser } = useAuth();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSelectTab = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    else if (onSelectTab) onSelectTab(tab);
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = unreadNotificationsCount !== undefined 
    ? unreadNotificationsCount 
    : safeNotifications.filter(n => !n.isRead).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'income', label: 'Income', icon: ArrowDownLeft },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => handleSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">FinTrack</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">PRO</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Expense & Budget Suite</p>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="w-4 h-4 text-[10px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions: Quick Add, Postman API Studio, Architecture Spec, Notifications, User */}
          <div className="flex items-center gap-2">
            {/* Quick Add Button */}
            <div className="relative group">
              <button
                id="quick-add-btn"
                onClick={() => onOpenQuickAdd ? onOpenQuickAdd('expense') : handleSelectTab('expenses')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Record</span>
              </button>
            </div>

            {/* Postman API Explorer */}
            <button
              id="open-api-tester-btn"
              onClick={onOpenApiTester}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
              title="Interactive Postman REST API Tester"
            >
              <Terminal className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">Postman API</span>
            </button>

            {/* Architecture: Django / Spring Boot / SQL */}
            <button
              id="open-architecture-btn"
              onClick={onOpenArchitecture}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition-colors"
              title="Backend Architecture & Database Schema (Django, Spring Boot, SQLite/PostgreSQL)"
            >
              <Code2 className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">Architecture</span>
            </button>

            {/* Currency Quick Selector */}
            <div className="flex items-center">
              <select
                id="navbar-currency-selector"
                value={currencyCode}
                onChange={e => {
                  if (onCurrencyChange) onCurrencyChange(e.target.value);
                }}
                className="px-2 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 outline-none cursor-pointer"
                title="Global Currency Selector"
              >
                {SUPPORTED_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications Bell Dropdown */}
            <div className="relative">
              <button
                id="navbar-notif-bell-btn"
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {showNotificationsDropdown && (
                <div 
                  id="notifications-popup-menu"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && onMarkAllNotificationsRead && (
                      <button
                        id="mark-all-read-dropdown-btn"
                        onClick={() => {
                          onMarkAllNotificationsRead();
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {safeNotifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        No notifications currently
                      </div>
                    ) : (
                      safeNotifications.slice(0, 5).map(n => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors hover:bg-slate-50 cursor-pointer ${
                            !n.isRead ? 'bg-emerald-50/40' : ''
                          }`}
                          onClick={() => {
                            if (!n.isRead && onMarkNotificationRead) onMarkNotificationRead(n.id);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-800">{n.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 px-3 border-t border-slate-100 text-center">
                    <button
                      id="view-all-alerts-btn"
                      onClick={() => {
                        handleSelectTab('notifications');
                        setShowNotificationsDropdown(false);
                      }}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                    >
                      View all alerts & history &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Menu */}
            <div className="relative">
              {user ? (
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 ring-2 ring-emerald-500/20"
                  />
                  <div className="hidden xl:block text-left text-xs">
                    <p className="font-semibold text-slate-800 leading-tight">{user.fullName}</p>
                    <p className="text-slate-500 text-[10px] capitalize">{user.role}</p>
                  </div>
                </button>
              ) : (
                <button
                  id="login-register-btn"
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                  Sign In
                </button>
              )}

              {showUserMenu && user && (
                <div 
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in duration-100"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">{user.fullName}</p>
                    <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400">@{user.username}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      id="menu-profile-btn"
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onOpenProfile) {
                          onOpenProfile();
                        } else {
                          onOpenAuthModal('login');
                        }
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Manage Profile</span>
                    </button>
                    <button
                      id="menu-password-btn"
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onOpenProfile) {
                          onOpenProfile();
                        } else {
                          onOpenAuthModal('login');
                        }
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <KeyRound className="w-4 h-4 text-slate-400" />
                      <span>Change Password</span>
                    </button>
                  </div>

                  {/* Fast role switcher for demo verification */}
                  <div className="py-1 border-t border-slate-100 px-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Demo Account Switcher</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        id="switch-demo-user-btn"
                        onClick={() => {
                          switchUser('user');
                          setShowUserMenu(false);
                        }}
                        className={`px-2 py-1.5 rounded text-[11px] font-medium border text-center ${
                          user.role === 'user' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        Alex (User)
                      </button>
                      <button
                        id="switch-demo-admin-btn"
                        onClick={() => {
                          switchUser('admin');
                          setShowUserMenu(false);
                        }}
                        className={`px-2 py-1.5 rounded text-[11px] font-medium border text-center ${
                          user.role === 'admin' ? 'bg-purple-50 border-purple-300 text-purple-800 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        Admin (Super)
                      </button>
                    </div>
                  </div>

                  <div className="py-1 border-t border-slate-100">
                    <button
                      id="menu-logout-btn"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap rounded-lg ${
                  isActive
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="w-3.5 h-3.5 text-[9px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
