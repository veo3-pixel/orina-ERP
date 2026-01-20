
import React, { useState, useMemo } from 'react';
import { AppState, Transaction, TransactionType, Expense } from '../types';
import { formatPKR, printInvoice, printReport } from '../services/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  state: AppState;
  onAddExpense: (e: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onDeleteTransaction: (id: string) => void;
}

type TimeRange = 'DAILY' | 'WEEKLY' | 'MONTHLY';
type ReportTab = 'SALES' | 'EXPENSES';

const Reports: React.FC<Props> = ({ state, onAddExpense, onDeleteExpense, onDeleteTransaction }) => {
  const [range, setRange] = useState<TimeRange>('DAILY');
  const [activeTab, setActiveTab] = useState<ReportTab>('SALES');
  
  // Expense Form State
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
      category: 'Utilities',
      date: new Date().toISOString().split('T')[0]
  });

  // Helper to calculate cost of a transaction based on current product costs
  const getTransactionCost = (t: Transaction) => {
    return t.items.reduce((total, item) => {
      const product = state.products.find(p => p.id === item.productId);
      const cost = product?.category === 'Finished Good' 
        ? (state.formulations.find(f => f.productId === product.id)?.ingredients.reduce((sum, ing) => {
            const raw = state.products.find(p => p.id === ing.itemId);
            return sum + (raw?.costPrice || 0) * ing.quantity;
          }, 0) || 0)
        : (product?.costPrice || 0);
      return total + (cost * item.quantity);
    }, 0);
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filteredTransactions: Transaction[] = [];
    let filteredExpenses: Expense[] = [];

    const dateFilter = (dateStr: string) => {
        const d = new Date(dateStr);
        if (range === 'DAILY') return d >= startOfDay;
        if (range === 'WEEKLY') {
            const week = new Date(now); week.setDate(now.getDate() - 7);
            return d >= week;
        }
        if (range === 'MONTHLY') {
            const month = new Date(now.getFullYear(), now.getMonth(), 1);
            return d >= month;
        }
        return true;
    };

    filteredTransactions = state.transactions.filter(t => dateFilter(t.date));
    filteredExpenses = state.expenses.filter(e => dateFilter(e.date));

    // Sales calculations
    const salesOnly = filteredTransactions.filter(t => t.type === TransactionType.SALE);
    const totalSales = salesOnly.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalCost = salesOnly.reduce((sum, t) => sum + getTransactionCost(t), 0);
    const grossProfit = totalSales - totalCost;
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    return { 
        transactions: salesOnly, 
        expensesList: filteredExpenses,
        totalSales, 
        totalCost, 
        grossProfit, 
        totalExpenses, 
        netProfit 
    };
  }, [state, range]);

  const handleSaveExpense = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newExpense.amount || !newExpense.category) return;
      
      const expense: Expense = {
          id: `EXP-${Date.now()}`,
          date: new Date(newExpense.date || Date.now()).toISOString(),
          category: newExpense.category || 'General',
          amount: Number(newExpense.amount),
          description: newExpense.description || ''
      };
      
      onAddExpense(expense);
      setShowExpenseForm(false);
      setNewExpense({ category: 'Utilities', date: new Date().toISOString().split('T')[0], amount: 0, description: '' });
  };

  const chartData = [
    { name: 'Revenue', amount: filteredData.totalSales, fill: '#3b82f6' },
    { name: 'Cost', amount: filteredData.totalCost, fill: '#f97316' },
    { name: 'Expense', amount: filteredData.totalExpenses, fill: '#ef4444' },
    { name: 'Profit', amount: filteredData.netProfit, fill: '#22c55e' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">مالیاتی رپورٹس (Finance)</h2>
          <p className="text-slate-500 text-sm font-medium">سیلز، اخراجات اور منافع کا مکمل ریکارڈ</p>
        </div>
        
        <div className="flex gap-4">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {(['SALES', 'EXPENSES'] as const).map((t) => (
                <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all uppercase tracking-wider ${
                    activeTab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                >
                {t === 'SALES' ? 'سیلز رپورٹ' : 'اخراجات (Expenses)'}
                </button>
            ))}
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((r) => (
                <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all uppercase tracking-wider ${
                    range === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                >
                {r === 'DAILY' ? 'آج' : r === 'WEEKLY' ? 'ہفتہ' : 'مہینہ'}
                </button>
            ))}
            </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg shadow-blue-200">
          <p className="text-[10px] uppercase tracking-widest opacity-80 font-black">کل سیل (Sales)</p>
          <h3 className="text-2xl font-black mt-1">{formatPKR(filteredData.totalSales)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">پیداواری لاگت</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1">{formatPKR(filteredData.totalCost)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">اخراجات (Expenses)</p>
          <h3 className="text-2xl font-black text-red-500 mt-1">{formatPKR(filteredData.totalExpenses)}</h3>
        </div>
        <div className={`p-6 rounded-3xl shadow-lg border-2 ${filteredData.netProfit >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <p className={`text-[10px] uppercase tracking-widest font-black ${filteredData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>خالص منافع</p>
          <h3 className={`text-2xl font-black mt-1 ${filteredData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatPKR(filteredData.netProfit)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} width={60} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px'}} />
              <Bar dataKey="amount" radius={[0, 10, 10, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic Content based on Tab */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-80">
          
          {/* SALES TAB CONTENT */}
          {activeTab === 'SALES' && (
              <>
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">سیلز ہسٹری</h3>
                    <div className="flex gap-2">
                        <button onClick={() => printReport(filteredData.transactions, filteredData, range)} className="text-[10px] font-black bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition flex items-center gap-1">
                        <span>🖨️</span> Print Report
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto p-0">
                    <table className="w-full text-right">
                    <thead className="bg-slate-50 sticky top-0">
                        <tr>
                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">انوائس</th>
                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">پارٹی</th>
                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">رقم</th>
                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">پرنٹ / ایکشن</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredData.transactions.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-3 text-xs font-bold text-slate-500">{t.id}</td>
                                <td className="px-6 py-3 text-xs font-bold text-slate-800">{t.partyName}</td>
                                <td className="px-6 py-3 text-xs font-black text-blue-600">{formatPKR(t.totalAmount)}</td>
                                <td className="px-6 py-3 flex gap-2 justify-end items-center">
                                    <button 
                                      onClick={() => printInvoice(t, state.settings)} 
                                      className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black transition flex items-center gap-1"
                                    >
                                      🖨️ Print Invoice
                                    </button>
                                    <button onClick={() => onDeleteTransaction(t.id)} className="text-red-300 hover:text-red-600 font-bold px-2" title="Delete Invoice">✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                    {filteredData.transactions.length === 0 && <div className="p-8 text-center text-slate-400 text-xs italic">کوئی ریکارڈ موجود نہیں</div>}
                </div>
              </>
          )}

          {/* EXPENSES TAB CONTENT */}
          {activeTab === 'EXPENSES' && (
              <>
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">اخراجات کی تفصیل</h3>
                    <button onClick={() => setShowExpenseForm(true)} className="text-[10px] font-black bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition">
                        + نیا خرچہ شامل کریں
                    </button>
                </div>
                <div className="overflow-y-auto p-0">
                    <table className="w-full text-right">
                    <thead className="bg-slate-50 sticky top-0">
                        <tr>
                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">تاریخ</th>
                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">مد (Category)</th>
                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">تفصیل</th>
                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">رقم</th>
                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase">ختم</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredData.expensesList.map(e => (
                            <tr key={e.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-3 text-xs text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                                <td className="px-6 py-3 text-xs font-bold text-slate-800">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-[10px] uppercase">{e.category}</span>
                                </td>
                                <td className="px-6 py-3 text-xs text-slate-600">{e.description}</td>
                                <td className="px-6 py-3 text-xs font-black text-red-500">{formatPKR(e.amount)}</td>
                                <td className="px-6 py-3">
                                    <button onClick={() => onDeleteExpense(e.id)} className="text-red-300 hover:text-red-600 font-bold px-2">✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                    {filteredData.expensesList.length === 0 && <div className="p-8 text-center text-slate-400 text-xs italic">کوئی خرچہ ریکارڈ نہیں ہوا۔</div>}
                </div>
              </>
          )}

        </div>
      </div>

      {/* Expense Modal */}
      {showExpenseForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <form onSubmit={handleSaveExpense} className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-right">
                  <h3 className="font-black text-slate-800 text-lg">نیا خرچہ درج کریں</h3>
                  
                  <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">تاریخ</label>
                      <input type="date" required value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="border p-2 rounded-xl text-right" />
                  </div>

                  <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">کیٹیگری</label>
                      <select className="border p-2 rounded-xl text-right bg-white" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                          <option value="Utilities">Utilities (بجلی/پانی)</option>
                          <option value="Rent">Rent (کرایہ)</option>
                          <option value="Salaries">Salaries (تنخواہیں)</option>
                          <option value="Maintenance">Maintenance (مرمت)</option>
                          <option value="Marketing">Marketing (اشتہارات)</option>
                          <option value="Other">Other (دیگر)</option>
                      </select>
                  </div>

                  <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">رقم (Amount)</label>
                      <input type="number" required placeholder="0" value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} className="border p-2 rounded-xl text-right" />
                  </div>

                  <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">تفصیل</label>
                      <textarea placeholder="خرچے کی تفصیل..." value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="border p-2 rounded-xl text-right" rows={2} />
                  </div>

                  <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setShowExpenseForm(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">کینسل</button>
                      <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700">محفوظ کریں</button>
                  </div>
              </form>
          </div>
      )}

    </div>
  );
};

export default Reports;
