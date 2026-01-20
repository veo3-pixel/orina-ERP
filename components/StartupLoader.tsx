
import React, { useState, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

const StartupLoader: React.FC<Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing Vault...');

  useEffect(() => {
    const steps = [
      { p: 20, s: 'Loading Offline Database...' },
      { p: 45, s: 'Caching Brand Assets...' },
      { p: 70, s: 'Checking Sync Status...' },
      { p: 100, s: 'Ready for Business' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p);
        setStatus(steps[currentStep].s);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-8">
      <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white font-black text-5xl mb-8 shadow-2xl shadow-blue-500/20 animate-bounce">
        O
      </div>
      <div className="w-full max-w-xs bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">
        {status}
      </p>
      
      <div className="mt-12 text-center">
        <h2 className="text-white font-black text-xl mb-2">Orina Brand ERP</h2>
        <p className="text-slate-500 text-sm max-w-[200px]">Enterprise Grade Performance, even without internet.</p>
      </div>
    </div>
  );
};

export default StartupLoader;
