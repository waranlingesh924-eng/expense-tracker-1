import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "FinTrack Expense & Budget Manager", timestamp: new Date().toISOString() });
});

// In-memory + File-backed database
const DB_FILE = path.join(process.cwd(), "fin_database.json");

interface DatabaseState {
  users: Array<{
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    fullName: string;
    role: 'user' | 'admin';
    avatarUrl?: string;
    currency: string;
    createdAt: string;
    isActive: boolean;
    phone?: string;
    occupation?: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    type: 'expense' | 'income';
    icon: string;
    color: string;
    description: string;
    isDefault: boolean;
    budgetLimit?: number;
  }>;
  expenses: Array<{
    id: string;
    userId: string;
    amount: number;
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    date: string;
    description: string;
    paymentMethod: string;
    notes?: string;
    createdAt: string;
  }>;
  incomes: Array<{
    id: string;
    userId: string;
    amount: number;
    source: string;
    categoryId?: string;
    categoryName?: string;
    categoryIcon?: string;
    categoryColor?: string;
    date: string;
    description: string;
    paymentMode: string;
    notes?: string;
    createdAt: string;
  }>;
  budgets: Array<{
    id: string;
    userId: string;
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    monthlyLimit: number;
    month: string;
    alertThresholdPercent: number;
  }>;
  notifications: Array<{
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'budget_alert' | 'expense_reminder' | 'monthly_summary' | 'system';
    severity: 'info' | 'warning' | 'danger' | 'success';
    isRead: boolean;
    createdAt: string;
  }>;
  settings: {
    currencyCode: string;
    currencySymbol: string;
    budgetWarningThreshold: number;
    budgetDangerThreshold: number;
    fiscalMonthStartDay: number;
    dateFormat: string;
    allowGuestMode: boolean;
  };
  auditLogs: Array<{
    id: string;
    userId: string;
    username: string;
    action: string;
    details: string;
    timestamp: string;
  }>;
}

const DEFAULT_CATEGORIES = [
  { id: 'cat-food', name: 'Food & Dining', type: 'expense' as const, icon: 'Utensils', color: '#f97316', description: 'Groceries, restaurants, snacks, cafes', isDefault: true, budgetLimit: 600 },
  { id: 'cat-travel', name: 'Travel & Transport', type: 'expense' as const, icon: 'Car', color: '#0ea5e9', description: 'Fuel, public transit, flights, rideshare', isDefault: true, budgetLimit: 350 },
  { id: 'cat-shopping', name: 'Shopping', type: 'expense' as const, icon: 'ShoppingBag', color: '#ec4899', description: 'Clothing, gadgets, home goods', isDefault: true, budgetLimit: 400 },
  { id: 'cat-bills', name: 'Bills & Utilities', type: 'expense' as const, icon: 'Zap', color: '#eab308', description: 'Electricity, water, internet, phone', isDefault: true, budgetLimit: 450 },
  { id: 'cat-housing', name: 'Housing & Rent', type: 'expense' as const, icon: 'Home', color: '#8b5cf6', description: 'Monthly rent, mortgage, home repairs', isDefault: true, budgetLimit: 1400 },
  { id: 'cat-health', name: 'Healthcare', type: 'expense' as const, icon: 'HeartPulse', color: '#ef4444', description: 'Doctors, medicines, insurance, gym', isDefault: true, budgetLimit: 250 },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense' as const, icon: 'Film', color: '#6366f1', description: 'Movies, games, streaming services', isDefault: true, budgetLimit: 200 },
  { id: 'cat-education', name: 'Education', type: 'expense' as const, icon: 'GraduationCap', color: '#14b8a6', description: 'Courses, books, tuition, certifications', isDefault: true, budgetLimit: 150 },
  
  // Income categories
  { id: 'cat-inc-salary', name: 'Salary', type: 'income' as const, icon: 'Briefcase', color: '#10b981', description: 'Primary employment wage', isDefault: true },
  { id: 'cat-inc-freelance', name: 'Freelance & Consulting', type: 'income' as const, icon: 'Laptop', color: '#06b6d4', description: 'Contract projects and gigs', isDefault: true },
  { id: 'cat-inc-investments', name: 'Investments & Dividends', type: 'income' as const, icon: 'TrendingUp', color: '#3b82f6', description: 'Stocks, mutual funds, interest', isDefault: true },
  { id: 'cat-inc-business', name: 'Business Revenue', type: 'income' as const, icon: 'Store', color: '#8b5cf6', description: 'E-commerce or enterprise revenue', isDefault: true },
  { id: 'cat-inc-rental', name: 'Rental Property', type: 'income' as const, icon: 'Building', color: '#64748b', description: 'Tenant lease rental yield', isDefault: true },
  { id: 'cat-inc-gift', name: 'Gift & Bonus', type: 'income' as const, icon: 'Gift', color: '#f59e0b', description: 'Holiday gifts, tax return, grants', isDefault: true }
];

