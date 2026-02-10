import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Layers,
    ShoppingCart,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Pages', path: '/pages', icon: Layers },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Settings', path: '/settings', icon: Settings },
];

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/login');
    };

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-secondary font-sans antialiased overflow-hidden">

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between px-8 pt-6 pb-2 shrink-0">
                <button
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className="p-2.5 rounded-2xl hover:bg-white/60 active:scale-95 transition-all duration-200 text-foreground backdrop-blur-sm"
                >
                    <Menu size={26} strokeWidth={1.8} />
                </button>

                <div className="w-10" />
            </div>

            {/* ── FIXED TOP LOGO ── */}
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
                <img
                    src="/Website-logo-black.png"
                    alt="OWN KARMA"
                    className="h-10 w-auto object-contain"
                />
            </div>

            {/* ── WORKSPACE ── */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* ── SIDEBAR ── */}
                <aside
                    className={`
            flex flex-col
            backdrop-blur-2xl bg-white/65 border border-white/50
            shadow-[0_8px_60px_-12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset]
            transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
            ${isSidebarOpen
                            ? 'w-[300px] m-4 rounded-3xl opacity-100 translate-x-0'
                            : 'w-0 m-0 opacity-0 -translate-x-8 overflow-hidden'}
          `}
                >
                    <div className="px-7 py-8 flex flex-col h-full min-w-[300px]">

                        {/* NAV */}
                        <nav className="flex-1 flex flex-col gap-1.5">
                            {navItems.map((item) => {
                                const active = isActive(item.path);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`
                      group relative flex items-center gap-4 px-5 py-3.5 rounded-2xl
                      transition-all duration-300 ease-out
                      ${active
                                                ? 'bg-white/80 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] translate-x-1'
                                                : 'hover:bg-white/50 text-muted-foreground hover:text-foreground'}
                    `}
                                    >
                                        {/* Active accent bar */}
                                        {active && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-full bg-foreground/80" />
                                        )}

                                        <Icon
                                            size={22}
                                            strokeWidth={active ? 2.2 : 1.6}
                                            className={`
                        transition-all duration-200
                        group-hover:scale-105
                        ${active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}
                      `}
                                        />

                                        <span
                                            className={`
                        text-[14px] tracking-[0.04em] uppercase
                        transition-all duration-200
                        ${active ? 'font-semibold text-foreground' : 'font-normal'}
                      `}
                                        >
                                            {item.name}
                                        </span>

                                        {active && (
                                            <ChevronRight
                                                size={16}
                                                strokeWidth={2}
                                                className="ml-auto text-foreground/50"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* PROFILE */}
                        <div className="mt-auto pt-6">
                            {/* Gradient separator */}
                            <div className="h-px mb-6 bg-gradient-to-r from-transparent via-border to-transparent" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-2xl bg-foreground text-primary-foreground flex items-center justify-center font-semibold text-base shadow-[0_4px_16px_-4px_rgba(0,0,0,0.2)] ring-2 ring-white/60">
                                        A
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-semibold text-foreground uppercase tracking-[0.08em]">
                                            Admin
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-medium tracking-wide">
                                            Headquarters
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                                >
                                    <LogOut size={18} strokeWidth={1.8} />
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className="flex-1 p-2 h-full overflow-hidden">
                    <div className="w-full h-full bg-white/50 backdrop-blur-xl rounded-2xl shadow-sm overflow-y-auto px-10 py-10 relative border border-white/60">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
