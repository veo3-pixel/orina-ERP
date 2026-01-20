
import React, { useState } from 'react';
import { AppState, Formulation, Product } from '../types';
import { formatPKR, printFormulation } from '../services/utils';

interface Props {
  state: AppState;
  onSaveFormulation: (f: Formulation) => void;
}

const Formulations: React.FC<Props> = ({ state, onSaveFormulation }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [ingredients, setIngredients] = useState<{ itemId: string; quantity: number }[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const finishedProducts = state.products.filter(p => p.category === 'Finished Good');
  const rawMaterials = state.products.filter(p => p.category !== 'Finished Good');

  const activeProduct = state.products.find(p => p.id === selectedProductId);
  const existingFormulation = state.formulations.find(f => f.productId === selectedProductId);

  const addIngredient = (itemId: string) => {
    if (ingredients.find(i => i.itemId === itemId)) return;
    setIngredients([...ingredients, { itemId, quantity: 1 }]);
    setShowAddIngredient(false);
  };

  const updateQty = (itemId: string, qty: number) => {
    setIngredients(ingredients.map(i => i.itemId === itemId ? { ...i, quantity: qty } : i));
  };

  const removeIngredient = (itemId: string) => {
    setIngredients(ingredients.filter(i => i.itemId !== itemId));
  };

  const addStep = () => {
    if (newStep.trim()) {
      setSteps([...steps, newStep.trim()]);
      setNewStep('');
    }
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const calculateTotalCost = () => {
    return ingredients.reduce((sum, ing) => {
      const material = state.products.find(p => p.id === ing.itemId);
      return sum + (material?.costPrice || 0) * ing.quantity;
    }, 0);
  };

  const handleSave = () => {
    if (!selectedProductId || ingredients.length === 0) {
      alert("براہ کرم پراڈکٹ منتخب کریں اور اجزاء شامل کریں۔");
      return;
    }
    const formulation: Formulation = {
      id: existingFormulation?.id || `FORM-${Date.now()}`,
      productId: selectedProductId,
      ingredients: ingredients,
      instructions: steps
    };
    onSaveFormulation(formulation);
    alert('فارمولیشن محفوظ کر لی گئی ہے!');
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
    const existing = state.formulations.find(f => f.productId === id);
    if (existing) {
      setIngredients(existing.ingredients);
      setSteps(existing.instructions || []);
    } else {
      setIngredients([]);
      setSteps([]);
    }
    setIsCreating(true);
  };

  const handlePrint = () => {
      if(!activeProduct) return;
      const ingredientDetails = ingredients.map(ing => {
          const p = state.products.find(prod => prod.id === ing.itemId);
          return { name: p?.name || 'Unknown', qty: ing.quantity, unit: 'Units' };
      });
      printFormulation(
          { id: '', productId: selectedProductId, ingredients, instructions: steps }, 
          activeProduct.name, 
          ingredientDetails, 
          state.settings
      );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">فارمولیشن بک (Recipe Book)</h2>
          <p className="text-slate-500 font-medium italic">اجزاء اور تیاری کے مراحل (Step-by-Step) یہاں درج کریں۔</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-fit">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">تیار پراڈکٹس</label>
            <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded-lg">کل: {finishedProducts.length}</span>
          </div>
          
          <div className="p-3 bg-blue-50/50 rounded-xl mb-4 text-xs text-slate-600 leading-relaxed border border-blue-100">
             <strong>نئی فارمولیشن کیسے بنائیں؟</strong><br/>
             نیچے دی گئی لسٹ سے وہ پراڈکٹ منتخب کریں جس کی ریسیپی بنانی ہے۔ اگر پراڈکٹ لسٹ میں نہیں ہے تو پہلے <b>Inventory</b> میں جا کر اسے شامل کریں۔
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pl-2">
            {finishedProducts.length === 0 ? (
              <p className="text-slate-400 text-sm italic p-4 text-center">پہلے انوینٹری میں تیار پراڈکٹ شامل کریں۔</p>
            ) : (
              finishedProducts.map(p => {
                const hasRecipe = state.formulations.some(f => f.productId === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className={`w-full text-right p-4 rounded-2xl border-2 transition-all ${
                      selectedProductId === p.id 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase">{p.sku}</p>
                      </div>
                      {hasRecipe ? (
                        <span className="bg-green-100 text-green-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Edited</span>
                      ) : (
                        <span className="bg-slate-200 text-slate-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Create</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {isCreating && activeProduct ? (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        {activeProduct.name}
                    </h3>
                    {!state.formulations.some(f => f.productId === activeProduct.id) && (
                        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">New Recipe</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1">مکمل ریسیپی اور تیاری کا طریقہ</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-left hidden md:block">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">پیداواری لاگت</p>
                        <p className="text-xl font-black text-blue-600">{formatPKR(calculateTotalCost())}</p>
                    </div>
                    <button 
                        onClick={handlePrint}
                        className="bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 shadow-lg text-xs font-black uppercase tracking-wider"
                        title="Print Recipe Card"
                    >
                        <span>🖨️</span> Print Recipe
                    </button>
                </div>
              </div>

              {/* Ingredients Section */}
              <div className="mb-8">
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">1. اجزاء (Ingredients)</h4>
                  <div className="space-y-3">
                    {ingredients.map(ing => {
                    const mat = state.products.find(p => p.id === ing.itemId);
                    return (
                        <div key={ing.itemId} className="grid grid-cols-12 items-center bg-slate-50 p-3 rounded-xl border border-slate-100 gap-2">
                        <div className="col-span-6 text-right">
                            <p className="font-bold text-slate-800 text-sm">{mat?.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Rate: {formatPKR(mat?.costPrice || 0)}</p>
                        </div>
                        <div className="col-span-3">
                            <input 
                            type="number" 
                            step="0.001"
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-center font-bold text-sm"
                            value={ing.quantity}
                            onChange={(e) => updateQty(ing.itemId, Number(e.target.value))}
                            />
                        </div>
                        <div className="col-span-2 text-left font-black text-slate-600 text-xs">
                            {formatPKR((mat?.costPrice || 0) * ing.quantity)}
                        </div>
                        <div className="col-span-1 text-left">
                            <button onClick={() => removeIngredient(ing.itemId)} className="text-red-400 hover:text-red-600 transition font-bold">✕</button>
                        </div>
                        </div>
                    );
                    })}
                    <button onClick={() => setShowAddIngredient(true)} className="w-full border-2 border-dashed border-slate-200 rounded-xl p-3 text-slate-400 font-bold hover:bg-slate-50 hover:text-blue-500 transition text-sm">
                        + خام مال شامل کریں
                    </button>
                  </div>
              </div>

              {/* Instructions Section */}
              <div className="mb-8">
                <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">2. تیاری کا طریقہ (Steps)</h4>
                <div className="space-y-3">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                            <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">{idx + 1}</span>
                            <p className="flex-1 text-sm text-slate-700 leading-relaxed font-medium">{step}</p>
                            <button onClick={() => removeStep(idx)} className="text-red-300 hover:text-red-500 shrink-0">🗑️</button>
                        </div>
                    ))}
                    
                    <div className="flex gap-2 mt-4">
                        <input 
                            value={newStep}
                            onChange={e => setNewStep(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addStep()}
                            placeholder="اگلا مرحلہ لکھیں..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition text-sm font-medium"
                        />
                        <button onClick={addStep} className="bg-slate-200 text-slate-600 px-6 rounded-xl font-black hover:bg-slate-300 transition text-xl">+</button>
                    </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                  <button onClick={handleSave} className="w-full bg-green-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition active:scale-95">
                    پوری فارمولیشن محفوظ کریں
                  </button>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-3xl border-2 border-dashed border-slate-100 p-12 text-center">
              <span className="text-5xl mb-4">📖</span>
              <h3 className="text-slate-800 font-black text-lg mb-2">پراڈکٹ منتخب کریں</h3>
              <p className="text-slate-400 font-medium">نئی فارمولیشن بنانے کے لیے بائیں طرف لسٹ سے پراڈکٹ منتخب کریں۔<br/>اگر لسٹ خالی ہے تو پہلے <b>Inventory</b> میں پراڈکٹس شامل کریں۔</p>
            </div>
          )}
        </div>
      </div>

      {showAddIngredient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-right" dir="rtl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">مٹیریل منتخب کریں</h3>
              <button onClick={() => setShowAddIngredient(false)} className="text-slate-400 p-2">✕</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {rawMaterials.length === 0 ? (
                  <p className="text-center text-slate-400 italic p-4">کوئی خام مال موجود نہیں۔ انوینٹری میں Raw Material شامل کریں۔</p>
              ) : (
                rawMaterials.map(p => (
                    <button
                    key={p.id}
                    onClick={() => addIngredient(p.id)}
                    className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition group"
                    >
                    <div className="text-right">
                        <p className="font-bold text-slate-800 group-hover:text-blue-600">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase">{p.sku}</p>
                    </div>
                    <p className="font-black text-slate-600">{formatPKR(p.costPrice)}</p>
                    </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Formulations;