function getInitialData(): DatabaseState {
  const adminUser = {
    id: 'usr-admin-1',
    username: 'admin',
    email: 'admin@fintrack.io',
    passwordHash: 'admin123',
    fullName: 'System Administrator',
    role: 'admin' as const,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    currency: 'USD',
    createdAt: '2026-08-01T10:00:00Z',
    isActive: true,
    phone: '+1 (555) 019-2834',
    occupation: 'Lead Solutions Architect'
  };

  const regularUser = {
    id: 'usr-demo-1',
    username: 'alex_morgan',
    email: 'alex.morgan@example.com',
    passwordHash: 'password123',
    fullName: 'Alex Morgan',
    role: 'user' as const,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    currency: 'USD',
    createdAt: '2026-08-15T12:30:00Z',
    isActive: true,
    phone: '+1 (555) 438-9921',
    occupation: 'Senior Product Designer'
  };

  const expenses = [
    { id: 'exp-1', userId: 'usr-demo-1', amount: 84.50, categoryId: 'cat-food', categoryName: 'Food & Dining', categoryIcon: 'Utensils', categoryColor: '#f97316', date: '2026-09-16', description: 'Weekly organic groceries at Whole Foods', paymentMethod: 'Credit Card', notes: 'Fresh produce, milk and pantry staples', createdAt: '2026-09-16T14:20:00Z' },
    { id: 'exp-2', userId: 'usr-demo-1', amount: 32.00, categoryId: 'cat-travel', categoryName: 'Travel & Transport', categoryIcon: 'Car', categoryColor: '#0ea5e9', date: '2026-09-15', description: 'Metro pass recharge & city bus', paymentMethod: 'Digital Wallet', notes: 'Monthly transit card top-up', createdAt: '2026-09-15T09:10:00Z' },
    { id: 'exp-3', userId: 'usr-demo-1', amount: 120.00, categoryId: 'cat-bills', categoryName: 'Bills & Utilities', categoryIcon: 'Zap', categoryColor: '#eab308', date: '2026-09-14', description: 'High-speed Fiber Internet & 5G plan', paymentMethod: 'Bank Transfer', notes: 'Account auto-debited', createdAt: '2026-09-14T08:00:00Z' },
    { id: 'exp-4', userId: 'usr-demo-1', amount: 65.90, categoryId: 'cat-shopping', categoryName: 'Shopping', categoryIcon: 'ShoppingBag', categoryColor: '#ec4899', date: '2026-09-12', description: 'Ergonomic mouse and desk pad', paymentMethod: 'Debit Card', notes: 'Home office ergonomic upgrades', createdAt: '2026-09-12T16:45:00Z' },
    { id: 'exp-5', userId: 'usr-demo-1', amount: 1400.00, categoryId: 'cat-housing', categoryName: 'Housing & Rent', categoryIcon: 'Home', categoryColor: '#8b5cf6', date: '2026-09-01', description: 'Monthly downtown apartment lease', paymentMethod: 'Bank Transfer', notes: 'September rent paid in full', createdAt: '2026-09-01T10:00:00Z' },
    { id: 'exp-6', userId: 'usr-demo-1', amount: 48.00, categoryId: 'cat-entertainment', categoryName: 'Entertainment', categoryIcon: 'Film', categoryColor: '#6366f1', date: '2026-09-10', description: 'IMAX Cinema tickets & snacks', paymentMethod: 'Credit Card', notes: 'Weekend movie outing with friend', createdAt: '2026-09-10T19:30:00Z' },
    { id: 'exp-7', userId: 'usr-demo-1', amount: 45.00, categoryId: 'cat-food', categoryName: 'Food & Dining', categoryIcon: 'Utensils', categoryColor: '#f97316', date: '2026-09-08', description: 'Team sushi lunch downtown', paymentMethod: 'UPI', notes: 'Split bill payment', createdAt: '2026-09-08T13:15:00Z' },
    { id: 'exp-8', userId: 'usr-demo-1', amount: 89.00, categoryId: 'cat-education', categoryName: 'Education', categoryIcon: 'GraduationCap', categoryColor: '#14b8a6', date: '2026-09-05', description: 'TypeScript & Cloud Architecture Course', paymentMethod: 'Credit Card', notes: 'Online learning license', createdAt: '2026-09-05T11:00:00Z' },
    { id: 'exp-9', userId: 'usr-demo-1', amount: 75.00, categoryId: 'cat-health', categoryName: 'Healthcare', categoryIcon: 'HeartPulse', categoryColor: '#ef4444', date: '2026-09-03', description: 'Monthly fitness center membership', paymentMethod: 'Debit Card', notes: 'Gym & swimming pool access', createdAt: '2026-09-03T07:30:00Z' },
    { id: 'exp-10', userId: 'usr-demo-1', amount: 42.50, categoryId: 'cat-travel', categoryName: 'Travel & Transport', categoryIcon: 'Car', categoryColor: '#0ea5e9', date: '2026-09-02', description: 'Airport rideshare shuttle', paymentMethod: 'Credit Card', notes: 'Return trip from tech conference', createdAt: '2026-09-02T22:15:00Z' }
  ];

  const incomes = [
    { id: 'inc-1', userId: 'usr-demo-1', amount: 4850.00, source: 'Salary', categoryId: 'cat-inc-salary', categoryName: 'Salary', categoryIcon: 'Briefcase', categoryColor: '#10b981', date: '2026-09-01', description: 'Bi-monthly tech payroll deposit', paymentMode: 'Direct Deposit', notes: 'Includes performance incentive', createdAt: '2026-09-01T06:00:00Z' },
    { id: 'inc-2', userId: 'usr-demo-1', amount: 1200.00, source: 'Freelancing', categoryId: 'cat-inc-freelance', categoryName: 'Freelance & Consulting', categoryIcon: 'Laptop', categoryColor: '#06b6d4', date: '2026-09-09', description: 'UI/UX Mobile Redesign contract Milestone 1', paymentMode: 'Bank Transfer', notes: 'Client invoice #2026-88', createdAt: '2026-09-09T15:30:00Z' },
    { id: 'inc-3', userId: 'usr-demo-1', amount: 280.00, source: 'Investments', categoryId: 'cat-inc-investments', categoryName: 'Investments & Dividends', categoryIcon: 'TrendingUp', categoryColor: '#3b82f6', date: '2026-09-12', description: 'Quarterly index fund dividend distribution', paymentMode: 'Direct Deposit', notes: 'Reinvested in high-yield dividend ETF', createdAt: '2026-09-12T09:00:00Z' }
  ];

  const budgets = [
    { id: 'bud-1', userId: 'usr-demo-1', categoryId: 'cat-food', categoryName: 'Food & Dining', categoryIcon: 'Utensils', categoryColor: '#f97316', monthlyLimit: 600, month: '2026-09', alertThresholdPercent: 80 },
    { id: 'bud-2', userId: 'usr-demo-1', categoryId: 'cat-travel', categoryName: 'Travel & Transport', categoryIcon: 'Car', categoryColor: '#0ea5e9', monthlyLimit: 300, month: '2026-09', alertThresholdPercent: 75 },
    { id: 'bud-3', userId: 'usr-demo-1', categoryId: 'cat-shopping', categoryName: 'Shopping', categoryIcon: 'ShoppingBag', categoryColor: '#ec4899', monthlyLimit: 350, month: '2026-09', alertThresholdPercent: 80 },
    { id: 'bud-4', userId: 'usr-demo-1', categoryId: 'cat-bills', categoryName: 'Bills & Utilities', categoryIcon: 'Zap', categoryColor: '#eab308', monthlyLimit: 400, month: '2026-09', alertThresholdPercent: 85 },
    { id: 'bud-5', userId: 'usr-demo-1', categoryId: 'cat-housing', categoryName: 'Housing & Rent', categoryIcon: 'Home', categoryColor: '#8b5cf6', monthlyLimit: 1400, month: '2026-09', alertThresholdPercent: 90 },
    { id: 'bud-6', userId: 'usr-demo-1', categoryId: 'cat-entertainment', categoryName: 'Entertainment', categoryIcon: 'Film', categoryColor: '#6366f1', monthlyLimit: 200, month: '2026-09', alertThresholdPercent: 70 }
  ];

  const notifications = [
    { id: 'notif-1', userId: 'usr-demo-1', title: 'Budget Status Alert', message: 'You have spent 68% of your Food & Dining budget for September.', type: 'budget_alert' as const, severity: 'warning' as const, isRead: false, createdAt: '2026-09-16T08:00:00Z' },
    { id: 'notif-2', userId: 'usr-demo-1', title: 'Income Recorded', message: 'Dividend payment of $280.00 was successfully deposited.', type: 'monthly_summary' as const, severity: 'success' as const, isRead: true, createdAt: '2026-09-12T09:05:00Z' },
    { id: 'notif-3', userId: 'usr-demo-1', title: 'Monthly Expense Reminder', message: 'Remember to verify utilities and internet invoices for end of month settlement.', type: 'expense_reminder' as const, severity: 'info' as const, isRead: false, createdAt: '2026-09-10T11:00:00Z' }
  ];

  const settings = {
    currencyCode: 'USD',
    currencySymbol: '$',
    budgetWarningThreshold: 80,
    budgetDangerThreshold: 100,
    fiscalMonthStartDay: 1,
    dateFormat: 'YYYY-MM-DD',
    allowGuestMode: true
  };

  const auditLogs = [
    { id: 'log-1', userId: 'usr-admin-1', username: 'admin', action: 'SYSTEM_BOOT', details: 'System initialized with PostgreSQL/SQLite compatibility layer', timestamp: '2026-09-16T17:00:00Z' },
    { id: 'log-2', userId: 'usr-demo-1', username: 'alex_morgan', action: 'USER_LOGIN', details: 'User logged in successfully from client React SPA', timestamp: '2026-09-16T17:15:00Z' }
  ];

  return {
    users: [adminUser, regularUser],
    categories: DEFAULT_CATEGORIES,
    expenses,
    incomes,
    budgets,
    notifications,
    settings,
    auditLogs
  };
}

