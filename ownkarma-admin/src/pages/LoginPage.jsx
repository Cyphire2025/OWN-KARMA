import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (email === 'admin@ownkarma.com' && password === 'ownkarma2025') {
            localStorage.setItem('adminToken', 'admin-session-active');
            localStorage.setItem('adminUser', JSON.stringify({ email, name: 'Admin' }));
            navigate('/');
        } else {
            setError('Invalid credentials. Access denied.');
        }
        setLoading(false);
    };

    return (
        <div className="login-bg min-h-screen flex items-center justify-center p-6">
            {/* Ambient glow orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-[800px] h-[800px] rounded-full opacity-[0.03] blur-[120px]"
                    style={{ background: 'radial-gradient(circle, #000000, transparent)', top: '-20%', left: '50%', transform: 'translateX(-50%)' }} />
            </div>

            <div className="relative w-full max-w-[440px]">
                {/* Logo */}
                <div className="text-center mb-14">
                    <h1 className="text-4xl font-bold tracking-[0.25em] text-black mb-4">
                        OWN KARMA
                    </h1>
                    <div className="w-16 h-[1px] mx-auto mb-6 bg-black/10" />
                    <p className="text-muted text-xs tracking-[0.3em] uppercase font-medium">
                        Admin Suite
                    </p>
                </div>

                {/* Login Card */}
                <div className="card p-10">
                    <form onSubmit={handleLogin} className="space-y-7">
                        {error && (
                            <div className="bg-danger/10 border border-danger/20 text-danger text-sm px-5 py-4 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="label">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@ownkarma.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}
                            className="btn-primary w-full text-center py-4 text-sm tracking-[0.1em] uppercase">
                            {loading ? 'Authenticating...' : 'Access Dashboard'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border text-center">
                        <p className="text-dim text-xs tracking-wider">
                            Protected area · Unauthorized access is prohibited
                        </p>
                    </div>
                </div>

                <p className="text-center text-dim/40 text-xs mt-10 tracking-[0.15em]">
                    © 2025 Own Karma — All Rights Reserved
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
