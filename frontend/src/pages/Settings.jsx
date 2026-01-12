
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { User, Lock, Bell, Moon, Sun, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Form States
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [password, setPassword] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [preferences, setPreferences] = useState({
        emailNotifs: true,
        appNotifs: true,
        darkMode: true
    });

    useEffect(() => {
        // Load prefs from local storage
        const stored = localStorage.getItem('app_preferences');
        if (stored) {
            setPreferences(JSON.parse(stored));
        }
    }, []);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Profile updated successfully");
        }, 1000);
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (password.new !== password.confirm) {
            toast.error("New passwords do not match");
            return;
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setPassword({ current: '', new: '', confirm: '' });
            toast.success("Password changed successfully");
        }, 1000);
    };

    const togglePref = (key) => {
        const newPrefs = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPrefs);
        localStorage.setItem('app_preferences', JSON.stringify(newPrefs));
        toast.info("Preference saved");
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'preferences', label: 'Preferences', icon: Bell },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-slate-400">Manage your account settings and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                                ${activeTab === tab.id
                                    ? 'bg-primary/20 text-primary border border-primary/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    <GlassCard className="p-8 min-h-[500px]">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in duration-500">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <User className="text-primary" /> Personal Information
                                </h2>

                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Email Address</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="w-full bg-slate-900/30 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-slate-500">Email cannot be changed. Contact admin for support.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex justify-end">
                                    <GlassButton isLoading={loading} type="submit" className="min-w-[120px]">
                                        <Save size={18} className="mr-2" /> Save Changes
                                    </GlassButton>
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <form onSubmit={handleSavePassword} className="space-y-6 animate-in fade-in duration-500">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Shield className="text-primary" /> Security Settings
                                </h2>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Current Password</label>
                                        <input
                                            type="password"
                                            value={password.current}
                                            onChange={e => setPassword({ ...password, current: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">New Password</label>
                                            <input
                                                type="password"
                                                value={password.new}
                                                onChange={e => setPassword({ ...password, new: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">Confirm Password</label>
                                            <input
                                                type="password"
                                                value={password.confirm}
                                                onChange={e => setPassword({ ...password, confirm: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex justify-end">
                                    <GlassButton variant="danger" isLoading={loading} type="submit" className="min-w-[120px]">
                                        Update Password
                                    </GlassButton>
                                </div>
                            </form>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Bell className="text-primary" /> App Preferences
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                                                <Bell size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">Push Notifications</h3>
                                                <p className="text-sm text-slate-500">Receive in-app alerts for ticket updates</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => togglePref('appNotifs')}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${preferences.appNotifs ? 'bg-primary' : 'bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.appNotifs ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">Email Notifications</h3>
                                                <p className="text-sm text-slate-500">Receive email digests for assignments</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => togglePref('emailNotifs')}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${preferences.emailNotifs ? 'bg-primary' : 'bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.emailNotifs ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