// Database helper
let db: DatabaseState;
function loadDb(): DatabaseState {
  if (db) return db;
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(content);
      return db;
    }
  } catch (err) {
    console.error("Error loading database file, falling back to default:", err);
  }
  db = getInitialData();
  saveDb();
  return db;
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database file:", err);
  }
}

// Seed demo data reset
function seedDatabase() {
  db = getInitialData();
  saveDb();
  return db;
}

// Ensure db is loaded
loadDb();

// ----------------------------------------------------
// 1. User Management Endpoints
// ----------------------------------------------------
app.post("/api/auth/register", (req, res) => {
  const { username, email, password, fullName, phone, occupation } = req.body;
  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ error: "Username, email, password and full name are required." });
  }

  const existing = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "A user with this username or email already exists." });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    username,
    email,
    passwordHash: password, // In production Django/Spring uses BCrypt/Argon2
    fullName,
    role: 'user' as const,
    currency: db.settings.currencyCode,
    createdAt: new Date().toISOString(),
    isActive: true,
    phone: phone || '',
    occupation: occupation || 'Professional',
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
  };

  db.users.push(newUser);
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: newUser.id,
    username: newUser.username,
    action: 'USER_REGISTER',
    details: `User registered with email: ${email}`,
    timestamp: new Date().toISOString()
  });
  saveDb();

  const { passwordHash, ...safeUser } = newUser;
  return res.status(201).json({
    message: "User registered successfully",
    user: safeUser,
    token: `jwt-token-${newUser.id}-${Date.now()}`
  });
});

app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: "Username/Email and password are required." });
  }

  const user = db.users.find(u => 
    (u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase())
  );

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: "Invalid credentials. Please verify username/email and password." });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: "Your account is currently disabled. Please contact the administrator." });
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: user.id,
    username: user.username,
    action: 'USER_LOGIN',
    details: 'User logged in via REST API',
    timestamp: new Date().toISOString()
  });
  saveDb();

  const { passwordHash, ...safeUser } = user;
  return res.json({
    message: "Login successful",
    user: safeUser,
    token: `jwt-token-${user.id}-${Date.now()}`
  });
});

app.get("/api/auth/profile", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }
  const { passwordHash, ...safeUser } = user;
  return res.json(safeUser);
});

app.put("/api/auth/profile", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const { fullName, phone, occupation, avatarUrl, currency } = req.body;
  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (occupation !== undefined) user.occupation = occupation;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (currency !== undefined) user.currency = currency;

  saveDb();
  const { passwordHash, ...safeUser } = user;
  return res.json({ message: "Profile updated successfully", user: safeUser });
});

