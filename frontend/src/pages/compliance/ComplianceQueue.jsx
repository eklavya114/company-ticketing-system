import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { CheckCircle, XCircle, Clock, AlertTriangle, User, ChevronRight, Filter, History, AlertOctagon, Search, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const AVAILABLE_DEPARTMENTS = ['Resume', 'Marketing', 'Technical', 'Sales'];
const BRANCHES = ['AHM', 'LKO', 'GGR'];

export default function ComplianceQueue() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const [activeTab, setActiveTab] = useState('queue');
  const [trackedTickets, setTrackedTickets] = useState([]);
  const [pendingCloseTickets, setPendingCloseTickets] = useState([]);

  // Filter & Search State
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  // Audit Log State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [ticketHistory, setTicketHistory] = useState([]);

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchQueue();
    } else if (activeTab === 'track') {
      fetchTrackedTickets();
    } else if (activeTab === 'pending') {
      fetchPendingClose();
    }
  }, [activeTab]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/compliance/queue');
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error('Failed to fetch compliance queue', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackedTickets = async () => {
    try {
      setLoading(true);
      const allTicketsMap = new Map();

      // 1. Fetch from /tickets/my-tickets 
      try {
        const apiRes = await api.get('/tickets/my-tickets');
        if (apiRes.data && apiRes.data.tickets) {
          apiRes.data.tickets.forEach(t => allTicketsMap.set(t._id, t));
        }
      } catch (e) {
        if (e.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          return;
        }
        console.warn('Failed to fetch my-tickets', e);
      }

      // 2. Fetch from local storage IDs
      let ids = [];
      try {
        const stored = localStorage.getItem('compliance_tracked_ids');
        ids = stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error("Failed to parse tracked IDs", e);
        ids = [];
      }

      // Combine all IDs to fetch details for
      const idsToFetch = new Set([...ids, ...Array.from(allTicketsMap.keys())]);

      if (idsToFetch.size > 0) {
        // Use map with individual error handling to detect 401s specifically
        const results = await Promise.all(Array.from(idsToFetch).map(async id => {
          try {
            return await api.get(`/tickets/${id}`);
          } catch (err) {
            if (err.response?.status === 401) return 'AUTH_ERROR';
            return null;
          }
        }));

        // Check if we hit an auth error during individual fetches
        if (results.some(r => r === 'AUTH_ERROR')) {
          toast.error("Session expired. Please login again to view all tracked tickets.");
        }

        const detailedTickets = [];
        results.forEach(r => {
          if (r && r !== 'AUTH_ERROR' && r.data && r.data.ticket) {
            const ticketWithAssignments = {
              ...r.data.ticket,
              assignments: r.data.assignments || []
            };
            detailedTickets.push(ticketWithAssignments);
          }
        });
        setTrackedTickets(detailedTickets);
      } else {
        setTrackedTickets([]);
      }

    } catch (err) {
      console.warn('Could not fetch tracked tickets', err);
      setTrackedTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (referenceID) => {
    try {
      const res = await api.get(`/tickets/history/${referenceID}`);
      setTicketHistory(res.data.history || []);
      setShowHistoryModal(true);
    } catch (err) {
      toast.error('Failed to fetch history');
    }
  };

  const fetchPendingClose = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/compliance/ready-to-close');
      setPendingCloseTickets(res.data.tickets || []);
    } catch (err) {
      console.error('Failed to fetch pending close queue', err);
      toast.error('Failed to fetch pending close tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    setProcessing(ticketId);
    try {
      await api.post(`/admin/compliance/tickets/${ticketId}/close`);
      toast.success('Ticket closed successfully! Client has been notified.');
      fetchPendingClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close ticket');
    } finally {
      setProcessing(null);
    }
  };

  const openApproveModal = (ticketId) => {
    setSelectedTicket(ticketId);
    setSelectedDepartments([]);
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (selectedDepartments.length === 0) {
      toast.error('Please select at least one department');
      return;
    }

    setProcessing(selectedTicket);
    try {
      const formattedDepartments = selectedDepartments.map(dept => ({
        name: dept,
        branch: dept === 'Marketing' ? 'AHM' : null
      }));

      await api.post(`/admin/compliance/tickets/${selectedTicket}/approve`, {
        departments: formattedDepartments
      });

      const stored = localStorage.getItem('compliance_tracked_ids');
      const ids = stored ? JSON.parse(stored) : [];
      if (!ids.includes(selectedTicket)) {
        ids.push(selectedTicket);
        localStorage.setItem('compliance_tracked_ids', JSON.stringify(ids));
      }

      toast.success('Ticket approved and assigned!');
      setShowModal(false);

      if (activeTab === 'queue') fetchQueue();
      else fetchTrackedTickets();

    } catch (err) {
      console.error(err);
      toast.error('Failed to approve ticket');
    } finally {
      setProcessing(null);
      setSelectedTicket(null);
    }
  };

  const handleClose = async (ticketId) => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;
    setProcessing(ticketId);
    try {
      await api.post(`/admin/compliance/tickets/${ticketId}/close`);

      const stored = localStorage.getItem('compliance_tracked_ids');
      const ids = stored ? JSON.parse(stored) : [];
      if (!ids.includes(ticketId)) {
        ids.push(ticketId);
        localStorage.setItem('compliance_tracked_ids', JSON.stringify(ids));
      }

      toast.success('Ticket closed successfully');

      if (activeTab === 'queue') fetchQueue();
      else fetchTrackedTickets();

    } catch (err) {
      toast.error('Failed to close ticket');
    } finally {
      setProcessing(null);
    }
  };

  const toggleDepartment = (dept) => {
    if (selectedDepartments.includes(dept)) {
      setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
    } else {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
  };

  // --- ANALYTICS & STATS ---
  const getSLAStats = () => {
    const allUnique = new Map();
    tickets.forEach(t => allUnique.set(t._id, t));
    trackedTickets.forEach(t => allUnique.set(t._id, t));

    const all = Array.from(allUnique.values());

    let breached = 0;
    let urgent = 0;
    let inProgress = 0;
    let closed = 0;

    const now = new Date();

    all.forEach(t => {
      if (t.status === 'Closed') {
        closed++;
      } else {
        if (t.status === 'In Resolution' || t.status === 'In Compliance Review') inProgress++;

        if (t.priority === 'Urgent') urgent++;

        const created = new Date(t.createdAt);
        const diffHours = (now - created) / 36e5;
        if (t.priority === 'Urgent' && diffHours > 4) breached++;
        else if (diffHours > 24) breached++;
      }
    });

    return { breached, urgent, inProgress, closed };
  };

  const stats = getSLAStats();

  const getDepartmentLoad = () => {
    const load = {
      'Resume': 0,
      'Marketing': 0,
      'Technical': 0,
      'Sales': 0
    };

    trackedTickets.forEach(t => {
      if (t.assignments) {
        t.assignments.forEach(a => {
          if (load[a.department] !== undefined && a.status !== 'Resolved') {
            load[a.department]++;
          }
        });
      }
    });

    return Object.keys(load).map(key => ({ name: key, count: load[key] }));
  };

  const departmentData = getDepartmentLoad();

  // --- FILTER & SEARCH LOGIC ---
  const filteredTickets = (selectedBranch === 'All' ? tickets : tickets).filter(t => {
    // Basic Search Filter
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      (t.referenceID && t.referenceID.toLowerCase().includes(lower)) ||
      (t.contact_email && t.contact_email.toLowerCase().includes(lower))
    );
  });

  const filteredTracked = trackedTickets.filter(t => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(lower) ||
      (t.referenceID && t.referenceID.toLowerCase().includes(lower))
    );
  });


  // --- Visual Tracker Components ---
  const TrackerStep = ({ label, active, completed, isLast }) => (
    <div className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
      <div className="flex flex-col items-center relative z-10">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
            ${completed || active ? 'bg-primary border-primary text-black' : 'bg-slate-900 border-slate-700 text-slate-500'}
        `}>
          {completed ? <CheckCircle size={14} /> : active ? <Clock size={14} className="animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-current" />}
        </div>
        <span className={`absolute top-10 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap
            ${completed || active ? 'text-primary' : 'text-slate-600'}
        `}>
          {label}
        </span>
      </div>
      {!isLast && (
        <div className={`h-[2px] w-full mx-2 rounded-full transition-all duration-700
            ${completed ? 'bg-primary/50' : 'bg-slate-800'}
        `} />
      )}
    </div>
  );

  return (
    <div className="space-y-8 relative pb-20">

      {/* SLA Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 border-l-4 border-l-red-500 bg-red-500/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">SLA Breached</p>
              <h2 className="text-2xl font-bold text-red-500 mt-1">{stats.breached}</h2>
            </div>
            <AlertOctagon className="text-red-500 opacity-50" size={24} />
          </div>
          <p className="text-[10px] text-red-400/60 mt-2">Overdue requests (&gt;4h)</p>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-orange-500 bg-orange-500/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Urgent</p>
              <h2 className="text-2xl font-bold text-orange-500 mt-1">{stats.urgent}</h2>
            </div>
            <AlertTriangle className="text-orange-500 opacity-50" size={24} />
          </div>
          <p className="text-[10px] text-orange-400/60 mt-2">High Priority Attention</p>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-yellow-500 bg-yellow-500/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">In Progress</p>
              <h2 className="text-2xl font-bold text-yellow-500 mt-1">{stats.inProgress}</h2>
            </div>
            <Clock className="text-yellow-500 opacity-50" size={24} />
          </div>
          <p className="text-[10px] text-yellow-400/60 mt-2">Active Tickets</p>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-green-500 bg-green-500/5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Closed</p>
              <h2 className="text-2xl font-bold text-green-500 mt-1">{stats.closed}</h2>
            </div>
            <CheckCircle className="text-green-500 opacity-50" size={24} />
          </div>
          <p className="text-[10px] text-green-400/60 mt-2">Successfully Resolved</p>
        </GlassCard>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="text-primary" /> Compliance Queue
        </h1>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-primary focus:border-primary block pl-10 p-2.5 outline-none transition-all"
            />
            <Search size={16} className="absolute left-3 top-3 text-slate-500 pointer-events-none" />
          </div>

          {/* Branch Filter */}
          {activeTab === 'queue' && (
            <div className="relative">
              <select
                className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 pl-9 appearance-none cursor-pointer"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="All">All Branches</option>
                {BRANCHES.map(b => (
                  <option key={b} value={b}>{b} Branch</option>
                ))}
              </select>
              <Filter size={14} className="absolute left-3 top-3.5 text-slate-500 pointer-events-none" />
            </div>
          )}

          {/* Tab Switcher */}
          <div className="p-1 bg-slate-900/50 rounded-lg border border-slate-700 flex gap-1">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'queue' ? 'bg-primary/20 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Review
              {tickets.length > 0 && <span className="ml-2 text-xs bg-primary text-black px-1.5 rounded-full">{tickets.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'track' ? 'bg-primary/20 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Track Status
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-amber-500/20 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Pending Close
              {pendingCloseTickets.length > 0 && <span className="ml-2 text-xs bg-amber-500 text-black px-1.5 rounded-full">{pendingCloseTickets.length}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* MAIN COLUMN (Queue/List) */}
        <div className="lg:col-span-3 space-y-4">
          {activeTab === 'queue' ? (
            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-12 text-slate-400">Loading queue...</div>
              ) : filteredTickets.length === 0 ? (
                <>
                  <GlassCard className="text-center py-16 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                      <CheckCircle size={32} className="text-green-500/50" />
                    </div>
                    <h3 className="text-lg font-bold text-white">All caught up!</h3>
                    <p className="text-slate-400 max-w-sm mt-2">No tickets are pending compliance review. Check the Department Analytics to see active workloads.</p>
                  </GlassCard>

                  {/* Empty State Add-ons: System Insights */}
                  <div className="grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <GlassCard className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
                      <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
                        <BarChart3 size={24} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Efficiency Score</p>
                        <h3 className="text-xl font-bold text-white">98.2%</h3>
                        <p className="text-[10px] text-green-400 flex items-center gap-1">
                          <TrendingUp size={10} /> +2.4% this week
                        </p>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-4 flex items-center gap-4 border-l-4 border-l-purple-500">
                      <div className="p-3 bg-purple-500/10 rounded-full text-purple-400">
                        <Clock size={24} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Avg. Response</p>
                        <h3 className="text-xl font-bold text-white">1h 45m</h3>
                        <p className="text-[10px] text-slate-400">Top 5% of industry</p>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
                      <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
                        <CheckCircle size={24} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Auto-Compliance</p>
                        <h3 className="text-xl font-bold text-white">142</h3>
                        <p className="text-[10px] text-slate-400">Tickets passed by AI</p>
                      </div>
                    </GlassCard>
                  </div>

                  <GlassCard className="p-6 border-slate-800 bg-slate-900/40 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Activity size={16} className="text-primary" />
                        Live System Health
                      </h3>
                      <span className="text-xs text-green-400 flex items-center gap-1 pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Operational
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="group">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 group-hover:text-slate-300 transition-colors">API Latency</span>
                          <span className="text-slate-400">24ms</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 w-[2%] group-hover:w-[3%] transition-all duration-1000" />
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 group-hover:text-slate-300 transition-colors">Database Load</span>
                          <span className="text-slate-400">12%</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[12%] group-hover:w-[15%] transition-all duration-1000" />
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </>
              ) : (
                filteredTickets.map(ticket => (
                  <GlassCard key={ticket._id} className="p-6 group hover:border-primary/30 transition-all">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${ticket.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                            {ticket.priority}
                          </span>
                          <span className="text-xs text-slate-500">#{ticket.referenceID || ticket._id}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(ticket.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{ticket.title}</h3>
                          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">{ticket.description}</p>
                        </div>

                        <div className="flex gap-4 text-xs text-slate-500">
                          <p>Client: <span className="text-slate-300">{ticket.clientID?.name || 'Unknown'}</span></p>
                          <p>Email: <span className="text-slate-300">{ticket.contact_email}</span></p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 min-w-[200px] justify-end">
                        <GlassButton
                          variant="primary"
                          className="h-10 text-sm bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                          onClick={() => openApproveModal(ticket._id)}
                          isLoading={processing === ticket._id}
                        >
                          <CheckCircle size={16} />
                          Approve
                        </GlassButton>

                        <GlassButton
                          variant="danger"
                          className="h-10 text-sm"
                          onClick={() => handleClose(ticket._id)}
                          isLoading={processing === ticket._id}
                        >
                          <XCircle size={16} />
                          Reject
                        </GlassButton>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          ) : activeTab === 'track' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                <span className="text-xs text-slate-500 uppercase tracking-widest">Real-time Tracking</span>
                <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-400">Loading tracked tickets...</div>
              ) : filteredTracked.length === 0 ? (
                <GlassCard className="text-center py-12 text-slate-400">
                  No active tickets found in tracking.
                </GlassCard>
              ) : (
                filteredTracked.map(ticket => (
                  <GlassCard key={ticket._id} className="p-0 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-white/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {ticket.title}
                            <span className="text-xs font-normal text-slate-400 border border-slate-700 rounded px-1.5 py-0.5">#{ticket.referenceID?.slice(0, 8)}</span>
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">Status: <span className="text-primary">{ticket.status}</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                          {ticket.status !== 'In Compliance Review' && (
                            <GlassButton
                              className="h-8 text-xs bg-white/5 hover:bg-white/10"
                              onClick={() => fetchHistory(ticket.referenceID)}
                            >
                              <History size={14} className="mr-1" /> History
                            </GlassButton>
                          )}
                          <div className={`px-3 py-1 rounded-full text-xs border ${ticket.priority === 'Urgent' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}>
                            {ticket.priority}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trackers */}
                    <div className="p-6 space-y-8 bg-slate-950/30">
                      {(!ticket.assignments || ticket.assignments.length === 0) && (
                        <div className="text-center text-slate-500 text-sm italic py-4">
                          Ticket is being processed by Compliance...
                        </div>
                      )}

                      {ticket.assignments?.map((assign, idx) => {
                        const step1Complete = true;
                        const step2Active = true;
                        const step2Complete = assign.status !== 'Not Assigned';
                        const step3Active = assign.status !== 'Not Assigned';
                        const step3Complete = assign.assigned_team_lead_id || ['Assigned to Team Lead', 'In Progress', 'Resolved'].includes(assign.status);

                        return (
                          <div key={idx} className="relative">
                            <div className="absolute -top-3 left-0 text-xs font-bold text-slate-400 bg-slate-900/80 px-2 rounded border border-slate-800">
                              {assign.department} Department
                            </div>

                            <div className="flex items-center justify-between pt-6 px-4">
                              <TrackerStep label="Approved" completed={step1Complete} />
                              <TrackerStep label={`${assign.department} Assigned`} completed={step2Complete} active={step2Active} />
                              <TrackerStep label="Team Lead" completed={step3Complete} active={step3Active} isLast />
                            </div>

                            <div className="mt-6 ml-2 flex items-center gap-2 text-sm text-blue-300 bg-blue-500/5 px-3 py-2 rounded-lg border border-blue-500/10 max-w-fit">
                              <Clock size={14} />
                              <span>
                                Assigned to <span className="font-bold text-blue-200">{assign.department}</span> Department.
                                Work is: <span className="italic opacity-80">{assign.status || 'Pending'}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </GlassCard>
                ))
              )}
            </div>
          ) : activeTab === 'pending' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
                <span className="text-xs text-amber-400 uppercase tracking-widest font-medium">Pending Final Review</span>
                <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-400">Loading pending tickets...</div>
              ) : pendingCloseTickets.length === 0 ? (
                <GlassCard className="text-center py-12 text-slate-400">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-green-500/50" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No Pending Closures</h3>
                  <p className="text-slate-400 max-w-sm mx-auto mt-2">All tickets have been processed. New tickets will appear here when all department work is resolved.</p>
                </GlassCard>
              ) : (
                pendingCloseTickets.map(ticket => (
                  <GlassCard key={ticket._id} className="p-6 border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Ready to Close
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${ticket.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            ticket.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                              'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}>
                            {ticket.priority}
                          </span>
                          {ticket.warningFlag && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                              <AlertOctagon size={12} /> Reopened
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white">{ticket.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{ticket.description?.slice(0, 100)}...</p>
                      </div>
                      <GlassButton
                        className="text-sm py-2 h-auto bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                        onClick={() => handleCloseTicket(ticket._id)}
                        isLoading={processing === ticket._id}
                      >
                        <CheckCircle size={16} />
                        Close Ticket
                      </GlassButton>
                    </div>

                    {/* Department Reviews */}
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <h4 className="text-sm font-bold text-slate-300 mb-3">Department Reviews</h4>
                      <div className="space-y-3">
                        {ticket.assignments?.map((assign, idx) => (
                          <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                                  {assign.department} {assign.branch ? `(${assign.branch})` : ''}
                                </span>
                                {assign.teamLead && (
                                  <span className="text-xs text-slate-400">
                                    <User size={10} className="inline mr-1" />
                                    {assign.teamLead.name}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-green-400">✓ Resolved</span>
                            </div>
                            {assign.review_notes ? (
                              <p className="text-sm text-slate-300 italic">"{assign.review_notes}"</p>
                            ) : (
                              <p className="text-xs text-slate-500">No review notes provided</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center gap-4 text-xs text-slate-500">
                      <span>📧 {ticket.contact_email}</span>
                      <span>📞 {ticket.contact_phone}</span>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          ) : null}
        </div>

        {/* SIDEBAR ANALYTICS */}
        <div className="space-y-6">
          <GlassCard className="p-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Department Workload</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <XAxis dataKey="name" fontSize={10} stroke="#64748b" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {departmentData.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(d.count / (departmentData.reduce((a, b) => a + b.count, 0) || 1)) * 100}%` }} />
                    </div>
                    <span className="text-white font-bold">{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Recent Activity</h3>
            <div className="space-y-4">
              {ticketHistory.slice(0, 5).map((h, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-slate-600" />
                  <div>
                    <p className="text-slate-300">{h.status}</p>
                    <p className="text-slate-500 scale-90 origin-left">{new Date(h.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {ticketHistory.length === 0 && (
                <p className="text-slate-500 text-xs italic">No activity recorded recently.</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Approve Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md bg-slate-900 border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Assign Departments</h3>
            <p className="text-slate-400 text-sm mb-6">Select the departments needed to resolve this ticket.</p>

            <div className="space-y-3 mb-8">
              {AVAILABLE_DEPARTMENTS.map(dept => (
                <div
                  key={dept}
                  onClick={() => toggleDepartment(dept)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${selectedDepartments.includes(dept)
                    ? 'bg-primary/20 border-primary text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                >
                  <span className="font-medium">{dept} Department</span>
                  {selectedDepartments.includes(dept) && <CheckCircle size={16} className="text-primary" />}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <GlassButton
                variant="ghost"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancel
              </GlassButton>
              <GlassButton
                onClick={handleApprove}
                className="flex-1"
                isLoading={processing === selectedTicket}
              >
                Confirm & Assign
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl bg-slate-900 border-slate-700 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <History size={20} className="text-primary" />
                Audit Log
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {ticketHistory.length === 0 ? (
                <p className="text-center text-slate-500">No history found.</p>
              ) : (
                ticketHistory.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      {idx !== ticketHistory.length - 1 && <div className="w-[1px] bg-slate-800 flex-1 my-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-bold text-white">{item.status}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
