
import React from 'react';
import { AppState, TransactionType } from '../types';
import { formatPKR } from '../services/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface Props {
  state: AppState;
}

const Dashboard: React.FC<Props> = ({ state }) => {
  const isOnline = navigator.onLine;

  const totalSales = state.transactions
    .filter(t => t.type === TransactionType.SALE)
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalPurchases = state.transactions
    .filter(t => t.type === TransactionType.PURCHASE)
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalPurchases - totalExpenses;

  const chartData = [
    { name: 'Sales', value: totalSales },
    { name: 'Purchases', value: totalPurchases },
    { name: 'Expenses', value: totalExpenses },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Operational Overview</h1>
          <p className="text-slate-500 font-medium">Enterprise Management • Orina Brand Vault</p>
        </div>
        <div className="flex items-center gap-3">
          {!isOnline && (
            <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-2">
               <span className="text-[10px] font-black uppercase tracking-widest">Offline Workspace</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
             <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
               {isOnline ? 'Cloud Synced' : 'Local Storage Only'}
             </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Revenue" value={totalSales} color="text-blue-600" />
        <Card title="Inventory Value" value={totalPurchases} color="text-orange-600" />
        <Card title="Operating Costs" value={totalExpenses} color="text-red-600" />
        <Card title="Net Earnings" value={netProfit} color={netProfit >= 0 ? "text-green-600" : "text-red-600"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-[400px]">
          <h4 className="text-slate-800 font-black mb-6 uppercase text-[10px] tracking-[0.2em]">Financial Performance Data</h4>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} 
              />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                formatter={(value: number) => [formatPKR(value), '']}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-slate-800 font-black mb-6 uppercase text-[10px] tracking-[0.2em]">Critical Reorder List</h4>
          <div className="space-y-4">
            {state.products.filter(p => p.stock <= p.minStockAlert).slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-red-50 transition-colors">
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-red-700">{p.name}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-600 font-black">{p.stock}</p>
                  <p className="text-[9px] text-red-400 font-black uppercase tracking-tighter">Units Left</p>
                </div>
              </div>
            ))}
            {state.products.filter(p => p.stock <= p.minStockAlert).length === 0 && (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-xl mb-4">✓</div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Inventory Fully Stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, color }: { title: string, value: number, color: string }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all group cursor-default">
    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2 group-hover:text-blue-500 transition-colors">{title}</p>
    <h3 className={`text-2xl font-black ${color} tracking-tight`}>{formatPKR(value)}</h3>
    <div className="mt-4 w-8 h-1 bg-slate-100 rounded-full group-hover:bg-blue-100 transition-colors"></div>
  </div>
);

export default Dashboard;
