
import React, { useState, useEffect } from 'react';
import { AppState, Product, Transaction, UserRole, Formulation, Expense } from './types';
import { loadState, saveState } from './services/storage';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Formulations from './components/Formulations';
import StartupLoader from './components/StartupLoader';
import Settings from './components/Settings';
import Reports from './components/Reports';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF] },
  { id: 'sales', label: 'Point of Sale', icon: '💰', roles: [UserRole.ADMIN, UserRole.STAFF] },
  { id: 'inventory', label: 'Stock & Inventory', icon: '📦', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { id: 'formulation', label: 'Formulations', icon: '🧪', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { id: 'reports', label: 'Finance & Reports', icon: '📑', roles: [UserRole.ADMIN] },
  { id: 'settings', label: 'Settings', icon: '⚙️', roles: [UserRole.ADMIN] },
];

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync Direction (RTL/LTR) based on Language
  useEffect(() => {
    const dir = state.settings.language === 'ENGLISH' ? 'ltr' : 'rtl';
    document.documentElement.dir = dir;
    document.documentElement.lang = state.settings.language === 'ENGLISH' ? 'en' : 'ur';
  }, [state.settings.language]);

  useEffect(() => {
    if (isLoaded) {
      saveState(state);
    }
  }, [state, isLoaded]);

  if (!isLoaded) {
    return <StartupLoader onComplete={() => setIsLoaded(true)} />;
  }

  // --- Actions ---

  const addProduct = (product: Product) => {
    setState(prev => ({ ...prev, products: [...prev.products, product] }));
  };

  const updateProduct = (updated: Product) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === updated.id ? updated : p)
    }));
  };

  const deleteProduct = (id: string) => {
    if(window.confirm('کیا آپ واقعی اس آئٹم کو ڈیلیٹ کرنا چاہتے ہیں؟')){
        setState(prev => ({
            ...prev,
            products: prev.products.filter(p => p.id !== id)
        }));
    }
  };

  const saveFormulation = (formulation: Formulation) => {
    setState(prev => {
      const exists = prev.formulations.findIndex(f => f.productId === formulation.productId);
      const newForms = [...prev.formulations];
      if (exists >= 0) {
        newForms[exists] = formulation;
      } else {
        newForms.push(formulation);
      }
      return { ...prev, formulations: newForms };
    });
  };

  const updateSettings = (settings: AppState['settings']) => {
    setState(prev => ({ ...prev, settings }));
  };

  const importData = (data: AppState) => {
    setState(data);
  };

  const addTransaction = (transaction: Transaction) => {
    const newProducts = state.products.map(p => {
      const soldItem = transaction.items.find(i => i.productId === p.id);
      if (soldItem) {
        return { ...p, stock: p.stock - soldItem.quantity };
      }
      return p;
    });

    setState(prev => ({ 
      ...prev, 
      products: newProducts,
      transactions: [transaction, ...prev.transactions] 
    }));
    setActiveTab('dashboard');
  };

  const deleteTransaction = (id: string) => {
      if(window.confirm('کیا آپ اس انوائس کو سسٹم سے ہٹانا چاہتے ہیں؟ (اسٹاک واپس نہیں ہوگا)')){
        setState(prev => ({
            ...prev,
            transactions: prev.transactions.filter(t => t.id !== id)
        }));
      }
  };

  const addExpense = (expense: Expense) => {
      setState(prev => ({
          ...prev,
          expenses: [expense, ...prev.expenses]
      }));
  };

  const deleteExpense = (id: string) => {
      if(window.confirm('کیا آپ اس خرچے کو ڈیلیٹ کرنا چاہتے ہیں؟')){
        setState(prev => ({
            ...prev,
            expenses: prev.expenses.filter(e => e.id !== id)
        }));
      }
  };

  // --- Rendering ---

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard state={state} />;
      case 'inventory':
        return <Inventory state={state} onAddProduct={addProduct} onUpdateProduct={updateProduct} onDeleteProduct={deleteProduct} />;
      case 'sales':
        return <Sales state={state} onAddTransaction={addTransaction} />;
      case 'formulation':
        return <Formulations state={state} onSaveFormulation={saveFormulation} />;
      case 'settings':
        return <Settings state={state} onUpdateSettings={updateSettings} onImportData={importData} />;
      case 'reports':
        return <Reports state={state} onAddExpense={addExpense} onDeleteExpense={deleteExpense} onDeleteTransaction={deleteTransaction} />;
      default:
        return null;
    }
  };

  const currentUser = state.currentUser || { name: 'Admin', role: UserRole.ADMIN };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Fixed on Mobile, Relative on Desktop */}
      <aside className={`
        fixed inset-0 z-40 bg-slate-900 border-r border-slate-800 transition-transform duration-300 md:relative md:translate-x-0 md:w-64 lg:w-72 shrink-0 flex flex-col pt-safe pb-safe
        ${sidebarOpen ? 'translate-x-0' : (state.settings.language === 'ENGLISH' ? '-translate-x-full' : 'translate-x-full md:translate-x-0')}
      `}>
        {/* Sidebar Header */}
        <div className="p-8 border-b border-slate-800 flex items-center gap-3 text-white shrink-0">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">O</div>
             <div className="leading-tight">
                <span className="block text-xl font-black tracking-tight">{state.settings.brandName.split(' ')[0]}</span>
                <span className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase">Operations</span>
             </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {NAV_ITEMS.filter(i => i.roles.includes(currentUser.role)).map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 bg-slate-800/50 space-y-4 shrink-0 text-white">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-black shadow-inner">
                {currentUser.name[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                   <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{isOnline ? 'Online' : 'Offline Mode'}</p>
                </div>
              </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area (Scrollable) */}
      <main className="flex-1 overflow-y-auto relative w-full h-full bg-slate-50 pt-safe">
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full pb-safe-24">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Sidebar Toggle Button */}
      <div className={`md:hidden fixed bottom-safe-6 z-50 ${state.settings.language === 'ENGLISH' ? 'right-6' : 'left-6'}`}>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transform active:scale-90 transition-transform duration-300"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;