app.post("/api/auth/change-password", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const { currentPassword, newPassword } = req.body;

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (user.passwordHash !== currentPassword) {
    return res.status(400).json({ error: "Current password does not match." });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }

  user.passwordHash = newPassword;
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: user.id,
    username: user.username,
    action: 'PASSWORD_CHANGE',
    details: 'User password was updated',
    timestamp: new Date().toISOString()
  });
  saveDb();

  return res.json({ message: "Password changed successfully." });
});

// ----------------------------------------------------
// 2. Expense Management Endpoints
// ----------------------------------------------------
app.get("/api/expenses", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const { search, category, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder } = req.query;

  let results = db.expenses.filter(e => e.userId === userId);

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(e => 
      e.description.toLowerCase().includes(q) || 
      e.categoryName.toLowerCase().includes(q) ||
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      e.paymentMethod.toLowerCase().includes(q)
    );
  }

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter(e => e.categoryId === category || e.categoryName.toLowerCase() === category.toLowerCase());
  }

  if (startDate && typeof startDate === 'string') {
    results = results.filter(e => e.date >= startDate);
  }

  if (endDate && typeof endDate === 'string') {
    results = results.filter(e => e.date <= endDate);
  }

  if (minAmount && !isNaN(Number(minAmount))) {
    results = results.filter(e => e.amount >= Number(minAmount));
  }

  if (maxAmount && !isNaN(Number(maxAmount))) {
    results = results.filter(e => e.amount <= Number(maxAmount));
  }

  // Sorting
  const order = sortOrder === 'asc' ? 1 : -1;
  if (sortBy === 'amount') {
    results.sort((a, b) => (a.amount - b.amount) * order);
  } else if (sortBy === 'category') {
    results.sort((a, b) => a.categoryName.localeCompare(b.categoryName) * order);
  } else {
    // default by date descending
    results.sort((a, b) => a.date.localeCompare(b.date) * order);
  }

  return res.json({
    count: results.length,
    totalAmount: results.reduce((sum, item) => sum + item.amount, 0),
    expenses: results
  });
});

app.post("/api/expenses", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const { amount, categoryId, date, description, paymentMethod, notes } = req.body;

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: "A valid positive expense amount is required." });
  }
  if (!categoryId || !description || !date) {
    return res.status(400).json({ error: "Category, description, and date are required." });
  }

  const category = db.categories.find(c => c.id === categoryId) || {
    id: categoryId,
    name: 'General',
    icon: 'Tag',
    color: '#64748b'
  };

  const newExpense = {
    id: `exp-${Date.now()}`,
    userId,
    amount: Number(Number(amount).toFixed(2)),
    categoryId: category.id,
    categoryName: category.name,
    categoryIcon: category.icon,
    categoryColor: category.color,
    date,
    description,
    paymentMethod: paymentMethod || 'Cash',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.expenses.unshift(newExpense);

  // Check budget limits for this category
  const currentMonth = date.substring(0, 7); // YYYY-MM
  const budget = db.budgets.find(b => b.userId === userId && b.categoryId === categoryId && b.month === currentMonth);
  if (budget) {
    const totalSpentInCategory = db.expenses
      .filter(e => e.userId === userId && e.categoryId === categoryId && e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + e.amount, 0);

    const percentUsed = Math.round((totalSpentInCategory / budget.monthlyLimit) * 100);
    if (percentUsed >= 100) {
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId,
        title: `Budget Exceeded: ${category.name}`,
        message: `You have spent $${totalSpentInCategory.toFixed(2)} (${percentUsed}%) of your $${budget.monthlyLimit} budget for ${category.name}.`,
        type: 'budget_alert',
        severity: 'danger',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } else if (percentUsed >= budget.alertThresholdPercent) {
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId,
        title: `Budget Warning: ${category.name}`,
        message: `You have reached ${percentUsed}% of your $${budget.monthlyLimit} budget for ${category.name}.`,
        type: 'budget_alert',
        severity: 'warning',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  saveDb();
  return res.status(201).json({ message: "Expense recorded successfully", expense: newExpense });
});

app.put("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const index = db.expenses.findIndex(e => e.id === id && e.userId === userId);

  if (index === -1) {
    return res.status(404).json({ error: "Expense not found." });
  }

  const { amount, categoryId, date, description, paymentMethod, notes } = req.body;
  const current = db.expenses[index];

  if (amount !== undefined) current.amount = Number(Number(amount).toFixed(2));
  if (date !== undefined) current.date = date;
  if (description !== undefined) current.description = description;
  if (paymentMethod !== undefined) current.paymentMethod = paymentMethod;
  if (notes !== undefined) current.notes = notes;

  if (categoryId !== undefined && categoryId !== current.categoryId) {
    const cat = db.categories.find(c => c.id === categoryId);
    if (cat) {
      current.categoryId = cat.id;
      current.categoryName = cat.name;
      current.categoryIcon = cat.icon;
      current.categoryColor = cat.color;
    }
  }

  saveDb();
  return res.json({ message: "Expense updated successfully", expense: current });
});

app.delete("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const index = db.expenses.findIndex(e => e.id === id && e.userId === userId);

  if (index === -1) {
    return res.status(404).json({ error: "Expense not found." });
  }

  const removed = db.expenses.splice(index, 1)[0];
  saveDb();
  return res.json({ message: "Expense deleted successfully", deletedId: id, expense: removed });
});

// ----------------------------------------------------
// 3. Income Management Endpoints
// ----------------------------------------------------
app.get("/api/incomes", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const { search, source, startDate, endDate, minAmount, maxAmount } = req.query;

  let results = db.incomes.filter(i => i.userId === userId);

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(i => 
      i.description.toLowerCase().includes(q) || 
      i.source.toLowerCase().includes(q) ||
      (i.notes && i.notes.toLowerCase().includes(q))
    );
  }

  if (source && typeof source === 'string' && source !== 'all') {
    results = results.filter(i => i.source.toLowerCase() === source.toLowerCase());
  }

  if (startDate && typeof startDate === 'string') {
    results = results.filter(i => i.date >= startDate);
  }

  if (endDate && typeof endDate === 'string') {
    results = results.filter(i => i.date <= endDate);
  }

  if (minAmount && !isNaN(Number(minAmount))) {
    results = results.filter(i => i.amount >= Number(minAmount));
  }

  if (maxAmount && !isNaN(Number(maxAmount))) {
    results = results.filter(i => i.amount <= Number(maxAmount));
  }

  results.sort((a, b) => b.date.localeCompare(a.date));

  return res.json({
    count: results.length,
    totalAmount: results.reduce((sum, item) => sum + item.amount, 0),
    incomes: results
  });
});

