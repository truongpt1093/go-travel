import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  Users, DollarSign, PieChart, Settings, RefreshCw, Moon, Sun,
  LogOut, Plus, Trash2, Edit2, Save, X, Search, Filter,
  Calendar, Tag, User, FileText, AlertCircle, CheckCircle,
  TrendingUp, ArrowRight, Download, ExternalLink, Loader2, QrCode
} from 'lucide-react';
import {
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// ============================================================================
// GOOGLE SHEETS API CONFIGURATION & HELPERS
// ============================================================================

// Pre-configured values - change these to customize your deployment
const DEFAULT_CONFIG = {
  CLIENT_ID: '876769626776-p0ams39s5s6q58f9a2kv8k9ovtr5jng1.apps.googleusercontent.com',
  SPREADSHEET_ID: '1xi_TjEGThNhKk20ybz3uDCcsaNGQPeKAmVzzKIIfHSI',
};

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// Google Sheets API Helper Functions
class GoogleSheetsAPI {
  constructor() {
    this.gapiInited = false;
    this.gisInited = false;
    this.tokenClient = null;
    this.accessToken = null;
  }

  // Initialize Google API
  async initializeGapi(clientId) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              discoveryDocs: [DISCOVERY_DOC],
            });
            this.gapiInited = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // Initialize Google Identity Services
  async initializeGis(clientId, callback) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: (response) => {
            if (response.error) {
              callback({ error: response.error });
            } else {
              this.accessToken = response.access_token;
              window.gapi.client.setToken({ access_token: response.access_token });
              callback(response);
            }
          },
        });
        this.gisInited = true;
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // Request access token
  requestAccessToken() {
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: '' });
    }
  }

  // Revoke access token
  revokeAccessToken() {
    if (this.accessToken) {
      window.google.accounts.oauth2.revoke(this.accessToken, () => {
        this.accessToken = null;
        window.gapi.client.setToken(null);
      });
    }
  }

  // Fetch data from a sheet
  async fetchSheetData(spreadsheetId, sheetName, range = 'A:Z') {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!${range}`,
      });
      return response.result.values || [];
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      throw error;
    }
  }

  // Append data to a sheet
  async appendToSheet(spreadsheetId, sheetName, values) {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });
      return response.result;
    } catch (error) {
      console.error('Error appending to sheet:', error);
      throw error;
    }
  }

  // Update a row in a sheet
  async updateSheetRow(spreadsheetId, sheetName, rowIndex, values) {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [values] },
      });
      return response.result;
    } catch (error) {
      console.error('Error updating sheet row:', error);
      throw error;
    }
  }

  // Delete a row in a sheet (by marking as deleted or clearing)
  async deleteSheetRow(spreadsheetId, sheetName, rowIndex) {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
      });
      return response.result;
    } catch (error) {
      console.error('Error deleting sheet row:', error);
      throw error;
    }
  }

  // Create a new spreadsheet
  async createSpreadsheet(title) {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.create({
        resource: {
          properties: { title },
        },
      });
      return response.result;
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  }

  // Initialize sheets structure
  async initializeSheets(spreadsheetId) {
    try {
      // Create the three sheets: Members, Expenses, Settings
      const requests = [
        {
          addSheet: {
            properties: { title: 'Members' },
          },
        },
        {
          addSheet: {
            properties: { title: 'Expenses' },
          },
        },
        {
          addSheet: {
            properties: { title: 'Settings' },
          },
        },
      ];

      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests },
      });

      // Add headers
      await this.appendToSheet(spreadsheetId, 'Members', [
        ['ID', 'Name', 'Color', 'CreatedAt'],
      ]);
      await this.appendToSheet(spreadsheetId, 'Expenses', [
        ['ID', 'Title', 'Amount', 'PaidBy', 'SharedWith', 'Date', 'Category', 'Note', 'CreatedAt'],
      ]);
      await this.appendToSheet(spreadsheetId, 'Settings', [
        ['Key', 'Value'],
        ['currency', 'VND'],
        ['tripName', 'My Trip'],
        ['startDate', new Date().toLocaleDateString('vi-VN')],
      ]);

      return true;
    } catch (error) {
      console.error('Error initializing sheets:', error);
      throw error;
    }
  }
}

// ============================================================================
// CONTEXT & STATE MANAGEMENT
// ============================================================================

const AppContext = createContext();

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

const parseSheetDate = (dateStr) => {
  try {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(dateStr);
  } catch {
    return new Date();
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

// Generate unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Colors for member avatars
const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

const CATEGORIES = [
  { value: 'food', label: 'Ăn uống', color: '#ef4444' },
  { value: 'transport', label: 'Di chuyển', color: '#3b82f6' },
  { value: 'accommodation', label: 'Lưu trú', color: '#8b5cf6' },
  { value: 'entertainment', label: 'Vui chơi', color: '#f59e0b' },
  { value: 'other', label: 'Khác', color: '#6b7280' },
];

// ============================================================================
// SETTLEMENT CALCULATION ALGORITHM
// ============================================================================

const calculateSettlements = (members, expenses) => {
  // Calculate balance for each member
  const balances = {};
  members.forEach(member => {
    balances[member.id] = 0;
  });

  expenses.forEach(expense => {
    const amount = parseFloat(expense.amount);
    const sharedWith = expense.sharedWith.split(',').filter(id => id);
    const perPerson = amount / sharedWith.length;

    // Person who paid gets credited
    balances[expense.paidBy] += amount;

    // Everyone who shared the expense gets debited
    sharedWith.forEach(memberId => {
      balances[memberId] -= perPerson;
    });
  });

  // Create creditors (people who are owed money) and debtors (people who owe money)
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([memberId, balance]) => {
    if (balance > 0.01) {
      creditors.push({ memberId, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ memberId, amount: -balance });
    }
  });

  // Optimize settlements using greedy algorithm
  const settlements = [];
  let i = 0, j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const settleAmount = Math.min(creditor.amount, debtor.amount);

    settlements.push({
      from: debtor.memberId,
      to: creditor.memberId,
      amount: settleAmount,
    });

    creditor.amount -= settleAmount;
    debtor.amount -= settleAmount;

    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }

  return { balances, settlements };
};

// ============================================================================
// TOAST NOTIFICATION COMPONENT
// ============================================================================

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle,
  }[type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in`}>
      <Icon className="w-5 h-5" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

