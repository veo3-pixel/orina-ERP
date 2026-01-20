
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, validate with backend. Here we simulate enterprise roles.
    const role = username.toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.STAFF;
    onLogin({
      id: Math.random().toString(),
      name: username.toUpperCase(),
      username: username,
      role: role
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-4">O</div>
           <h1 className="text-2xl font-black text-slate-800">Orina Brand ERP</h1>
           <p className="text-slate-400 mt-2">Enterprise Business Management System</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Username</label>
            <input 
              required
              className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-blue-500 outline-none transition"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. admin"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Password</label>
            <input 
              required
              type="password"
              className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-blue-500 outline-none transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition transform active:scale-95 shadow-xl shadow-blue-100">
            Secure Login
          </button>
        </form>
        
        <p className="text-center text-slate-400 text-sm mt-8">
          Powered by Orina Brand Operations
        </p>
      </div>
    </div>
  );
};

export default Auth;