app.post("/api/incomes", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const { amount, source, date, description, paymentMode, notes, categoryId } = req.body;

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: "A valid positive income amount is required." });
  }
  if (!source || !description || !date) {
    return res.status(400).json({ error: "Source, description, and date are required." });
  }

  const cat = db.categories.find(c => c.id === categoryId && c.type === 'income') || 
              db.categories.find(c => c.name.toLowerCase() === source.toLowerCase() && c.type === 'income');

  const newIncome = {
    id: `inc-${Date.now()}`,
    userId,
    amount: Number(Number(amount).toFixed(2)),
    source,
    categoryId: cat?.id || 'cat-inc-salary',
    categoryName: cat?.name || source,
    categoryIcon: cat?.icon || 'Briefcase',
    categoryColor: cat?.color || '#10b981',
    date,
    description,
    paymentMode: paymentMode || 'Bank Transfer',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.incomes.unshift(newIncome);

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId,
    title: 'New Income Added',
    message: `Received $${newIncome.amount.toFixed(2)} from ${newIncome.source} (${newIncome.description}).`,
    type: 'monthly_summary',
    severity: 'success',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  saveDb();
  return res.status(201).json({ message: "Income recorded successfully", income: newIncome });
});

app.put("/api/incomes/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const index = db.incomes.findIndex(i => i.id === id && i.userId === userId);

  if (index === -1) {
    return res.status(404).json({ error: "Income record not found." });
  }

  const { amount, source, date, description, paymentMode, notes } = req.body;
  const current = db.incomes[index];

  if (amount !== undefined) current.amount = Number(Number(amount).toFixed(2));
  if (source !== undefined) current.source = source;
  if (date !== undefined) current.date = date;
  if (description !== undefined) current.description = description;
  if (paymentMode !== undefined) current.paymentMode = paymentMode;
  if (notes !== undefined) current.notes = notes;

  saveDb();
  return res.json({ message: "Income record updated successfully", income: current });
});

app.delete("/api/incomes/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const index = db.incomes.findIndex(i => i.id === id && i.userId === userId);

  if (index === -1) {
    return res.status(404).json({ error: "Income record not found." });
  }

  const removed = db.incomes.splice(index, 1)[0];
  saveDb();
  return res.json({ message: "Income record deleted successfully", deletedId: id, income: removed });
});

// ----------------------------------------------------
// 4. Category Management Endpoints
// ----------------------------------------------------
app.get("/api/categories", (req, res) => {
  const { type } = req.query;
  let list = db.categories;
  if (type === 'expense' || type === 'income') {
    list = list.filter(c => c.type === type);
  }
  return res.json(list);
});

app.post("/api/categories", (req, res) => {
  const { name, type, icon, color, description, budgetLimit } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: "Category name and type ('expense' or 'income') are required." });
  }

  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    type: type as 'expense' | 'income',
    icon: icon || (type === 'expense' ? 'Tag' : 'TrendingUp'),
    color: color || '#6366f1',
    description: description || '',
    isDefault: false,
    budgetLimit: budgetLimit ? Number(budgetLimit) : undefined
  };

  db.categories.push(newCat);
  saveDb();
  return res.status(201).json({ message: "Category created successfully", category: newCat });
});

app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const cat = db.categories.find(c => c.id === id);
  if (!cat) {
    return res.status(404).json({ error: "Category not found." });
  }

  const { name, icon, color, description, budgetLimit } = req.body;
  if (name !== undefined) cat.name = name;
  if (icon !== undefined) cat.icon = icon;
  if (color !== undefined) cat.color = color;
  if (description !== undefined) cat.description = description;
  if (budgetLimit !== undefined) cat.budgetLimit = Number(budgetLimit);

  // update cached category info in expenses/budgets
  db.expenses.forEach(e => {
    if (e.categoryId === id) {
      e.categoryName = cat.name;
      e.categoryIcon = cat.icon;
      e.categoryColor = cat.color;
    }
  });

  saveDb();
  return res.json({ message: "Category updated successfully", category: cat });
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const catIndex = db.categories.findIndex(c => c.id === id);
  if (catIndex === -1) {
    return res.status(404).json({ error: "Category not found." });
  }

  // Check if category is in use
  const inUse = db.expenses.some(e => e.categoryId === id);
  if (inUse) {
    return res.status(409).json({ error: "Cannot delete category because it has active expenses associated with it." });
  }

  const removed = db.categories.splice(catIndex, 1)[0];
  saveDb();
  return res.json({ message: "Category deleted successfully", deletedId: id, category: removed });
});

// ----------------------------------------------------
// 5. Budget Management Endpoints
// ----------------------------------------------------
app.get("/api/budgets", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const month = (req.query.month as string) || new Date().toISOString().substring(0, 7);

  // Compute spent amount for each budget in that month
  const userBudgets = db.budgets.filter(b => b.userId === userId && b.month === month);
  
  const enriched = userBudgets.map(b => {
    const spent = db.expenses
      .filter(e => e.userId === userId && e.categoryId === b.categoryId && e.date.startsWith(month))
      .reduce((sum, e) => sum + e.amount, 0);

    const remaining = Math.max(0, b.monthlyLimit - spent);
    const usagePercent = Math.round((spent / b.monthlyLimit) * 100);

    return {
      ...b,
      spent: Number(spent.toFixed(2)),
      remaining: Number(remaining.toFixed(2)),
      usagePercent,
      isOverBudget: spent > b.monthlyLimit,
      isWarning: usagePercent >= b.alertThresholdPercent && usagePercent < 100
    };
  });

  const totalBudgetLimit = enriched.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalBudgetSpent = enriched.reduce((sum, b) => sum + b.spent, 0);

  return res.json({
    month,
    totalBudgetLimit,
    totalBudgetSpent,
    overallUsagePercent: totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0,
    budgets: enriched
  });
});

