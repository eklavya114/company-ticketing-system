import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
    LayoutDashboard,
    PlusCircle,
    List,
    ShieldAlert,
    Users,
    ClipboardList,
    LogOut,
    UserCircle,
    Menu,
    X
} from 'lucide-react';
import { GlassButton } from './ui/GlassButton';
import { twMerge } from 'tailwind-merge';
import { AnimatePresence, motion } from 'framer-motion';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const links = [
        {
            role: ['CLIENT'],
            items: [
                { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { to: '/client/create', icon: PlusCircle, label: 'Raise Ticket' },
                { to: '/client/tickets', icon: List, label: 'My Tickets' },
            ]
        },
        {
            role: ['SUPER_ADMIN'],
            items: [
                { to: '/compliance', icon: ShieldAlert, label: 'Compliance Queue' },
            ]
        },
        {
            role: ['ADMIN'],
            items: [
                { to: '/manager', icon: Users, label: 'Dept Assignments' },
            ]
        },
        {
            role: ['USER'],
            items: [
                { to: '/teamlead', icon: ClipboardList, label: 'My Tasks' },
            ]
        }
    ];

    const role = user?.role || 'CLIENT';
    const activeLinks = links.find(group => group.role.includes(role))?.items || [];

    return (
        <>
            {/* Mobile Toggle */}
            <div className="fixed top-4 left-4 z-50 md:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg bg-slate-900/50 border border-slate-700 text-white backdrop-blur-md"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Container */}
            <AnimatePresence>
                {(isOpen || window.innerWidth >= 768) && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={twMerge(
                            "fixed left-0 top-0 h-screen w-64 glass border-r border-white/10 flex flex-col z-40",
                            "md:translate-x-0", // Always visible on desktop
                            // Mobile specific override handled by motion but we need to ensure md resets
                            "md:!transform-none"
                        )}
                    >
                        <div className="p-6 pt-20 md:pt-6">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                                Vizva CTS
                            </h1>
                            <p className="text-xs text-slate-400 mt-1">Premium Ticketing System</p>
                        </div>

                        <nav className="flex-1 px-4 space-y-2 mt-4">
                            {activeLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsOpen(false)} // Close on mobile click
                                    className={({ isActive }) => twMerge(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                    )}
                                >
                                    <link.icon size={20} />
                                    <span className="font-medium">{link.label}</span>
                                </NavLink>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-white/5 bg-black/20">
                            <div className="flex items-center gap-3 mb-4 px-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <GlassButton variant="danger" onClick={handleLogout} className="w-full text-sm py-2">
                                <LogOut size={16} />
                                Logout
                            </GlassButton>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
