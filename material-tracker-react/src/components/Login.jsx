import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import clsx from 'clsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            // This error handling is well done, no changes needed here.
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
        // 1. COLOR: Softer, design-accurate background color
        // MODIFIED: Updated background to be theme-responsive
        <div className="min-h-screen w-full text-white font-montserrat relative overflow-hidden bg-white dark:bg-[#1E2A5B]">
            {/* 2. BACKGROUND: Reduced opacity for a more subtle texture */}
            <div className="absolute inset-0 bg-cover bg-center opacity-10 z-10" style={{ backgroundImage: "url('/Inventory.jpg')" }}></div>

            {/* Decorative graphics - no changes needed, they are fine */}
            <div className="absolute inset-0 z-20 pointer-events-none hidden lg:block">
                <img src="/graphic1.png" alt="" className="absolute opacity-20" style={{ top: '-8%', left: '41.5%', width: '11.8vw' }} />
                <img src="/graphic1.png" alt="" className="absolute opacity-20" style={{ top: '88%', left: '91.6%', width: '11.8vw' }} />
                <img src="/graphic2.png" alt="" className="absolute opacity-20" style={{ top: '6.4%', left: '90.6%', width: '4.5vw' }} />
            </div>

            <div className="relative z-30 flex items-center justify-center min-h-screen w-full px-6 sm:px-8 lg:px-12">
                <div className="w-full max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-11 gap-16 items-center">

                    {/* --- Left Column (Typography is now final) --- */}
                    <div className="lg:col-span-6 flex flex-col h-full text-center lg:text-left">
                        <header className="mb-0 flex items-center gap-4 justify-center lg:justify-start">
                            <img src="/Steve Logo.png" alt="Steve Integrated Logo" className="h-12 w-12" />
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Steve Integrated</h1> {/* MODIFIED: Added dark text */}
                        </header>

                        <main className="flex-grow flex flex-col justify-center my-10 lg:my-0">
                            <h2 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold leading-tight text-gray-900 dark:text-white">Login</h2> {/* MODIFIED: Added dark text */}
                            <p className="text-xl md:text-2xl text-gray-700 dark:text-white/70 mt-4 mb-12">Sign in to continue</p> {/* MODIFIED: Added dark text */}
                            <p className="text-base max-w-lg text-gray-600 dark:text-white/60 mx-auto lg:mx-0"> {/* MODIFIED: Added dark text */}
                                Access your inventory management dashboard to track materials, deliveries, and issues in real-time.
                            </p>
                            <div className="mt-16">
                                {/* 3. INTERACTION: Softer hover effect on button */}
                                <button className="bg-[#FDE047] text-[#1E3A8A] font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 hover:bg-[#FACC15]">
                                    Learn More
                                </button>
                            </div>
                        </main>

                        <footer className="w-full flex justify-center lg:justify-start">
                            <img src="/graphic3.png" alt="" className="opacity-20" style={{ width: '6.2vw', minWidth: '50px' }}/>
                        </footer>
                    </div>

                    {/* --- Right Column (Login Form) --- */}
                    <div className="lg:col-span-5 flex items-center justify-center w-full">
                        <div className="w-full max-w-lg p-10 md:p-14 rounded-3xl bg-gray-100 dark:bg-white/10 shadow-2xl backdrop-blur-lg"> {/* MODIFIED: Added dark background */}
                            <div className="text-center mb-10">
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome</h3> {/* MODIFIED: Added dark text */}
                                <p className="text-gray-700 dark:text-white/60 mt-1">Let's get you signed in.</p> {/* MODIFIED: Added dark text */}
                            </div>

                            <form onSubmit={handleLogin}>
                                <div className="space-y-7">
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-white/70 mb-2 uppercase tracking-wider">EMAIL</label> {/* MODIFIED: Added dark text */}
                                        {/* 4. INTERACTION: Refined input styles */}
                                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="w-full h-12 px-4 bg-gray-50 dark:bg-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 border border-transparent focus:outline-none focus:border-yellow-400 focus:bg-white dark:focus:bg-white/20 transition-all duration-300" required/> {/* MODIFIED: Added dark styles */}
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-white/70 mb-2 uppercase tracking-wider">PASSWORD</label> {/* MODIFIED: Added dark text */}
                                        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" className="w-full h-12 px-4 bg-gray-50 dark:bg-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 border border-transparent focus:outline-none focus:border-yellow-400 focus:bg-white dark:focus:bg-white/20 transition-all duration-300" required/> {/* MODIFIED: Added dark styles */}
                                    </div>
                                </div>
                                {/* 5. COLOR: More harmonious error message color */}
                                {error && <p className="text-red-600 dark:text-red-400 text-sm mt-6 text-center">{error}</p>} {/* MODIFIED: Added dark text */}
                                <div className="mt-10">
                                    <button type="submit" disabled={isSubmitting} className={clsx(
                                        "w-full font-bold py-3 rounded-full text-lg transition-all duration-300",
                                        // 6. COLOR & INTERACTION: Final button styles
                                        "bg-[#FDE047] text-[#1E3A8A]",
                                        isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FACC15]"
                                    )}>
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