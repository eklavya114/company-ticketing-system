import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { Users, UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'sonner';

export default function ManagerAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  // Active dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);

  // TEAM LEADS - Real User IDs from Database
  // Add more team leads as you create them in your system
  const TEAM_LEADS = [
    { id: '69638f2c4fe1ff292ad005fa', name: 'Resume Team Lead 1', role: 'Resume Team Lead', department: 'Resume' },
    { id: '6963da2c16776789387192be', name: 'Marketing Team Lead AHM', role: 'Marketing Team Lead', department: 'Marketing', branch: 'AHM' }
    // Add more team leads here as you create them:
    // { id: 'YOUR_TECH_TL_ID', name: 'Tech Lead Name', role: 'Technical Team Lead', department: 'Technical' },
    // { id: 'YOUR_SALES_TL_ID', name: 'Sales Lead Name', role: 'Sales Team Lead', department: 'Sales' },
  ];

  // Filter leads based on current manager's department if needed, 
  // or just show all/relevant ones. 
  // For now, simple logic: show all or filter by name matching department.
  const relevantLeads = TEAM_LEADS.filter(lead =>
    !user?.department || lead.role.includes(user.department)
  );
  // Fallback if no specific match (for testing): show all
  const displayLeads = relevantLeads.length > 0 ? relevantLeads : TEAM_LEADS;

  useEffect(() => {
    fetchAssignments();

    // Close dropdown when clicking outside
    const closeDropdown = (e) => {
      if (!e.target.closest('.assignment-dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/department/manager/assignments');
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error('Failed to fetch manager assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMember = async (assignmentId, teamLeadId, leadName) => {
    setProcessing(assignmentId);
    setOpenDropdown(null); // Close dropdown immediately
    try {
      await api.post(`/department/manager/assignments/${assignmentId}/assign`, {
        teamLeadId
      });
      toast.success(`Task assigned to ${leadName} successfully!`);
      // Refresh list to show updated status/assignment
      await fetchAssignments();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to assign team lead.';
      toast.error(errorMsg);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Department Assignments</h1>
          <p className="text-slate-400 text-sm">Manage ticket assignments for {user?.department || 'your department'}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <GlassCard className="text-center py-12 text-slate-400">
            No pending assignments found.
          </GlassCard>
        ) : (
          assignments.map(item => (
            <GlassCard key={item._id} className="p-6 overflow-visible relative">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">
                      {item.taskType || 'Task'}
                    </span>
                    <span className="text-xs text-slate-500">Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Ticket #{item.ticketId}</h3>
                  <p className="text-sm text-slate-400">Status: <span className="text-slate-200">{item.status}</span></p>
                </div>

                <div className="flex flex-col gap-2 relative assignment-dropdown">
                  {item.assignedTo ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle size={16} />
                      <span>Assigned: {item.assignedTo.name || item.assignedTo}</span>
                    </div>
                  ) : (
                    <>
                      <GlassButton
                        className="text-sm py-2 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === item._id ? null : item._id);
                        }}
                        isLoading={processing === item._id}
                      >
                        <UserPlus size={16} />
                        Assign Lead
                      </GlassButton>

                      {/* DROPDOWN MENU */}
                      {openDropdown === item._id && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="p-2 border-b border-slate-700">
                            <h4 className="text-xs font-bold text-slate-400 uppercase">Select Team Lead</h4>
                          </div>
                          <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {displayLeads.map(lead => (
                              <button
                                key={lead.id}
                                onClick={() => handleAssignMember(item._id, lead.id, lead.name)}
                                className="w-full text-left p-3 hover:bg-slate-800 transition-colors flex items-center gap-3 group"
                              >
                                <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                  {lead.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm text-white font-medium">{lead.name}</p>
                                  <p className="text-[10px] text-slate-500">{lead.role}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
