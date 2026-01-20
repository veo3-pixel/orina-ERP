
import React, { useState } from 'react';
import { AppState, Product } from '../types';
import { formatPKR } from '../services/utils';

interface Props {
  state: AppState;
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const Inventory: React.FC<Props> = ({ state, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'FINISHED' | 'RAW'>('FINISHED');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    category: 'Finished Good'
  });

  const generateSKU = (name: string, cat: string) => {
    const prefix = cat === 'Finished Good' ? 'FG' : 'RM';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  };

  const calculateCostFromFormulation = (productId: string) => {
    const formulation = state.formulations.find(f => f.productId === productId);
    if (!formulation) return 0;
    return formulation.ingredients.reduce((sum, ing) => {
      const material = state.products.find(p => p.id === ing.itemId);
      return sum + (material?.costPrice || 0) * ing.quantity;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name || 'Unnamed Item';
    const category = activeTab === 'FINISHED' ? 'Finished Good' : 'Raw Material';
    
    // Ensure numbers are treated as numbers (handling decimals for cost)
    const stockVal = formData.stock !== undefined ? Number(formData.stock) : 0;
    const minStockVal = formData.minStockAlert !== undefined ? Number(formData.minStockAlert) : 5;
    const costVal = formData.costPrice !== undefined ? Number(formData.costPrice) : 0;
    const retailVal = formData.retailPrice !== undefined ? Number(formData.retailPrice) : 0;
    const wholesaleVal = formData.wholesalePrice !== undefined ? Number(formData.wholesalePrice) : 0;

    if (isEditing && formData.id) {
        const updatedProduct: Product = {
            ...state.products.find(p => p.id === formData.id)!,
            name: name,
            sku: formData.sku || generateSKU(name, category),
            stock: stockVal,
            minStockAlert: minStockVal,
            costPrice: activeTab === 'RAW' ? costVal : 0,
            retailPrice: activeTab === 'FINISHED' ? retailVal : 0,
            wholesalePrice: activeTab === 'FINISHED' ? wholesaleVal : 0,
            category: category,
            lastUpdated: new Date().toISOString(),
        };
        onUpdateProduct(updatedProduct);
    } else {
        const newProduct: Product = {
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            sku: formData.sku || generateSKU(name, category),
            stock: stockVal,
            minStockAlert: minStockVal,
            costPrice: activeTab === 'RAW' ? costVal : 0,
            retailPrice: activeTab === 'FINISHED' ? retailVal : 0,
            wholesalePrice: activeTab === 'FINISHED' ? wholesaleVal : 0,
            category: category,
            lastUpdated: new Date().toISOString(),
        };
        onAddProduct(newProduct);
    }
    
    setShowForm(false);
    setIsEditing(false);
    setFormData({});
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setActiveTab(product.category === 'Finished Good' ? 'FINISHED' : 'RAW');
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredProducts = state.products.filter(p => 
    activeTab === 'FINISHED' ? p.category === 'Finished Good' : p.category !== 'Finished Good'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">انونٹری مینجمنٹ (Inventory)</h2>
          <p className="text-slate-500 text-sm font-medium">اپنے اسٹاک اور آئٹمز کو یہاں مینیج کریں۔</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setIsEditing(false); setFormData({}); }}
          className={`px-6 py-3 rounded-2xl font-black transition-all shadow-lg ${
            showForm 
            ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' 
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
          }`}
        >
          {showForm ? 'کینسل کریں' : '+ نیا آئٹم شامل کریں'}
        </button>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mr-0 ml-auto">
        <button 
          onClick={() => { setActiveTab('FINISHED'); setIsEditing(false); setShowForm(false); }}
          className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'FINISHED' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
        >
          تیار شدہ مال (Finished Goods)
        </button>
        <button 
          onClick={() => { setActiveTab('RAW'); setIsEditing(false); setShowForm(false); }}
          className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'RAW' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
        >
          خام مال / پیکنگ (Raw Materials)
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative overflow-hidden">
          {isEditing && <div className="absolute top-0 left-0 bg-yellow-400 text-black text-[10px] font-black px-4 py-1 rounded-br-xl uppercase">Editing Mode</div>}
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">آئٹم کا نام *</label>
            <input required value={formData.name || ''} className="bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-3 rounded-xl outline-none transition-all font-bold text-right" type="text" onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU (خودکار)</label>
            <input value={formData.sku || ''} placeholder="خالی چھوڑ دیں" className="bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-3 rounded-xl outline-none transition-all font-bold text-right" type="text" onChange={e => setFormData({...formData, sku: e.target.value})} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">موجودہ اسٹاک</label>
            <input required value={formData.stock !== undefined ? formData.stock : ''} className="bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-3 rounded-xl outline-none transition-all font-bold text-right" type="number" onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
          </div>

          {activeTab === 'RAW' ? (
            <div className="flex flex-col gap-2 lg:col-span-1 bg-blue-50 p-2 rounded-xl border border-blue-100">
              <label className="text-xs font-black text-blue-600 uppercase tracking-widest">خریداری قیمت (Cost Price) *</label>
              <input 
                required 
                value={formData.costPrice !== undefined ? formData.costPrice : ''} 
                className="bg-white border-2 border-blue-200 focus:border-blue-500 focus:bg-white p-3 rounded-xl outline-none transition-all font-black text-blue-700 text-right text-lg" 
                type="number" 
                step="0.01" // Allow decimals
                placeholder="0.00"
                onChange={e => setFormData({...formData, costPrice: e.target.valueAsNumber})} 
              />
              <p className="text-[9px] text-blue-400 font-bold mt-1">یہ قیمت فارمولیشن کی لاگت نکالنے میں استعمال ہوگی۔</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ریٹیل قیمت (Retail)</label>
                <input required value={formData.retailPrice !== undefined ? formData.retailPrice : ''} className="bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-3 rounded-xl outline-none transition-all font-bold text-green-600 text-right" type="number" onChange={e => setFormData({...formData, retailPrice: Number(e.target.value)})} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ہول سیل قیمت (Wholesale)</label>
                <input required value={formData.wholesalePrice !== undefined ? formData.wholesalePrice : ''} className="bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-3 rounded-xl outline-none transition-all font-bold text-orange-600 text-right" type="number" onChange={e => setFormData({...formData, wholesalePrice: Number(e.target.value)})} />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">کم از کم اسٹاک الرٹ</label>
            <input value={formData.minStockAlert !== undefined ? formData.minStockAlert : 5} className="bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-3 rounded-xl outline-none transition-all font-bold text-right" type="number" placeholder="5" onChange={e => setFormData({...formData, minStockAlert: Number(e.target.value)})} />
          </div>

          <div className="lg:col-span-3 flex justify-start mt-4">
            <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition">
              {isEditing ? 'اپ ڈیٹ کریں' : 'محفوظ کریں'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">آئٹم کی تفصیل</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">اسٹاک</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">قیمت (PKR)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ایکشن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">کوئی آئٹم موجود نہیں ہے۔</td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const currentCost = product.category === 'Finished Good' 
                    ? calculateCostFromFormulation(product.id) 
                    : product.costPrice;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-800 text-sm">{product.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{product.sku}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-sm font-black ${product.stock <= product.minStockAlert ? 'text-red-600' : 'text-slate-700'}`}>
                          {product.stock} یونٹس
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs">
                          {activeTab === 'RAW' ? (
                              <p className="text-blue-600 font-black text-sm bg-blue-50 px-2 py-1 rounded w-fit">Cost: {formatPKR(currentCost)}</p>
                          ) : (
                             <>
                                <p className="text-slate-400 font-bold text-[9px]">Production Cost: {formatPKR(currentCost)}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-green-600 font-black text-[10px] bg-green-50 px-1.5 py-0.5 rounded">R: {formatPKR(product.retailPrice)}</span>
                                    <span className="text-orange-600 font-black text-[10px] bg-orange-50 px-1.5 py-0.5 rounded">W: {formatPKR(product.wholesalePrice)}</span>
                                </div>
                             </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleEdit(product)}
                                className="bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg text-xs font-black transition"
                                title="Edit Price"
                            >
                                ✎
                            </button>
                            <button 
                                onClick={() => onDeleteProduct(product.id)}
                                className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-2 rounded-lg text-xs font-black transition"
                                title="Delete Item"
                            >
                                ✕
                            </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
