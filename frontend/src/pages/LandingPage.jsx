import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { ShieldCheck, Zap, Globe, ArrowRight, LayoutDashboard, Lock, Activity } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 glass border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/20 p-2 rounded-lg text-primary">
                            <ShieldCheck size={24} />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Vizva CTS
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link to="/">
                                <GlassButton variant="primary" className="h-10 text-sm">Dashboard</GlassButton>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                    Sign In
                                </Link>
                                <Link to="/register">
                                    <GlassButton variant="primary" className="h-10 text-sm">Get Started</GlassButton>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 opacity-20 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 opacity-20 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-primary mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Next Gen Ticketing System
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-500">
                                Support at the
                            </span>
                            <span className="block text-primary text-glow">
                                Speed of Light
                            </span>
                        </h1>
                        <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
                            Experience the future of enterprise support. Forensic glassmorphism design meets
                            institutional-grade security and real-time collaboration.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register">
                                <GlassButton className="w-full sm:w-auto text-lg px-8 py-4">
                                    Start Free Trial
                                    <ArrowRight className="w-5 h-5" />
                                </GlassButton>
                            </Link>
                            <GlassButton variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4">
                                View Live Demo
                            </GlassButton>
                        </div>
                    </motion.div>

                    {/* 3D-like Floating Cards */}
                    <div className="relative h-[600px] hidden lg:block perspective-1000">
                        <motion.div
                            initial={{ rotateY: 15, rotateX: 5, opacity: 0 }}
                            animate={{ rotateY: -5, rotateX: 5, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                            {/* Main Card */}
                            <GlassCard className="w-[400px] bg-slate-900/80 border-slate-700 backdrop-blur-3xl shadow-2xl z-20 relative transform transition-transform duration-500 hover:scale-105 hover:-translate-y-2">
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500" />
                                        <div>
                                            <div className="h-2 w-20 bg-slate-700 rounded mb-1" />
                                            <div className="h-2 w-12 bg-slate-800 rounded" />
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 w-full bg-slate-700 rounded" />
                                    <div className="h-2 w-3/4 bg-slate-700 rounded" />
                                    <div className="h-2 w-1/2 bg-slate-700 rounded" />
                                </div>
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900" />
                                        ))}
                                    </div>
                                    <div className="h-8 w-24 bg-primary/20 rounded-lg" />
                                </div>
                            </GlassCard>

                            {/* Floating Element 1 - Stats */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-12 -right-12 z-30"
                            >
                                <GlassCard className="p-4 w-48 bg-slate-900/90 border-slate-600">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Activity className="text-green-400" size={20} />
                                        <span className="text-sm font-bold text-white">+124%</span>
                                    </div>
                                    <div className="text-xs text-slate-400">Response Rate</div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full w-3/4 bg-green-500 rounded-full" />
                                    </div>
                                </GlassCard>
                            </motion.div>

                            {/* Floating Element 2 - Security */}
                            <motion.div
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-12 -left-12 z-10"
                            >
                                <GlassCard className="p-4 flex items-center gap-3 bg-slate-900/90 border-slate-600">
                                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Encrypted</div>
                                        <div className="text-xs text-slate-400">End-to-end secure</div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Vizva CTS?</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Built for scalability, designed for aesthetics. The most advanced ticketing solution on the market.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: "Lightning Fast", desc: "Powered by modern tech stack for zero latency updates." },
                            { icon: ShieldCheck, title: "Enterprise Security", desc: "Role-based access control (RBAC) and encrypted data flow." },
                            { icon: LayoutDashboard, title: "Professional UI", desc: "Forensic glassmorphism design for intuitive navigation." },
                            { icon: Globe, title: "Global Access", desc: "Access your support portal from anywhere, on any device." },
                            { icon: Activity, title: "Real-time Analytics", desc: "Track performance with live charts and data widgets." },
                            { icon: Lock, title: "Compliance Ready", desc: "Built-in compliance workflows for regulated industries." }
                        ].map((feature, idx) => (
                            <GlassCard key={idx} className="hover:bg-white/5 transition-colors group">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <GlassCard className="p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 animate-pulse-slow" />
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold text-white mb-6">Ready to streamline your support?</h2>
                            <p className="text-slate-300 mb-8 text-lg">Join thousands of companies using Vizva CTS to delight their customers.</p>
                            <Link to="/register">
                                <GlassButton className="text-lg px-10 py-4 shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)]">
                                    Create Free Account
                                </GlassButton>
                            </Link>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-6 bg-black/20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-slate-600" size={24} />
                        <span className="text-slate-500 font-semibold">Vizva CTS</span>
                    </div>
                    <div className="text-slate-600 text-sm">
                        © 2026 Vizva Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