const LoadingSpinner = ({ className = '' }) => (
  <Loader2 className={`animate-spin ${className}`} />
);

// ============================================================================
// MEMBER MANAGEMENT COMPONENT
// ============================================================================

const MembersTab = () => {
  const { members, addMember, updateMember, deleteMember, isLoading } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: COLORS[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      await updateMember(editingId, formData);
      setEditingId(null);
    } else {
      await addMember(formData);
    }

    setFormData({ name: '', color: COLORS[0] });
    setIsAdding(false);
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setFormData({ name: member.name, color: member.color });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', color: COLORS[0] });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thành viên</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm thành viên
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên thành viên
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nhập tên..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Màu đại diện
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-full transition-transform ${formData.color === color ? 'ring-4 ring-blue-500 scale-110' : 'hover:scale-105'
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <LoadingSpinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Cập nhật' : 'Thêm'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-semibold transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(member => (
          <div
            key={member.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md flex items-center gap-4 group hover:shadow-lg transition-shadow"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: member.color }}
            >
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(member.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(member)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Xóa thành viên "${member.name}"?`)) {
                    deleteMember(member.id);
                  }
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && !isAdding && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Chưa có thành viên nào. Thêm thành viên để bắt đầu!</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPENSE MANAGEMENT COMPONENT
// ============================================================================

const ExpensesTab = () => {
  const { members, expenses, addExpense, updateExpense, deleteExpense, isLoading } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPaidBy, setFilterPaidBy] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    paidBy: '',
    sharedWith: [],
    date: new Date().toISOString().split('T')[0],
    category: 'food',
    note: '',
  });

  useEffect(() => {
    if (members.length > 0 && !formData.paidBy) {
      setFormData(prev => ({
        ...prev,
        paidBy: members[0].id,
        sharedWith: members.map(m => m.id),
      }));
    }
  }, [members]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount || !formData.paidBy) return;

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      sharedWith: formData.sharedWith.join(','),
    };

    if (editingId) {
      await updateExpense(editingId, expenseData);
      setEditingId(null);
    } else {
      await addExpense(expenseData);
    }

    setFormData({
      title: '',
      amount: '',
      paidBy: members[0]?.id || '',
      sharedWith: members.map(m => m.id),
      date: new Date().toISOString().split('T')[0],
      category: 'food',
      note: '',
    });
    setIsAdding(false);
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      paidBy: expense.paidBy,
      sharedWith: expense.sharedWith.split(',').filter(id => id),
      date: new Date(parseSheetDate(expense.date)).toISOString().split('T')[0],
      category: expense.category,
      note: expense.note,
    });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: '',
      amount: '',
      paidBy: members[0]?.id || '',
      sharedWith: members.map(m => m.id),
      date: new Date().toISOString().split('T')[0],
      category: 'food',
      note: '',
    });
    setIsAdding(false);
  };

  const toggleSharedWith = (memberId) => {
    setFormData(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.includes(memberId)
        ? prev.sharedWith.filter(id => id !== memberId)
        : [...prev.sharedWith, memberId],
    }));
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.note.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    const matchesPaidBy = filterPaidBy === 'all' || expense.paidBy === filterPaidBy;
    return matchesSearch && matchesCategory && matchesPaidBy;
  });

  const getMemberName = (memberId) => {
    return members.find(m => m.id === memberId)?.name || 'Unknown';
  };

  const getMemberColor = (memberId) => {
    return members.find(m => m.id === memberId)?.color || '#6b7280';
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>Vui lòng thêm thành viên trước khi tạo chi phí!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chi phí</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm chi phí
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên khoản chi
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ví dụ: Ăn trưa ngày 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số tiền (VNĐ)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Người chi trả
              </label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {members.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ngày chi
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Danh mục
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Người được hưởng
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleSharedWith(member.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${formData.sharedWith.includes(member.id)
                      ? 'text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  style={formData.sharedWith.includes(member.id) ? { backgroundColor: member.color } : {}}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows="2"
              placeholder="Ghi chú thêm..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.amount || formData.sharedWith.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <LoadingSpinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Cập nhật' : 'Thêm'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-semibold transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tất cả danh mục</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={filterPaidBy}
            onChange={(e) => setFilterPaidBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tất cả người chi</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.map(expense => {
          const category = CATEGORIES.find(c => c.value === expense.category);
          return (
            <div
              key={expense.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: category?.color + '20' }}
                >
                  <Tag className="w-6 h-6" style={{ color: category?.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{expense.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{category?.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(expense.amount)} đ
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 dark:text-gray-400">Trả:</span>
                      <span
                        className="px-2 py-1 rounded text-white font-medium"
                        style={{ backgroundColor: getMemberColor(expense.paidBy) }}
                      >
                        {getMemberName(expense.paidBy)}
                      </span>
                    </div>

                    <span className="text-gray-400">→</span>

                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-gray-500 dark:text-gray-400">Chia:</span>
                      {expense.sharedWith.split(',').filter(id => id).map(memberId => (
                        <span
                          key={memberId}
                          className="px-2 py-1 rounded text-white text-xs font-medium"
                          style={{ backgroundColor: getMemberColor(memberId) }}
                        >
                          {getMemberName(memberId)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {expense.note && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                      {expense.note}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xóa chi phí "${expense.title}"?`)) {
                        deleteExpense(expense.id);
                      }
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredExpenses.length === 0 && !isAdding && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Chưa có chi phí nào{searchTerm || filterCategory !== 'all' || filterPaidBy !== 'all' ? ' phù hợp với bộ lọc' : ''}.</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SETTLEMENT / PAYMENT COMPONENT
// ============================================================================

const SettlementTab = () => {
  const { members, expenses } = useApp();
  const { balances, settlements } = calculateSettlements(members, expenses);
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  const getMember = (memberId) => members.find(m => m.id === memberId);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thanh toán</h2>

      {/* Balance Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tổng kết</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => {
            const balance = balances[member.id] || 0;
            const isPositive = balance > 0.01;
            const isNegative = balance < -0.01;

            return (
              <div
                key={member.id}
                className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md ${isPositive ? 'border-l-4 border-green-500' : isNegative ? 'border-l-4 border-red-500' : 'border-l-4 border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                    <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
                      }`}>
                      {isPositive && '+ '}
                      {formatCurrency(Math.abs(balance))} đ
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {isPositive ? 'Được nợ' : isNegative ? 'Đang nợ' : 'Đã cân bằng'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settlement Suggestions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gợi ý thanh toán</h3>
        {settlements.length > 0 ? (
          <div className="space-y-3">
            {settlements.map((settlement, index) => {
              const fromMember = getMember(settlement.from);
              const toMember = getMember(settlement.to);

              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md flex items-center gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: fromMember.color }}
                    >
                      {fromMember.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white truncate">{fromMember.name}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(settlement.amount)} đ
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
                  </div>

                  <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                    <span className="font-medium text-gray-900 dark:text-white truncate">{toMember.name}</span>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: toMember.color }}
                    >
                      {toMember.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSettlement(settlement)}
                    className="p-2 ml-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-full transition-colors flex-shrink-0"
                    title="Mã QR thanh toán"
                  >
                    <QrCode className="w-6 h-6" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <p className="font-medium">Tất cả đã thanh toán!</p>
            <p className="text-sm mt-2">Không còn khoản nào cần thanh toán.</p>
          </div>
        )}
      </div>

      {/* VietQR Modal */}
      {selectedSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => setSelectedSettlement(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              Quét mã để thanh toán
            </h3>

            <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 mb-6 mx-auto max-w-[250px]">
              <img
                src={`https://img.vietqr.io/image/970418-1221717392-compact.png?amount=${Math.round(selectedSettlement.amount)}&addInfo=${encodeURIComponent(`Tra no ${getMember(selectedSettlement.from)?.name} cho ${getMember(selectedSettlement.to)?.name}`)}`}
                alt="VietQR"
                className="w-full aspect-square object-contain"
              />
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Số tiền</span>
                <span className="font-bold text-blue-600 text-lg">
                  {formatCurrency(selectedSettlement.amount)} đ
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Người trả</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getMember(selectedSettlement.from)?.name}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 dark:text-gray-400">Người nhận</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {getMember(selectedSettlement.to)?.name}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                BIDV • 1221717392
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DASHBOARD / CHARTS COMPONENT
// ============================================================================

const DashboardTab = () => {
  const { members, expenses, settings } = useApp();

  // Calculate statistics
  const totalExpense = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const expenseCount = expenses.length;
  const avgPerPerson = members.length > 0 ? totalExpense / members.length : 0;

  // Expense by category
  const expenseByCategory = CATEGORIES.map(cat => {
    const total = expenses
      .filter(exp => exp.category === cat.value)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    return {
      name: cat.label,
      value: total,
      color: cat.color,
    };
  }).filter(item => item.value > 0);

  // Expense by member
  const expenseByMember = members.map(member => {
    const total = expenses
      .filter(exp => exp.paidBy === member.id)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    return {
      name: member.name,
      amount: total,
      color: member.color,
    };
  });

  // Expense over time
  const expenseOverTime = expenses
    .map(exp => ({
      date: parseSheetDate(exp.date),
      amount: parseFloat(exp.amount),
    }))
    .sort((a, b) => a.date - b.date)
    .reduce((acc, curr) => {
      const dateStr = curr.date.toLocaleDateString('vi-VN');
      const existing = acc.find(item => item.date === dateStr);
      if (existing) {
        existing.amount += curr.amount;
      } else {
        acc.push({ date: dateStr, amount: curr.amount });
      }
      return acc;
    }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tổng quan</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng chi phí</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(totalExpense)} đ</p>
            </div>
            <DollarSign className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">TB / Người</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(avgPerPerson)} đ</p>
            </div>
            <User className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Số giao dịch</p>
              <p className="text-3xl font-bold mt-1">{expenseCount}</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Chi phí theo danh mục</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}đ`}
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${formatCurrency(value)} đ`} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Member */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Chi phí theo người</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseByMember}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value) => `${formatCurrency(value)} đ`} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {expenseByMember.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Over Time */}
          {expenseOverTime.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Chi phí theo thời gian</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={expenseOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip formatter={(value) => `${formatCurrency(value)} đ`} />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {expenses.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg">
          <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Chưa có dữ liệu để hiển thị biểu đồ.</p>
          <p className="text-sm mt-2">Thêm chi phí để xem thống kê!</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SETTINGS COMPONENT
// ============================================================================

const SettingsTab = () => {
  const {
    settings,
    spreadsheetId,
    updateSettings,
    disconnectGoogle,
    darkMode,
    setDarkMode,
    showToast,
    isAuthenticated,
    handleSetupComplete,
    handleSpreadsheetSelect,
    sheetsAPI,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    tripName: '',
    currency: 'VND',
    startDate: '',
  });

  // OAuth setup states
  const [clientId, setClientId] = useState(localStorage.getItem('googleClientId') || DEFAULT_CONFIG.CLIENT_ID || '');
  const [showOAuthSetup, setShowOAuthSetup] = useState(false);

  // Spreadsheet selection states
  const [showSpreadsheetSetup, setShowSpreadsheetSetup] = useState(false);
  const [newSpreadsheetId, setNewSpreadsheetId] = useState('');
  const [newSpreadsheetName, setNewSpreadsheetName] = useState('Travel Expenses');
  const [isCreatingSpreadsheet, setIsCreatingSpreadsheet] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        tripName: settings.tripName || 'My Trip',
        currency: settings.currency || 'VND',
        startDate: settings.startDate || new Date().toLocaleDateString('vi-VN'),
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(formData);
    setIsEditing(false);
  };

  const handleConnectGoogle = async () => {
    if (!clientId.trim()) {
      showToast('Vui lòng nhập Google Client ID!', 'error');
      return;
    }
    localStorage.setItem('googleClientId', clientId.trim());
    await handleSetupComplete(clientId.trim());
    setShowOAuthSetup(false);
  };

  const handleSelectExistingSpreadsheet = () => {
    if (!newSpreadsheetId.trim()) {
      showToast('Vui lòng nhập Spreadsheet ID!', 'error');
      return;
    }
    handleSpreadsheetSelect(newSpreadsheetId.trim());
    setShowSpreadsheetSetup(false);
    setNewSpreadsheetId('');
    showToast('Đã chọn spreadsheet!', 'success');
  };

  const handleCreateNewSpreadsheet = async () => {
    if (!isAuthenticated) {
      showToast('Vui lòng kết nối Google trước!', 'error');
      return;
    }

    setIsCreatingSpreadsheet(true);
    try {
      const spreadsheet = await sheetsAPI.createSpreadsheet(newSpreadsheetName);
      await sheetsAPI.initializeSheets(spreadsheet.spreadsheetId);
      handleSpreadsheetSelect(spreadsheet.spreadsheetId);
      setShowSpreadsheetSetup(false);
      setNewSpreadsheetName('Travel Expenses');
      showToast('Đã tạo spreadsheet mới!', 'success');
    } catch (error) {
      showToast('Lỗi khi tạo spreadsheet: ' + error.message, 'error');
    } finally {
      setIsCreatingSpreadsheet(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt</h2>

      {/* Google OAuth Connection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Kết nối Google</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isAuthenticated ? (
                <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Đã kết nối
                </span>
              ) : (
                <span className="text-orange-600 dark:text-orange-400">Chưa kết nối</span>
              )}
            </p>
          </div>
          {!isAuthenticated && (
            <button
              onClick={() => setShowOAuthSetup(!showOAuthSetup)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {showOAuthSetup ? 'Đóng' : 'Kết nối'}
            </button>
          )}
        </div>

        {showOAuthSetup && !isAuthenticated && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Hướng dẫn cấu hình</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>Truy cập <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google Cloud Console</a></li>
                <li>Tạo project → Enable &quot;Google Sheets API&quot;</li>
                <li>Tạo OAuth 2.0 Client ID (Web application)</li>
                <li>Thêm Authorized JavaScript origins: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{window.location.origin}</code></li>
                <li>Copy Client ID và paste vào bên dưới</li>
              </ol>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google OAuth 2.0 Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="123456789-abcdefg.apps.googleusercontent.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              onClick={handleConnectGoogle}
              disabled={!clientId.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Kết nối ngay
            </button>
          </div>
        )}
      </div>

      {/* Spreadsheet Selection */}
      {isAuthenticated && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Google Spreadsheet</h3>
              {spreadsheetId && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono truncate max-w-md">
                  ID: {spreadsheetId}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowSpreadsheetSetup(!showSpreadsheetSetup)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {spreadsheetId ? 'Đổi Sheet' : 'Chọn Sheet'}
            </button>
          </div>

          {spreadsheetId && !showSpreadsheetSetup && (
            <div className="flex items-center gap-2">
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Mở trong Google Sheets
              </a>
            </div>
          )}

          {showSpreadsheetSetup && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tạo Spreadsheet mới</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpreadsheetName}
                    onChange={(e) => setNewSpreadsheetName(e.target.value)}
                    placeholder="Tên spreadsheet"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleCreateNewSpreadsheet}
                    disabled={isCreatingSpreadsheet || !newSpreadsheetName.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    {isCreatingSpreadsheet ? (
                      <>
                        <LoadingSpinner className="w-4 h-4" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Tạo mới
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">hoặc</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Sử dụng Spreadsheet có sẵn</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpreadsheetId}
                    onChange={(e) => setNewSpreadsheetId(e.target.value)}
                    placeholder="Nhập Spreadsheet ID"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  />
                  <button
                    onClick={handleSelectExistingSpreadsheet}
                    disabled={!newSpreadsheetId.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap"
                  >
                    Chọn
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Tìm ID trong URL: https://docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trip Settings - only show if spreadsheet is connected */}
      {spreadsheetId && settings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thông tin chuyến đi</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="text-green-600 hover:text-green-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Lưu
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên chuyến đi
                </label>
                <input
                  type="text"
                  value={formData.tripName}
                  onChange={(e) => setFormData({ ...formData, tripName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tiền tệ
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ngày bắt đầu
                </label>
                <input
                  type="text"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="dd/MM/yyyy"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tên chuyến đi</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.tripName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tiền tệ</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ngày bắt đầu</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.startDate}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share Link - only show if spreadsheet is connected */}
      {spreadsheetId && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chia sẻ với Team</h3>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Chia sẻ link này để team members có thể truy cập và chỉnh sửa spreadsheet của bạn:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}${window.location.pathname}?sheet=${spreadsheetId}`}
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded-lg text-sm text-gray-900 dark:text-white font-mono"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}${window.location.pathname}?sheet=${spreadsheetId}`;
                  navigator.clipboard.writeText(shareUrl).then(() => {
                    showToast('Đã copy link share!', 'success');
                  }).catch(() => {
                    showToast('Không thể copy. Vui lòng copy thủ công.', 'error');
                  });
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Copy Link
              </button>
            </div>
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>📝 Lưu ý:</strong> Để team members có thể chỉnh sửa, bạn cần:
              </p>
              <ol className="text-xs text-gray-600 dark:text-gray-400 list-decimal list-inside mt-2 space-y-1">
                <li>Mở <a href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Sheets</a></li>
                <li>Click <strong>Share</strong> (góc trên bên phải)</li>
                <li>Thêm email của team members với quyền <strong>Editor</strong></li>
                <li>Hoặc bật <strong>&quot;Anyone with the link can edit&quot;</strong></li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Giao diện</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Chế độ tối</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bật/tắt giao diện tối</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative w-16 h-8 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform flex items-center justify-center ${darkMode ? 'transform translate-x-8' : ''
                }`}
            >
              {darkMode ? <Moon className="w-4 h-4 text-blue-600" /> : <Sun className="w-4 h-4 text-gray-600" />}
            </div>
          </button>
        </div>
      </div>

      {/* Disconnect - only show if authenticated */}
      {isAuthenticated && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ngắt kết nối</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Ngắt kết nối với Google Account và xóa tất cả dữ liệu cục bộ. Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng.
          </p>
          <button
            onClick={() => {
              if (confirm('Bạn có chắc muốn ngắt kết nối?')) {
                disconnectGoogle();
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Ngắt kết nối
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState(() => {
    // Priority: URL param > localStorage > DEFAULT_CONFIG
    const urlParams = new URLSearchParams(window.location.search);
    const sheetIdFromUrl = urlParams.get('sheet');
    if (sheetIdFromUrl) {
      localStorage.setItem('spreadsheetId', sheetIdFromUrl);
      return sheetIdFromUrl;
    }
    const savedId = localStorage.getItem('spreadsheetId');
    if (savedId) return savedId;

    // Use pre-configured default
    if (DEFAULT_CONFIG.SPREADSHEET_ID) {
      localStorage.setItem('spreadsheetId', DEFAULT_CONFIG.SPREADSHEET_ID);
      return DEFAULT_CONFIG.SPREADSHEET_ID;
    }
    return '';
  });
  const [activeTab, setActiveTab] = useState(() => {
    // If pre-configured, start at dashboard; otherwise start at settings
    return (DEFAULT_CONFIG.CLIENT_ID && DEFAULT_CONFIG.SPREADSHEET_ID) ? 'dashboard' : 'settings';
  });
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [toast, setToast] = useState(null);

  const [sheetsAPI] = useState(() => new GoogleSheetsAPI());

  // Check for shared spreadsheet in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sheetIdFromUrl = urlParams.get('sheet');
    if (sheetIdFromUrl && sheetIdFromUrl !== spreadsheetId) {
      setSpreadsheetId(sheetIdFromUrl);
      localStorage.setItem('spreadsheetId', sheetIdFromUrl);
      showToast('Đã load spreadsheet từ link share!', 'success');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Auto-initialize Google APIs if clientId exists
  useEffect(() => {
    const savedClientId = localStorage.getItem('googleClientId') || DEFAULT_CONFIG.CLIENT_ID;
    if (savedClientId && !isAuthenticated) {
      // Save to localStorage if using default
      if (!localStorage.getItem('googleClientId') && DEFAULT_CONFIG.CLIENT_ID) {
        localStorage.setItem('googleClientId', DEFAULT_CONFIG.CLIENT_ID);
      }
      handleSetupComplete(savedClientId);
    }
  }, []);

  // Auto-switch to dashboard when both authenticated and spreadsheet is connected (only if not pre-configured)
  useEffect(() => {
    if (isAuthenticated && spreadsheetId && activeTab === 'settings' && !DEFAULT_CONFIG.CLIENT_ID) {
      // Only auto-switch if user is currently on settings tab and NOT using pre-configured setup
      setActiveTab('dashboard');
    }
  }, [isAuthenticated, spreadsheetId]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Show toast notification
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  // Initialize Google APIs
  const handleSetupComplete = async (clientId) => {
    try {
      await sheetsAPI.initializeGapi(clientId);
      await sheetsAPI.initializeGis(clientId, (response) => {
        if (response.error) {
          showToast('Lỗi xác thực: ' + response.error, 'error');
        } else {
          setIsAuthenticated(true);
          showToast('Đã kết nối thành công!', 'success');
        }
      });
      sheetsAPI.requestAccessToken();
    } catch (error) {
      showToast('Lỗi khởi tạo: ' + error.message, 'error');
    }
  };

  // Fetch all data from sheets
  const fetchData = useCallback(async () => {
    if (!spreadsheetId) return;

    setIsLoading(true);
    try {
      // Fetch members
      const membersData = await sheetsAPI.fetchSheetData(spreadsheetId, 'Members');
      if (membersData.length > 1) {
        const membersList = membersData.slice(1).filter(row => row[0]).map(row => ({
          id: row[0],
          name: row[1] || '',
          color: row[2] || COLORS[0],
          createdAt: row[3] || new Date().toISOString(),
        }));
        setMembers(membersList);
      }

      // Fetch expenses
      const expensesData = await sheetsAPI.fetchSheetData(spreadsheetId, 'Expenses');
      if (expensesData.length > 1) {
        const expensesList = expensesData.slice(1).filter(row => row[0]).map(row => ({
          id: row[0],
          title: row[1] || '',
          amount: parseFloat(row[2]) || 0,
          paidBy: row[3] || '',
          sharedWith: row[4] || '',
          date: row[5] || '',
          category: row[6] || 'other',
          note: row[7] || '',
          createdAt: row[8] || new Date().toISOString(),
        }));
        setExpenses(expensesList);
      }

      // Fetch settings
      const settingsData = await sheetsAPI.fetchSheetData(spreadsheetId, 'Settings');
      if (settingsData.length > 1) {
        const settingsObj = {};
        settingsData.slice(1).forEach(row => {
          if (row[0]) settingsObj[row[0]] = row[1];
        });
        setSettings(settingsObj);
      }

      setLastSynced(new Date());
      showToast('Đã đồng bộ dữ liệu!', 'success');
    } catch (error) {
      showToast('Lỗi tải dữ liệu: ' + error.message, 'error');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [spreadsheetId, sheetsAPI, showToast]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (isAuthenticated && spreadsheetId) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, spreadsheetId, fetchData]);

  // Handle spreadsheet selection
  const handleSpreadsheetSelect = (id) => {
    setSpreadsheetId(id);
    localStorage.setItem('spreadsheetId', id);
  };

  // Member operations
  const addMember = async (memberData) => {
    setIsLoading(true);
    try {
      const newMember = {
        id: generateId(),
        ...memberData,
        createdAt: new Date().toISOString(),
      };

      await sheetsAPI.appendToSheet(spreadsheetId, 'Members', [
        [newMember.id, newMember.name, newMember.color, newMember.createdAt],
      ]);

      setMembers(prev => [...prev, newMember]);
      showToast('Đã thêm thành viên!', 'success');
    } catch (error) {
      showToast('Lỗi thêm thành viên: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMember = async (memberId, memberData) => {
    setIsLoading(true);
    try {
      const memberIndex = members.findIndex(m => m.id === memberId);
      if (memberIndex === -1) return;

      const updatedMember = { ...members[memberIndex], ...memberData };
      const rowIndex = memberIndex + 2; // +1 for header, +1 for 1-based indexing

      await sheetsAPI.updateSheetRow(spreadsheetId, 'Members', rowIndex, [
        updatedMember.id,
        updatedMember.name,
        updatedMember.color,
        updatedMember.createdAt,
      ]);

      setMembers(prev => prev.map(m => m.id === memberId ? updatedMember : m));
      showToast('Đã cập nhật thành viên!', 'success');
    } catch (error) {
      showToast('Lỗi cập nhật thành viên: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMember = async (memberId) => {
    setIsLoading(true);
    try {
      const memberIndex = members.findIndex(m => m.id === memberId);
      if (memberIndex === -1) return;

      const rowIndex = memberIndex + 2;
      await sheetsAPI.deleteSheetRow(spreadsheetId, 'Members', rowIndex);

      setMembers(prev => prev.filter(m => m.id !== memberId));
      showToast('Đã xóa thành viên!', 'success');
    } catch (error) {
      showToast('Lỗi xóa thành viên: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Expense operations
  const addExpense = async (expenseData) => {
    setIsLoading(true);
    try {
      const newExpense = {
        id: generateId(),
        ...expenseData,
        date: formatDate(expenseData.date),
        createdAt: new Date().toISOString(),
      };

      await sheetsAPI.appendToSheet(spreadsheetId, 'Expenses', [
        [
          newExpense.id,
          newExpense.title,
          newExpense.amount,
          newExpense.paidBy,
          newExpense.sharedWith,
          newExpense.date,
          newExpense.category,
          newExpense.note,
          newExpense.createdAt,
        ],
      ]);

      setExpenses(prev => [...prev, newExpense]);
      showToast('Đã thêm chi phí!', 'success');
    } catch (error) {
      showToast('Lỗi thêm chi phí: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpense = async (expenseId, expenseData) => {
    setIsLoading(true);
    try {
      const expenseIndex = expenses.findIndex(e => e.id === expenseId);
      if (expenseIndex === -1) return;

      const updatedExpense = {
        ...expenses[expenseIndex],
        ...expenseData,
        date: formatDate(expenseData.date),
      };
      const rowIndex = expenseIndex + 2;

      await sheetsAPI.updateSheetRow(spreadsheetId, 'Expenses', rowIndex, [
        updatedExpense.id,
        updatedExpense.title,
        updatedExpense.amount,
        updatedExpense.paidBy,
        updatedExpense.sharedWith,
        updatedExpense.date,
        updatedExpense.category,
        updatedExpense.note,
        updatedExpense.createdAt,
      ]);

      setExpenses(prev => prev.map(e => e.id === expenseId ? updatedExpense : e));
      showToast('Đã cập nhật chi phí!', 'success');
    } catch (error) {
      showToast('Lỗi cập nhật chi phí: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    setIsLoading(true);
    try {
      const expenseIndex = expenses.findIndex(e => e.id === expenseId);
      if (expenseIndex === -1) return;

      const rowIndex = expenseIndex + 2;
      await sheetsAPI.deleteSheetRow(spreadsheetId, 'Expenses', rowIndex);

      setExpenses(prev => prev.filter(e => e.id !== expenseId));
      showToast('Đã xóa chi phí!', 'success');
    } catch (error) {
      showToast('Lỗi xóa chi phí: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Settings operations
  const updateSettings = async (newSettings) => {
    setIsLoading(true);
    try {
      await sheetsAPI.updateSheetRow(spreadsheetId, 'Settings', 2, ['currency', newSettings.currency]);
      await sheetsAPI.updateSheetRow(spreadsheetId, 'Settings', 3, ['tripName', newSettings.tripName]);
      await sheetsAPI.updateSheetRow(spreadsheetId, 'Settings', 4, ['startDate', newSettings.startDate]);

      setSettings(newSettings);
      showToast('Đã cập nhật cài đặt!', 'success');
    } catch (error) {
      showToast('Lỗi cập nhật cài đặt: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect
  const disconnectGoogle = () => {
    sheetsAPI.revokeAccessToken();
    setIsAuthenticated(false);
    setSpreadsheetId('');
    setMembers([]);
    setExpenses([]);
    setSettings(null);
    localStorage.removeItem('spreadsheetId');
    localStorage.removeItem('googleClientId');
    showToast('Đã ngắt kết nối!', 'info');
  };

  // Context value
  const contextValue = {
    members,
    expenses,
    settings,
    spreadsheetId,
    isLoading,
    lastSynced,
    darkMode,
    setDarkMode,
    addMember,
    updateMember,
    deleteMember,
    addExpense,
    updateExpense,
    deleteExpense,
    updateSettings,
    fetchData,
    disconnectGoogle,
    showToast,
    // Add new properties for Settings tab
    isAuthenticated,
    handleSetupComplete,
    handleSpreadsheetSelect,
    sheetsAPI,
  };

  // Main app tabs
  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: PieChart },
    { id: 'members', label: 'Thành viên', icon: Users },
    { id: 'expenses', label: 'Chi phí', icon: DollarSign },
    { id: 'settlement', label: 'Thanh toán', icon: TrendingUp },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {settings?.tripName || 'Travel Expense Manager'}
                  </h1>
                  {lastSynced && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Đồng bộ lần cuối: {lastSynced.toLocaleTimeString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchData}
                  disabled={isLoading}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Làm mới dữ liệu"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Chuyển đổi chế độ"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex gap-1 mt-4 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'members' && <MembersTab />}
          {activeTab === 'expenses' && <ExpensesTab />}
          {activeTab === 'settlement' && <SettlementTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {isAuthenticated ? 'Đã kết nối' : 'Chưa kết nối'}
                </span>
                {spreadsheetId && (
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Xem Spreadsheet
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div>
                Travel Expense Manager v1.0 - Powered by Google Sheets
              </div>
            </div>
          </div>
        </footer>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;
