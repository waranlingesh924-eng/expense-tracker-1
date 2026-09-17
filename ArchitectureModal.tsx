import React, { useState } from 'react';
import { 
  Code2, 
  Database, 
  Layers, 
  Copy, 
  Check, 
  X, 
  Server, 
  Cpu, 
  BookOpen 
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'django' | 'springboot' | 'sql'>('django');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const djangoCode = `# Django REST Framework Implementation (fintrack/expenses)
# 1. models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    currency = models.CharField(max_length=3, default='USD')
    phone = models.CharField(max_length=20, blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

class Category(models.Model):
    TYPE_CHOICES = [('expense', 'Expense'), ('income', 'Income')]
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    icon = models.CharField(max_length=50, default='Tag')
    color = models.CharField(max_length=20, default='#6366f1')
    description = models.TextField(blank=True)
    is_default = models.BooleanField(default=False)
    budget_limit = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='expenses')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    description = models.CharField(max_length=255)
    payment_method = models.CharField(max_length=50, default='Credit Card')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

class Income(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    source = models.CharField(max_length=100)
    date = models.DateField()
    description = models.CharField(max_length=255)
    payment_mode = models.CharField(max_length=50, default='Direct Deposit')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    monthly_limit = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.CharField(max_length=7) # YYYY-MM
    alert_threshold_percent = models.PositiveIntegerField(default=80)

    class Meta:
        unique_together = ('user', 'category', 'month')

# 2. serializers.py
from rest_framework import serializers

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_color = serializers.ReadOnlyField(source='category.color')

    class Meta:
        model = Expense
        fields = ['id', 'user', 'amount', 'category', 'category_name', 'category_color', 'date', 'description', 'payment_method', 'notes', 'created_at']

# 3. views.py
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'date']
    search_fields = ['description', 'notes', 'category__name']
    ordering_fields = ['date', 'amount']

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)`;

  const springBootCode = `// Spring Boot 3+ Enterprise REST Architecture
package com.fintrack.backend.expense;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// 1. Entity
@Entity
@Table(name = "expenses", indexes = {
    @Index(name = "idx_expense_user_date", columnList = "user_id, date")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "category_id", nullable = false)
    private String categoryId;

    @NotBlank
    @Column(nullable = false)
    private String description;

    @NotNull
    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

// 2. Repository
public interface ExpenseRepository extends JpaRepository<Expense, String> {
    List<Expense> findByUserIdOrderByDateDesc(String userId);
    List<Expense> findByUserIdAndCategoryId(String userId, String categoryId);
}

// 3. Service Layer
@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final BudgetService budgetService;
    private final NotificationService notificationService;

    @Transactional
    public Expense createExpense(ExpenseRequestDTO dto, String userId) {
        Expense expense = Expense.builder()
            .userId(userId)
            .amount(dto.getAmount())
            .categoryId(dto.getCategoryId())
            .description(dto.getDescription())
            .date(dto.getDate())
            .paymentMethod(dto.getPaymentMethod())
            .notes(dto.getNotes())
            .build();

        Expense saved = expenseRepository.save(expense);
        budgetService.evaluateThresholdAndTriggerNotification(userId, dto.getCategoryId(), dto.getDate());
        return saved;
    }
}

// 4. REST Controller
@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExpenseController {
    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<Expense>> getExpenses(@RequestHeader("x-user-id") String userId) {
        return ResponseEntity.ok(expenseService.getUserExpenses(userId));
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(
            @Valid @RequestBody ExpenseRequestDTO dto,
            @RequestHeader("x-user-id") String userId) {
        return ResponseEntity.status(201).body(expenseService.createExpense(dto, userId));
    }
}`;

  const sqlSchema = `-- Relational Database Schema DDL (PostgreSQL / SQLite Compatible)

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url VARCHAR(255),
    currency VARCHAR(3) DEFAULT 'USD',
    phone VARCHAR(30),
    occupation VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income')),
    icon VARCHAR(50) DEFAULT 'Tag',
    color VARCHAR(20) DEFAULT '#6366f1',
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    budget_limit NUMERIC(12, 2)
);

-- 3. Expenses Table
CREATE TABLE expenses (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id VARCHAR(64) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Credit Card',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX idx_expenses_category ON expenses(category_id);

-- 4. Incomes Table
CREATE TABLE incomes (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
    source VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    payment_mode VARCHAR(50) DEFAULT 'Direct Deposit',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incomes_user_date ON incomes(user_id, date);

-- 5. Monthly Budgets Table
CREATE TABLE budgets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id VARCHAR(64) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    monthly_limit NUMERIC(12, 2) NOT NULL CHECK (monthly_limit > 0),
    month VARCHAR(7) NOT NULL, -- Format YYYY-MM
    alert_threshold_percent INT DEFAULT 80 CHECK (alert_threshold_percent BETWEEN 10 AND 100),
    UNIQUE (user_id, category_id, month)
);

-- 6. Notifications Table
CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('budget_alert', 'expense_reminder', 'monthly_summary', 'system')),
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  const activeSnippet = activeTab === 'django' ? djangoCode : activeTab === 'springboot' ? springBootCode : sqlSchema;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-slate-900 text-slate-100 rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Backend Architecture & Database Specifications</h2>
              <p className="text-[11px] text-slate-400">
                Django REST Framework, Spring Boot equivalents & SQLite/PostgreSQL DDL schema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copySnippet(activeSnippet)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-800 bg-slate-950/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('django')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'django' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Django REST Framework (Python)</span>
          </button>

          <button
            onClick={() => setActiveTab('springboot')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'springboot' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Spring Boot 3 (Java)</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'sql' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>SQLite / PostgreSQL DDL Schema</span>
          </button>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 p-4 bg-slate-950 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed select-all">
          <pre>{activeSnippet}</pre>
        </div>

      </div>
    </div>
  );
};
