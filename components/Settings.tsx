
import React, { useState } from 'react';
import { AppState } from '../types';
import { exportToJSON } from '../services/storage';

interface Props {
  state: AppState;
  onUpdateSettings: (settings: AppState['settings']) => void;
  onImportData: (data: AppState) => void;
}

const Settings: React.FC<Props> = ({ state, onUpdateSettings, onImportData }) => {
  const [settings, setSettings] = useState(state.settings);

  const handleSave = () => {
    onUpdateSettings(settings);
    alert('Settings updated locally!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // Limit to 500KB
        alert("Image is too large. Please use an image under 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, brandLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.currentUser !== undefined && json.products) {
          onImportData(json);
          alert('Data restored successfully!');
        } else {
          alert('Invalid backup file.');
        }
      } catch (err) {
        alert('Error parsing file.');
      }
    };
    reader.readAsText(file);
  };

  const isRTL = settings.language === 'URDU';

  return (
    <div className={`max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isRTL ? 'text-right' : 'text-left'}`}>
      <header>
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">System Settings</h2>
        <p className="text-slate-500 font-medium italic">Configure your language, brand identity, and backups.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Brand Profile */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">🏢</div>
             <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Company Info</h3>
          </div>
          
          <div className="space-y-4">
            {/* Language Selector */}
             <div className="flex flex-col gap-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Application Language (زبان)</label>
              <select 
                value={settings.language}
                onChange={e => setSettings({...settings, language: e.target.value as 'URDU' | 'ENGLISH'})}
                className="bg-white border-2 border-blue-200 focus:border-blue-500 p-3 rounded-2xl outline-none transition-all font-bold text-slate-800"
              >
                <option value="URDU">اردو (Urdu) - Right to Left</option>
                <option value="ENGLISH">English - Left to Right</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logo</label>
              <div className="flex items-center gap-4">
                {settings.brandLogo && (
                    <img src={settings.brandLogo} alt="Logo" className="w-16 h-16 object-contain border rounded-lg" />
                )}
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Name</label>
              <input 
                value={settings.brandName}
                onChange={e => setSettings({...settings, brandName: e.target.value})}
                className={`bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-3 rounded-2xl outline-none transition-all font-bold text-slate-800 ${isRTL ? 'text-right' : 'text-left'}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
              <input 
                value={settings.brandPhone || ''}
                onChange={e => setSettings({...settings, brandPhone: e.target.value})}
                placeholder="0300-1234567"
                className={`bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-3 rounded-2xl outline-none transition-all font-bold text-slate-800 ${isRTL ? 'text-right' : 'text-left'}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
              <textarea 
                value={settings.brandAddress || ''}
                onChange={e => setSettings({...settings, brandAddress: e.target.value})}
                className={`bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-3 rounded-2xl outline-none transition-all font-bold text-slate-800 ${isRTL ? 'text-right' : 'text-left'}`}
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Currency</label>
              <select 
                value={settings.currency}
                onChange={e => setSettings({...settings, currency: e.target.value})}
                className="bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-3 rounded-2xl outline-none transition-all font-bold text-slate-800"
              >
                <option value="PKR">PKR - Pakistani Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition active:scale-95"
            >
              Save Settings
            </button>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
             <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">💾</div>
             <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Data Vault</h3>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
               <p className="text-[10px] text-amber-700 font-bold uppercase mb-1">Backup Warning</p>
               <p className="text-xs text-amber-800 leading-relaxed font-bold">Please backup your data regularly. In an offline environment, this file is your only recovery method if the device fails.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => exportToJSON(state)}
                className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition"
              >
                <span>Download Backup</span>
                <span className="text-xl">📥</span>
              </button>

              <label className="flex items-center justify-between p-4 border-2 border-dashed border-slate-200 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-50 hover:border-blue-300 cursor-pointer transition">
                <span>Restore Backup</span>
                <span className="text-xl">📤</span>
                <input type="file" accept=".json" onChange={handleBackupUpload} className="hidden" />
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
