
import React, { useState, useRef } from 'react';
import { AppState, Product, Transaction, TransactionType, PaymentStatus } from '../types';
import { formatPKR, printInvoice } from '../services/utils';
import { toPng } from 'html-to-image';

interface Props {
  state: AppState;
  onAddTransaction: (t: Transaction) => void;
}

const Sales: React.FC<Props> = ({ state, onAddTransaction }) => {
  const [cart, setCart] = useState<{product: Product, qty: number, appliedPrice: number}[]>([]);
  const [partyName, setPartyName] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [saleType, setSaleType] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');
  const receiptRef = useRef<HTMLDivElement>(null);

  const addToCart = (p: Product) => {
    const price = saleType === 'RETAIL' ? p.retailPrice : p.wholesalePrice;
    
    const existing = cart.find(item => item.product.id === p.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === p.id ? { ...item, qty: item.qty + 1, appliedPrice: price } : item));
    } else {
      setCart([...cart, { product: p, qty: 1, appliedPrice: price }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.product.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.appliedPrice * item.qty), 0);

  const handleSaleTypeChange = (type: 'RETAIL' | 'WHOLESALE') => {
    setSaleType(type);
    setCart(cart.map(item => ({
        ...item,
        appliedPrice: type === 'RETAIL' ? item.product.retailPrice : item.product.wholesalePrice
    })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Cart is empty");

    const transaction: Transaction = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      type: TransactionType.SALE,
      partyName: partyName || 'Cash Customer',
      items: cart.map(i => ({ 
        productId: i.product.id, 
        quantity: i.qty, 
        price: i.appliedPrice,
        name: i.product.name
      })),
      totalAmount: total,
      paidAmount: paidAmount,
      status: paidAmount >= total ? PaymentStatus.PAID : (paidAmount > 0 ? PaymentStatus.PARTIAL : PaymentStatus.CREDIT),
      recordedBy: state.currentUser?.name || 'System',
      saleType: saleType
    };

    onAddTransaction(transaction);
    setLastTransaction(transaction);
    
    setCart([]);
    setPartyName('');
    setPaidAmount(0);
  };

  const saveAsImage = async () => {
    if (receiptRef.current) {
      try {
        const dataUrl = await toPng(receiptRef.current, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `Invoice-${lastTransaction?.partyName.replace(/\s+/g, '-')}-${lastTransaction?.id}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Image generation failed', err);
        alert('Could not generate image. Please use Print -> Save as PDF.');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative" dir="rtl">
      <div className="lg:col-span-2 space-y-4">
        {/* Sale Type Selector */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex gap-2 w-fit">
            <button
                onClick={() => handleSaleTypeChange('RETAIL')}
                className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${
                    saleType === 'RETAIL' 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
                پرچون (Retail)
            </button>
            <button
                onClick={() => handleSaleTypeChange('WHOLESALE')}
                className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${
                    saleType === 'WHOLESALE' 
                    ? 'bg-orange-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
                ہول سیل (Wholesale)
            </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 text-right">مصنوعات منتخب کریں (Select Products)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {state.products.filter(p => p.category === 'Finished Good').length === 0 ? (
               <div className="col-span-3 text-center py-10 text-slate-400 italic">No Finished Goods available to sell.</div>
            ) : (
              state.products.filter(p => p.category === 'Finished Good').map(p => {
                  const displayPrice = saleType === 'RETAIL' ? p.retailPrice : p.wholesalePrice;
                  return (
                    <button 
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="p-3 text-right border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
                    >
                    <p className="font-bold text-slate-700 group-hover:text-blue-700">{p.name}</p>
                    <p className="text-xs text-slate-500">Stock: {p.stock}</p>
                    <p className={`text-sm font-black mt-1 ${saleType === 'RETAIL' ? 'text-green-600' : 'text-orange-600'}`}>
                        {formatPKR(displayPrice)}
                    </p>
                    </button>
                  );
              })
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 h-fit sticky top-4">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h3 className="font-black text-slate-800 text-xl">بلنگ (Checkout)</h3>
            <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${saleType === 'RETAIL' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {saleType} MODE
            </span>
        </div>
        
        <div className="space-y-4 mb-6">
          {cart.map(item => (
            <div key={item.product.id} className="flex justify-between items-center text-sm group">
              <div className="text-right">
                <p className="font-bold text-slate-700">{item.product.name}</p>
                <p className="text-slate-400">Qty: {item.qty} x {formatPKR(item.appliedPrice)}</p>
              </div>
              <div className="flex items-center gap-2">
                 <p className="font-bold text-slate-800">{formatPKR(item.qty * item.appliedPrice)}</p>
                 <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600 px-1">✕</button>
              </div>
            </div>
          ))}
          {cart.length === 0 && <p className="text-slate-400 italic text-center py-4">No items in cart</p>}
        </div>

        <div className="border-t pt-4 space-y-3 text-right">
          <input 
            placeholder="کسٹمر کا نام"
            className="w-full border p-3 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-right"
            value={partyName}
            onChange={e => setPartyName(e.target.value)}
          />
          <div className="flex justify-between items-center py-2">
            <span className="text-2xl font-black text-blue-600">{formatPKR(total)}</span>
            <span className="font-bold text-slate-500">کل رقم</span>
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-xs font-bold text-slate-400 uppercase">وصول شدہ رقم</label>
             <input 
              type="number"
              className="w-full border p-3 rounded-lg bg-green-50 text-green-800 font-bold outline-none text-right"
              value={paidAmount}
              onChange={e => setPaidAmount(Number(e.target.value))}
            />
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-100"
          >
            انوائس بنائیں
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {lastTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-8 text-center shadow-2xl flex flex-col md:flex-row gap-8 min-h-0">
            
            {/* Action Side */}
            <div className="flex-1 flex flex-col justify-center items-center order-2 md:order-1">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">
                ✓
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-1">Sale Recorded!</h2>
              <p className="text-slate-500 mb-6 text-sm">Invoice #{lastTransaction.id} has been saved.</p>
              
              <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                <button 
                  onClick={() => printInvoice(lastTransaction, state.settings)}
                  className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>🖨️</span> Print Full Invoice
                </button>
                <button 
                  onClick={saveAsImage}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  <span>🖼️</span> Save Digital Card
                </button>
                <button 
                  onClick={() => setLastTransaction(null)}
                  className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 mt-2"
                >
                  Start New Sale
                </button>
              </div>
            </div>

            {/* Digital Card Preview Side - Visible on Mobile now */}
            <div className="w-full md:w-[400px] shrink-0 mx-auto order-1 md:order-2 flex flex-col items-center">
                <p className="text-white/60 uppercase tracking-widest text-[10px] font-bold mb-3">Preview</p>
                <div className="bg-white w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 text-left relative group" ref={receiptRef}>
                    {/* Decorative Header */}
                    <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-full mix-blend-overlay filter blur-xl opacity-50 translate-x-10 -translate-y-10"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <h3 className="font-black text-xl uppercase tracking-tight">{state.settings.brandName}</h3>
                                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">{state.settings.brandAddress}</p>
                                <p className="text-[10px] text-blue-400 font-bold mt-1">{state.settings.brandPhone}</p>
                            </div>
                            {state.settings.brandLogo ? (
                                <img src={state.settings.brandLogo} alt="Logo" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />
                            ) : (
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black">O</div>
                            )}
                        </div>
                    </div>

                    {/* Bill Details */}
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Billed To</p>
                                <p className="font-bold text-slate-800">{lastTransaction.partyName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Invoice</p>
                                <p className="font-bold text-slate-800">#{lastTransaction.id}</p>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-3 mb-6">
                            {lastTransaction.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm border-b border-dashed border-slate-100 pb-2">
                                    <div>
                                        <p className="font-bold text-slate-700">{item.name}</p>
                                        <p className="text-[10px] text-slate-400">Qty: {item.quantity} x {item.price}</p>
                                    </div>
                                    <p className="font-bold text-slate-800">{formatPKR(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Subtotal</span>
                                <span>{formatPKR(lastTransaction.totalAmount)}</span>
                            </div>
                             <div className="flex justify-between text-xs text-green-600 font-bold">
                                <span>Paid</span>
                                <span>{formatPKR(lastTransaction.paidAmount)}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between font-black text-slate-800 text-lg">
                                <span>Total</span>
                                <span>{formatPKR(lastTransaction.totalAmount)}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-[10px] text-slate-400">Thank you for your business!</p>
                            <div className="mt-2 text-[8px] text-slate-300 uppercase tracking-widest">Generated by Orina ERP</div>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
