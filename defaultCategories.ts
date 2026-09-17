import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#f97316', description: 'Groceries, restaurants, snacks, cafes', isDefault: true, budgetLimit: 600 },
  { id: 'cat-travel', name: 'Travel & Transport', type: 'expense', icon: 'Car', color: '#0ea5e9', description: 'Fuel, public transit, flights, rideshare', isDefault: true, budgetLimit: 350 },
  { id: 'cat-shopping', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', description: 'Clothing, gadgets, home goods', isDefault: true, budgetLimit: 400 },
  { id: 'cat-bills', name: 'Bills & Utilities', type: 'expense', icon: 'Zap', color: '#eab308', description: 'Electricity, water, internet, phone', isDefault: true, budgetLimit: 450 },
  { id: 'cat-housing', name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#8b5cf6', description: 'Monthly rent, mortgage, home repairs', isDefault: true, budgetLimit: 1400 },
  { id: 'cat-health', name: 'Healthcare', type: 'expense', icon: 'HeartPulse', color: '#ef4444', description: 'Doctors, medicines, insurance, gym', isDefault: true, budgetLimit: 250 },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', icon: 'Film', color: '#6366f1', description: 'Movies, games, streaming services', isDefault: true, budgetLimit: 200 },
  { id: 'cat-education', name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#14b8a6', description: 'Courses, books, tuition, certifications', isDefault: true, budgetLimit: 150 },
  { id: 'cat-inc-salary', name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10b981', description: 'Primary employment wage', isDefault: true },
  { id: 'cat-inc-freelance', name: 'Freelance & Consulting', type: 'income', icon: 'Laptop', color: '#06b6d4', description: 'Contract projects and gigs', isDefault: true },
  { id: 'cat-inc-investments', name: 'Investments & Dividends', type: 'income', icon: 'TrendingUp', color: '#3b82f6', description: 'Stocks, mutual funds, interest', isDefault: true },
  { id: 'cat-inc-business', name: 'Business Revenue', type: 'income', icon: 'Store', color: '#8b5cf6', description: 'E-commerce or enterprise revenue', isDefault: true },
  { id: 'cat-inc-rental', name: 'Rental Property', type: 'income', icon: 'Building', color: '#64748b', description: 'Tenant lease rental yield', isDefault: true },
  { id: 'cat-inc-gift', name: 'Gift & Bonus', type: 'income', icon: 'Gift', color: '#f59e0b', description: 'Holiday gifts, tax return, grants', isDefault: true },
];
