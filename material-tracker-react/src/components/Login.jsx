import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Package } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setError('Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="flex items-center mb-8">
            <Package className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Inventory Tracker</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign in to your account</h2>
          <p className="text-gray-500 mb-8">Welcome back! Please enter your details.</p>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="user@example.com" required />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Sign In</button>
          </form>
        </div>
        <div className="hidden md:flex md:w-1/2 bg-gray-200 items-center justify-center p-12">
          <img src="/Steve Logo.png" alt="Company Logo" className="max-w-xs" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/200x200/e2e8f0/e2e8f0?text=Logo'; }} />
        </div>
      </div>
    </div>
  );
};

export default Login;