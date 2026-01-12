import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { Plus, Clock, CheckCircle, AlertCircle, ArrowRight, Activity, XCircle, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from 'sonner';

export default function ClientDashboard() {
    const [stats, setStats] = useState({ total: 0, active: 0, closed: 0 });
    const [recentTickets, setRecentTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);

    // Tracker Modal State
    const [showTracker, setShowTracker] = useState(false);
    const [trackingTicket, setTrackingTicket] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/tickets/my-tickets');
                const tickets = res.data.tickets || [];

                const active = tickets.filter(t => t.status !== 'Closed').length;
                const closed = tickets.filter(t => t.status === 'Closed').length;

                setStats({
                    total: tickets.length,
                    active,
                    closed
                });

                setChartData([
                    { name: 'Active', value: active, color: '#06b6d4' }, // Cyan
                    { name: 'Closed', value: closed, color: '#10b981' }, // Emerald
                    { name: 'Urgent', value: tickets.filter(t => t.priority === 'Urgent').length, color: '#ef4444' } // Red
                ].filter(d => d.value > 0));

                setRecentTickets(tickets.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleTrackStatus = async (ticketId) => {
        setTrackingLoading(true);
        setShowTracker(true);
        setTrackingTicket(null); // Reset prev

        try {
            // Fetch detailed ticket info including assignments
            const res = await api.get(`/tickets/${ticketId}`);
            setTrackingTicket({
                ...res.data.ticket,
                assignments: res.data.assignments || []
            });
        } catch (err) {
            toast.error("Failed to load tracking details");
            setShowTracker(false);
        } finally {
            setTrackingLoading(false);
        }
    };

    // --- Tracker Component ---
    const TrackerStep = ({ label, active, completed, isLast, icon: Icon }) => (
        <div className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
            ${completed || active ? 'bg-primary border-primary text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-900 border-slate-700 text-slate-500'}
        `}>
                    {completed ? <CheckCircle size={18} /> : active ? (Icon ? <Icon size={18} className="animate-pulse" /> : <Clock size={18} className="animate-pulse" />) : <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
                <span className={`absolute top-12 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap text-center w-24
            ${completed || active ? 'text-primary' : 'text-slate-600'}
        `}>
                    {label}
                </span>
            </div>
            {!isLast && (
                <div className={`h-[2px] w-full mx-2 rounded-full transition-all duration-700
            ${completed ? 'bg-gradient-to-r from-primary to-primary/50' : 'bg-slate-800'}
        `} />
            )}
        </div>
    );

    return (
        <div className="space-y-8 relative">
            {/* Top Section: Stats & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Helper Function for Stat Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Active Tickets</p>
                            <p className="text-2xl font-bold text-white">{stats.active}</p>
                        </div>
                    </GlassCard>

                    <GlassCard className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Resolved</p>
                            <p className="text-2xl font-bold text-white">{stats.closed}</p>
                        </div>
                    </GlassCard>

                    <GlassCard className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Raised</p>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                        </div>
                    </GlassCard>

                    {/* Quick Action Banner */}
                    <GlassCard className="md:col-span-3 bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between p-6">
                        <div>
                            <h3 className="text-lg font-bold text-white">Have a new issue?</h3>
                            <p className="text-slate-400 text-sm">Our support team is ready to help 24/7.</p>
                        </div>
                        <Link to="/client/create">
                            <GlassButton>Raise Ticket</GlassButton>
                        </Link>
                    </GlassCard>
                </div>

                {/* Chart Section */}
                <GlassCard className="flex flex-col items-center justify-center min-h-[300px]">
                    <h3 className="text-lg font-bold text-white mb-4 self-start w-full px-2">Ticket Status Distribution</h3>
                    {chartData.length > 0 ? (
                        <div className="w-full h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-slate-500 text-sm">No data to display</div>
                    )}
                </GlassCard>
            </div>

            {/* Recent Activity List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                    <Link to="/client/tickets" className="text-sm text-primary hover:text-primary/80 transition-colors">
                        View All
                    </Link>
                </div>
                {recentTickets.length === 0 ? (
                    <GlassCard className="text-center py-12 text-slate-400">
                        No tickets found.
                    </GlassCard>
                ) : (
                    recentTickets.map(ticket => (
                        <GlassCard key={ticket._id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-12 rounded-full ${ticket.status === 'Closed' ? 'bg-green-500' :
                                    ticket.priority === 'Urgent' ? 'bg-red-500' : 'bg-primary'
                                    }`} />
                                <div>
                                    <h3 className="font-medium text-white group-hover:text-primary transition-colors">{ticket.title}</h3>
                                    <p className="text-xs text-slate-400">Ref: {ticket.referenceID || ticket._id}</p>
                                </div>
                            </div>

                            <GlassButton
                                variant="secondary"
                                className="h-9 text-xs flex items-center gap-2"
                                onClick={() => handleTrackStatus(ticket._id)}
                            >
                                <Activity size={14} className="text-primary" />
                                Track Status
                            </GlassButton>
                        </GlassCard>
                    ))
                )}
            </div>

            {/* TRACKING MODAL */}
            {showTracker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <GlassCard className="w-full max-w-4xl bg-slate-950 border-slate-800 max-h-[90vh] flex flex-col relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Activity className="text-primary" /> Real-time Tracker
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Live updates on your request journey.</p>
                            </div>
                            <button onClick={() => setShowTracker(false)} className="text-slate-400 hover:text-white transition-colors">
                                <XCircle size={28} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-2">
                            {trackingLoading ? (
                                <div className="text-center py-20 text-slate-400 animate-pulse">Loading status...</div>
                            ) : !trackingTicket ? (
                                <div className="text-center py-20 text-red-400">Error loading ticket info.</div>
                            ) : (
                                <div className="space-y-12 pb-8">

                                    {/* Ticket Header Info */}
                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between gap-4">
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-2">{trackingTicket.title}</h4>
                                            <p className="text-slate-400 text-sm">{trackingTicket.description}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 uppercase font-bold">Current Status</p>
                                                <p className="text-primary font-medium">{trackingTicket.status}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 uppercase font-bold">Priority</p>
                                                <span className={`px-2 py-0.5 rounded text-xs border ${trackingTicket.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                                                    }`}>{trackingTicket.priority}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PROGRESS BAR: MAIN LIFECYCLE ONLY */}
                                    {/* 1. Raised -> 2. Compliance -> 3. Dept -> 4. Review -> 5. Resolved */}
                                    <div>
                                        <h5 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8 ml-2">Overall Progress</h5>
                                        <div className="flex items-center justify-between px-4 pb-12">
                                            {/* Step 1: Raised */}
                                            <TrackerStep label="Ticket Raised" completed={true} icon={Plus} />

                                            {/* Step 2: Compliance */}
                                            <TrackerStep
                                                label="Compliance Review"
                                                completed={trackingTicket.status !== 'In Compliance Review' && trackingTicket.status !== 'Open' && trackingTicket.status !== 'New'}
                                                active={trackingTicket.status === 'In Compliance Review'}
                                            />

                                            {/* Step 3: Department Processing */}
                                            <TrackerStep
                                                label="Dept Processing"
                                                completed={trackingTicket.status === 'Waiting for Client' || trackingTicket.status === 'Closed' || trackingTicket.status === 'Resolved'}
                                                active={trackingTicket.status === 'In Resolution'}
                                            />

                                            {/* Step 4: Waiting for Review */}
                                            <TrackerStep
                                                label="Final Review"
                                                completed={trackingTicket.status === 'Closed'}
                                                active={trackingTicket.status === 'Waiting for Client'}
                                            />

                                            {/* Step 5: Resolved */}
                                            <TrackerStep
                                                label="Resolved"
                                                completed={trackingTicket.status === 'Closed'}
                                                isLast
                                            />
                                        </div>
                                    </div>

                                    {/* REMOVED DEPARTMENT THREADS SECTION AS REQUESTED */}

                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