app.post("/api/budgets", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const { categoryId, monthlyLimit, month, alertThresholdPercent } = req.body;

  if (!categoryId || !monthlyLimit || isNaN(Number(monthlyLimit)) || Number(monthlyLimit) <= 0) {
    return res.status(400).json({ error: "Category ID and positive monthly limit are required." });
  }

  const targetMonth = month || new Date().toISOString().substring(0, 7);
  const cat = db.categories.find(c => c.id === categoryId);
  if (!cat) {
    return res.status(404).json({ error: "Selected category does not exist." });
  }

  const existingIndex = db.budgets.findIndex(b => b.userId === userId && b.categoryId === categoryId && b.month === targetMonth);
  
  if (existingIndex !== -1) {
    // Update existing
    db.budgets[existingIndex].monthlyLimit = Number(monthlyLimit);
    if (alertThresholdPercent) db.budgets[existingIndex].alertThresholdPercent = Number(alertThresholdPercent);
    saveDb();
    return res.json({ message: "Budget updated successfully", budget: db.budgets[existingIndex] });
  }

  const newBudget = {
    id: `bud-${Date.now()}`,
    userId,
    categoryId,
    categoryName: cat.name,
    categoryIcon: cat.icon,
    categoryColor: cat.color,
    monthlyLimit: Number(monthlyLimit),
    month: targetMonth,
    alertThresholdPercent: alertThresholdPercent ? Number(alertThresholdPercent) : 80
  };

  db.budgets.push(newBudget);
  saveDb();
  return res.status(201).json({ message: "Budget limit established successfully", budget: newBudget });
});

app.put("/api/budgets/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const budget = db.budgets.find(b => b.id === id && b.userId === userId);

  if (!budget) {
    return res.status(404).json({ error: "Budget not found." });
  }

  const { monthlyLimit, alertThresholdPercent } = req.body;
  if (monthlyLimit !== undefined) budget.monthlyLimit = Number(monthlyLimit);
  if (alertThresholdPercent !== undefined) budget.alertThresholdPercent = Number(alertThresholdPercent);

  saveDb();
  return res.json({ message: "Budget updated successfully", budget });
});

app.delete("/api/budgets/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const index = db.budgets.findIndex(b => b.id === id && b.userId === userId);

  if (index === -1) {
    return res.status(404).json({ error: "Budget not found." });
  }

  const removed = db.budgets.splice(index, 1)[0];
  saveDb();
  return res.json({ message: "Budget deleted successfully", deletedId: id, budget: removed });
});

