import React, { useState } from 'react';
import { Mail, Lock, Box, Truck, LineChart } from 'lucide-react'; // FIXED: Added Box, Truck, and LineChart back
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

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

  const Feature = ({ icon, text }) => (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm opacity-90">{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="flex w-full max-w-5xl min-h-[600px] rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Panel */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-10 flex-col relative">
          <div className="absolute top-8 left-8 flex items-center gap-3">
            <div className="h-12 w-12 bg-white rounded-xl p-1 flex items-center justify-center">
               <img src="/Steve Logo.png" alt="Logo" className="object-contain" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40x40/ffffff/000000?text=S'; }} />
            </div>
            <span className="text-xl font-bold">Steve Integrated</span>
          </div>
          
          <div className="m-auto z-10">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Sign in to your<br/>Inventory Tracker
            </h1>
            <p className="max-w-md text-white/80 mb-10">
              Access your inventory management dashboard to track materials, deliveries, and issues in real-time.
            </p>
            <div className="space-y-5">
              <Feature icon={<Box size={20} />} text="Track materials and inventory levels" />
              <Feature icon={<Truck size={20} />} text="Monitor deliveries and shipments" />
              <Feature icon={<LineChart size={20} />} text="Real-time analytics and reporting" />
            </div>
          </div>

          <div className="absolute h-64 w-64 bg-white/5 rounded-full -top-20 -right-20"></div>
          <div className="absolute h-48 w-48 bg-white/5 rounded-full -bottom-24 -left-20"></div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 bg-white p-10 md:p-14 flex flex-col justify-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign in to your account</h2>
            <p className="text-gray-500 mb-8">Welcome back! Please enter your details.</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="user@example.com" 
                  required 
                />
              </div>
            </div>
            <div className="mb-6">
               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
               <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="password" 
                  id="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter your password" 
                  required 
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
