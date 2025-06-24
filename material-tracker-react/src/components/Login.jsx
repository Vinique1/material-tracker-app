import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import clsx from 'clsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); // NEW: State for inline errors

  // NEW: Client-side validation function
  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    // MODIFIED: Validate form before submitting
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-email':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please try again.');
          break;
        default:
          setError('An unexpected error occurred. Please try again later.');
          break;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full text-white font-montserrat relative overflow-hidden bg-[#1E2A5B]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 z-10"
        style={{ backgroundImage: "url('/Inventory.jpg')" }}
      ></div>
      <div className="absolute inset-0 z-20 pointer-events-none hidden lg:block">
        <img
          src="/graphic1.png"
          alt=""
          className="absolute opacity-20"
          style={{ top: '-8%', left: '41.5%', width: '11.8vw' }}
        />
        <img
          src="/graphic1.png"
          alt=""
          className="absolute opacity-20"
          style={{ top: '88%', left: '91.6%', width: '11.8vw' }}
        />
        <img
          src="/graphic2.png"
          alt=""
          className="absolute opacity-20"
          style={{ top: '6.4%', left: '90.6%', width: '4.5vw' }}
        />
      </div>
      <div className="relative z-30 flex items-center justify-center min-h-screen w-full px-6 sm:px-8 lg:px-12">
        <div className="w-full max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-11 gap-16 items-center">
          <div className="lg:col-span-6 flex flex-col h-full text-center lg:text-left">
            <header className="mb-0 flex items-center gap-4 justify-center lg:justify-start">
              <img
                src="/Steve Logo.png"
                alt="Steve Integrated Logo"
                className="h-12 w-12"
              />
              <h1 className="text-2xl font-semibold">Steve Integrated</h1>
            </header>
            <main className="flex-grow flex flex-col justify-center my-10 lg:my-0">
              <h2 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold leading-tight text-white">
                Login
              </h2>
              <p className="text-xl md:text-2xl text-white/70 mt-4 mb-12">
                Sign in to continue
              </p>
              <p className="text-base max-w-lg text-white/60 mx-auto lg:mx-0">
                Access your inventory management dashboard to track materials,
                deliveries, and issues in real-time.
              </p>
              <div className="mt-16">
                <button className="bg-[#FDE047] text-[#1E3A8A] font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 hover:bg-[#FACC15]">
                  Learn More
                </button>
              </div>
            </main>
            <footer className="w-full flex justify-center lg:justify-start">
              <img
                src="/graphic3.png"
                alt=""
                className="opacity-20"
                style={{ width: '6.2vw', minWidth: '50px' }}
              />
            </footer>
          </div>
          <div className="lg:col-span-5 flex items-center justify-center w-full">
            <div className="w-full max-w-lg p-10 md:p-14 rounded-3xl bg-white/10 shadow-2xl backdrop-blur-lg">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-white">Welcome</h3>
                <p className="text-white/60 mt-1">Let's get you signed in.</p>
              </div>
              <form onSubmit={handleLogin} noValidate>
                {' '}
                {/* MODIFIED: Added noValidate */}
                <div className="space-y-7">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider"
                    >
                      EMAIL
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className={clsx(
                        'w-full h-12 px-4 bg-white/10 rounded-lg text-white placeholder-white/50 border transition-all duration-300',
                        // MODIFIED: Add red border on error
                        errors.email ? 'border-red-400' : 'border-transparent',
                        'focus:outline-none focus:border-yellow-400 focus:bg-white/20',
                      )}
                    />
                    {/* NEW: Display inline error */}
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-2">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider"
                    >
                      PASSWORD
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      className={clsx(
                        'w-full h-12 px-4 bg-white/10 rounded-lg text-white placeholder-white/50 border transition-all duration-300',
                        // MODIFIED: Add red border on error
                        errors.password
                          ? 'border-red-400'
                          : 'border-transparent',
                        'focus:outline-none focus:border-yellow-400 focus:bg-white/20',
                      )}
                    />
                    {/* NEW: Display inline error */}
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-2">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>
                {error && (
                  <p className="text-red-400 text-sm mt-6 text-center">
                    {error}
                  </p>
                )}
                <div className="mt-10">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={clsx(
                      'w-full font-bold py-3 rounded-full text-lg transition-all duration-300',
                      'bg-[#FDE047] text-[#1E3A8A]',
                      isSubmitting
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-[#FACC15]',
                    )}
                  >
                    {isSubmitting ? 'Signing In...' : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