// ----------------------------------------------------
// 6. Dashboard & 7. Reports and Analytics Endpoints
// ----------------------------------------------------
app.get("/api/dashboard/stats", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const currentMonth = new Date().toISOString().substring(0, 7);

  const userExpenses = db.expenses.filter(e => e.userId === userId);
  const userIncomes = db.incomes.filter(i => i.userId === userId);

  const totalExpenses = userExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = userIncomes.reduce((sum, i) => sum + i.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((Math.max(0, netBalance) / totalIncome) * 100) : 0;

  const monthExpenses = userExpenses
    .filter(e => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  const monthIncome = userIncomes
    .filter(i => i.date.startsWith(currentMonth))
    .reduce((sum, i) => sum + i.amount, 0);

  // Category breakdown for current month or all-time
  const categoryMap: Record<string, { name: string; amount: number; color: string; icon: string }> = {};
  userExpenses.forEach(e => {
    if (!categoryMap[e.categoryId]) {
      categoryMap[e.categoryId] = {
        name: e.categoryName,
        amount: 0,
        color: e.categoryColor,
        icon: e.categoryIcon
      };
    }
    categoryMap[e.categoryId].amount += e.amount;
  });

  const categoryBreakdown = Object.values(categoryMap)
    .map(c => ({
      ...c,
      amount: Number(c.amount.toFixed(2)),
      percentage: totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  // Recent transactions combined
  const recentExpenses = userExpenses.slice(0, 5).map(e => ({
    id: e.id,
    type: 'expense' as const,
    amount: e.amount,
    title: e.description,
    category: e.categoryName,
    date: e.date,
    icon: e.categoryIcon,
    color: e.categoryColor,
    paymentMethod: e.paymentMethod
  }));

  const recentIncomes = userIncomes.slice(0, 5).map(i => ({
    id: i.id,
    type: 'income' as const,
    amount: i.amount,
    title: i.description,
    category: i.source,
    date: i.date,
    icon: i.categoryIcon || 'TrendingUp',
    color: i.categoryColor || '#10b981',
    paymentMethod: i.paymentMode
  }));

  const recentTransactions = [...recentExpenses, ...recentIncomes]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  // Total budget usage
  const activeBudgets = db.budgets.filter(b => b.userId === userId && b.month === currentMonth);
  const totalBudgetLimit = activeBudgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const budgetUsagePercent = totalBudgetLimit > 0 ? Math.round((monthExpenses / totalBudgetLimit) * 100) : 0;

  return res.json({
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    netBalance: Number(netBalance.toFixed(2)),
    savingsRate,
    monthToDateExpense: Number(monthExpenses.toFixed(2)),
    monthToDateIncome: Number(monthIncome.toFixed(2)),
    totalBudgetLimit,
    budgetUsagePercent,
    recentTransactions,
    categoryBreakdown
  });
});

app.get("/api/reports/analytics", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const { timeframe } = req.query; // 'daily' | 'weekly' | 'monthly'

  const userExpenses = db.expenses.filter(e => e.userId === userId);
  const userIncomes = db.incomes.filter(i => i.userId === userId);

  // 1. Daily breakdown for past 14 days
  const dailyMap: Record<string, { date: string; expense: number; income: number }> = {};
  for (let d = 13; d >= 0; d--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - d);
    const dateStr = dt.toISOString().split('T')[0];
    dailyMap[dateStr] = { date: dateStr, expense: 0, income: 0 };
  }

  userExpenses.forEach(e => {
    if (dailyMap[e.date]) {
      dailyMap[e.date].expense += e.amount;
    }
  });

  userIncomes.forEach(i => {
    if (dailyMap[i.date]) {
      dailyMap[i.date].income += i.amount;
    }
  });

  const dailyReport = Object.values(dailyMap);

  // 2. Monthly comparison for last 6 months
  const monthlyData = [
    { month: 'Apr 26', income: 4200, expense: 2150, savings: 2050 },
    { month: 'May 26', income: 4500, expense: 2380, savings: 2120 },
    { month: 'Jun 26', income: 5100, expense: 2840, savings: 2260 },
    { month: 'Jul 26', income: 4800, expense: 2290, savings: 2510 },
    { month: 'Aug 26', income: 5600, expense: 2600, savings: 3000 },
    { 
      month: 'Sep 26', 
      income: userIncomes.reduce((s, i) => s + i.amount, 0), 
      expense: userExpenses.reduce((s, e) => s + e.amount, 0),
      savings: userIncomes.reduce((s, i) => s + i.amount, 0) - userExpenses.reduce((s, e) => s + e.amount, 0)
    }
  ];

  // 3. Category distribution
  const categoryStats: Record<string, { name: string; amount: number; color: string; count: number }> = {};
  userExpenses.forEach(e => {
    if (!categoryStats[e.categoryName]) {
      categoryStats[e.categoryName] = { name: e.categoryName, amount: 0, color: e.categoryColor, count: 0 };
    }
    categoryStats[e.categoryName].amount += e.amount;
    categoryStats[e.categoryName].count += 1;
  });

  const totalExpenseSum = userExpenses.reduce((s, e) => s + e.amount, 0);
  const categoryWise = Object.values(categoryStats).map(c => ({
    ...c,
    amount: Number(c.amount.toFixed(2)),
    percentage: totalExpenseSum > 0 ? Math.round((c.amount / totalExpenseSum) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  // 4. Payment method breakdown
  const paymentMethods: Record<string, number> = {};
  userExpenses.forEach(e => {
    paymentMethods[e.paymentMethod] = (paymentMethods[e.paymentMethod] || 0) + e.amount;
  });

  return res.json({
    dailyReport,
    monthlyComparison: monthlyData,
    categoryAnalysis: categoryWise,
    paymentMethodsDistribution: Object.entries(paymentMethods).map(([method, amount]) => ({
      method,
      amount: Number(amount.toFixed(2))
    }))
  });
});

// ----------------------------------------------------
// 8. Notification Module Endpoints
// ----------------------------------------------------
app.get("/api/notifications", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  const list = db.notifications.filter(n => n.userId === userId);
  const unreadCount = list.filter(n => !n.isRead).length;
  return res.json({ unreadCount, notifications: list });
});

app.put("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const notif = db.notifications.find(n => n.id === id);
  if (!notif) {
    return res.status(404).json({ error: "Notification not found." });
  }
  notif.isRead = true;
  saveDb();
  return res.json({ message: "Notification marked as read", notification: notif });
});

app.post("/api/notifications/mark-all-read", (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'usr-demo-1';
  db.notifications.forEach(n => {
    if (n.userId === userId) n.isRead = true;
  });
  saveDb();
  return res.json({ message: "All notifications marked as read." });
});

app.delete("/api/notifications/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.notifications.findIndex(n => n.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Notification not found." });
  }
  db.notifications.splice(idx, 1);
  saveDb();
  return res.json({ message: "Notification dismissed." });
});

// ----------------------------------------------------
// 10. Admin Module Endpoints
// ----------------------------------------------------
app.get("/api/admin/users", (req, res) => {
  const safeUsers = db.users.map(u => {
    const expenseCount = db.expenses.filter(e => e.userId === u.id).length;
    const totalSpent = db.expenses.filter(e => e.userId === u.id).reduce((s, e) => s + e.amount, 0);
    const incomeCount = db.incomes.filter(i => i.userId === u.id).length;
    const { passwordHash, ...safe } = u;
    return {
      ...safe,
      expenseCount,
      totalSpent: Number(totalSpent.toFixed(2)),
      incomeCount
    };
  });
  return res.json({ totalUsers: safeUsers.length, users: safeUsers });
});

app.put("/api/admin/users/:id/status", (req, res) => {
  const { id } = req.params;
  const { isActive, role } = req.body;
  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (isActive !== undefined) user.isActive = Boolean(isActive);
  if (role && (role === 'admin' || role === 'user')) user.role = role;

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: 'usr-admin-1',
    username: 'admin',
    action: 'ADMIN_USER_UPDATE',
    details: `Updated user ${user.username}: active=${user.isActive}, role=${user.role}`,
    timestamp: new Date().toISOString()
  });

  saveDb();
  const { passwordHash, ...safe } = user;
  return res.json({ message: "User status updated", user: safe });
});

app.get("/api/admin/system-stats", (req, res) => {
  const totalExpenses = db.expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncomes = db.incomes.reduce((s, i) => s + i.amount, 0);
  return res.json({
    totalUsers: db.users.length,
    activeUsers: db.users.filter(u => u.isActive).length,
    totalExpensesCount: db.expenses.length,
    totalIncomesCount: db.incomes.length,
    totalPlatformVolume: Number((totalExpenses + totalIncomes).toFixed(2)),
    totalCategoriesCount: db.categories.length,
    activeBudgetsCount: db.budgets.length,
    databaseEngine: "SQLite / PostgreSQL Compatible ORM",
    uptimeSeconds: Math.floor(process.uptime()),
    auditLogs: db.auditLogs.slice(0, 15)
  });
});

app.get("/api/admin/settings", (req, res) => {
  return res.json(db.settings);
});

app.put("/api/admin/settings", (req, res) => {
  const { currencyCode, currencySymbol, budgetWarningThreshold, budgetDangerThreshold, fiscalMonthStartDay, dateFormat } = req.body;
  if (currencyCode !== undefined) db.settings.currencyCode = currencyCode;
  if (currencySymbol !== undefined) db.settings.currencySymbol = currencySymbol;
  if (budgetWarningThreshold !== undefined) db.settings.budgetWarningThreshold = Number(budgetWarningThreshold);
  if (budgetDangerThreshold !== undefined) db.settings.budgetDangerThreshold = Number(budgetDangerThreshold);
  if (fiscalMonthStartDay !== undefined) db.settings.fiscalMonthStartDay = Number(fiscalMonthStartDay);
  if (dateFormat !== undefined) db.settings.dateFormat = dateFormat;

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: 'usr-admin-1',
    username: 'admin',
    action: 'SETTINGS_UPDATE',
    details: 'System configuration settings updated',
    timestamp: new Date().toISOString()
  });

  saveDb();
  return res.json({ message: "System settings saved successfully", settings: db.settings });
});

// Seed demo data endpoint
app.post("/api/seed-demo-data", (req, res) => {
  seedDatabase();
  return res.json({ message: "Database reset to initial sample data with 10 expenses and 3 incomes." });
});

// API Documentation schema for the Postman testing tool
app.get("/api/docs/endpoints", (req, res) => {
  const endpoints = [
    { category: "Authentication", method: "POST", endpoint: "/api/auth/register", description: "Register a new user account with email and password", defaultBody: { username: "sarah_connor", email: "sarah@cyberdyne.io", password: "securePass123", fullName: "Sarah Connor", phone: "+1 555-0199", occupation: "Defense Engineer" } },
    { category: "Authentication", method: "POST", endpoint: "/api/auth/login", description: "Authenticate and acquire session JWT token", defaultBody: { identifier: "alex_morgan", password: "password123" } },
    { category: "Authentication", method: "GET", endpoint: "/api/auth/profile", description: "Fetch current user profile attributes", defaultHeaders: { "x-user-id": "usr-demo-1" } },
    { category: "Authentication", method: "PUT", endpoint: "/api/auth/profile", description: "Update profile data (name, phone, occupation)", defaultHeaders: { "x-user-id": "usr-demo-1" }, defaultBody: { fullName: "Alex Morgan, Ph.D.", occupation: "Staff Architect" } },
    { category: "Expenses", method: "GET", endpoint: "/api/expenses?category=all&sortBy=date&sortOrder=desc", description: "Query filtered expense records", defaultHeaders: { "x-user-id": "usr-demo-1" } },
    { category: "Expenses", method: "POST", endpoint: "/api/expenses", description: "Create an expense record & trigger budget checks", defaultHeaders: { "x-user-id": "usr-demo-1" }, defaultBody: { amount: 52.40, categoryId: "cat-food", date: "2026-09-16", description: "Dinner with clients", paymentMethod: "Credit Card", notes: "Project milestone celebration" } },
    { category: "Expenses", method: "DELETE", endpoint: "/api/expenses/exp-1", description: "Delete an existing expense by ID", defaultHeaders: { "x-user-id": "usr-demo-1" } },
    { category: "Incomes", method: "GET", endpoint: "/api/incomes", description: "List income transaction records", defaultHeaders: { "x-user-id": "usr-demo-1" } },
    { category: "Incomes", method: "POST", endpoint: "/api/incomes", description: "Log a new income deposit", defaultHeaders: { "x-user-id": "usr-demo-1" }, defaultBody: { amount: 1500, source: "Freelancing", date: "2026-09-16", description: "Mobile App Backend Consulting", paymentMode: "Bank Transfer" } },
    { category: "Categories", method: "GET", endpoint: "/api/categories", description: "Fetch all expense and income categories" },
    { category: "Categories", method: "POST", endpoint: "/api/categories", description: "Create a custom category", defaultBody: { name: "Pets & Animals", type: "expense", icon: "PawPrint", color: "#f59e0b", description: "Vet visits, pet food, toys", budgetLimit: 150 } },
    { category: "Budgets", method: "GET", endpoint: "/api/budgets?month=2026-09", description: "Fetch monthly budgets with live spent tracking & alerts", defaultHeaders: { "x-user-id": "usr-demo-1" } },
    { category: "Budgets", method: "POST", endpoint: "/api/budgets", description: "Set or update monthly category budget", defaultHeaders: { "x-user-id": "usr-demo-1" }, defaultBody: { categoryId: "cat-travel", monthlyLimit: 450, month: "2026-09", alertThresholdPercent: 80 } },
    { category: "Dashboard & Analytics", method: "GET", endpoint: "/api/dashboard/stats", description: "Retrieve high-level finance metrics & recent transactions", defaultHeaders: { "x-user-id": "usr-demo-1" } },
    { category: "Dashboard & Analytics", method: "GET", endpoint: "/api/reports/analytics", description: "Detailed multi-dimensional reports & charts data", defaultHeaders: { "x-user-id": "usr-demo-1" } },
    { category: "Notifications", method: "GET", endpoint: "/api/notifications", description: "Fetch user alerts and budget notices", defaultHeaders: { "x-user-id": "usr-demo-1" } },
    { category: "Admin Console", method: "GET", endpoint: "/api/admin/users", description: "Administrative listing of all users & transaction metrics" },
    { category: "Admin Console", method: "GET", endpoint: "/api/admin/system-stats", description: "System performance, storage, and transaction audit logs" }
  ];
  return res.json(endpoints);
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FinTrack Server running on http://localhost:${PORT}`);
  });
}

startServer();
