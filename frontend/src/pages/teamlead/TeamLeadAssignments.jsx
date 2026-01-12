import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { ClipboardList, PlayCircle, Eye, X, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamLeadAssignments() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  // Modal state
  const [selectedTask, setSelectedTask] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tl/team-lead/assignments');
      setTasks(res.data.assignments || []);
    } catch (err) {
      console.error('Failed to fetch team lead tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (assignmentId, status, notes = null) => {
    setProcessing(assignmentId);
    try {
      await api.patch(`/tl/team-lead/assignments/${assignmentId}/status`, {
        status,
        reviewNotes: notes
      });
      toast.success(`Task marked as ${status}`);
      await fetchTasks();
      closeModal();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setProcessing(null);
    }
  };

  const openReviewModal = async (task) => {
    setSelectedTask(task);
    setLoadingDetails(true);
    setReviewNotes('');

    try {
      // Get ticket ID (could be ObjectId or string)
      const ticketId = task.ticket_id?._id || task.ticket_id;
      const res = await api.get(`/tickets/${ticketId}`);
      setTicketDetails(res.data.ticket);
    } catch (err) {
      console.error('Failed to load ticket details:', err);
      toast.error('Failed to load ticket details');
      setTicketDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedTask(null);
    setTicketDetails(null);
    setReviewNotes('');
  };

  const handleResolve = () => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide review notes before resolving');
      return;
    }
    updateStatus(selectedTask._id, 'Resolved', reviewNotes);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <ClipboardList size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-slate-400 text-sm">Track and resolve assigned tickets</p>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <GlassCard className="text-center py-12 text-slate-400">
            You have no pending tasks. Great job!
          </GlassCard>
        ) : (
          tasks.map(task => (
            <GlassCard key={task._id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${task.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                      {task.status}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {task.department}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Ticket #{String(task.ticket_id).slice(-6)}</h3>
                  <p className="text-slate-400 text-sm">Assigned: {new Date(task.assignedAt || task.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-2">
                  {task.status !== 'In Progress' && task.status !== 'Resolved' && (
                    <GlassButton
                      className="text-sm py-2 h-auto"
                      onClick={() => updateStatus(task._id, 'In Progress')}
                      isLoading={processing === task._id}
                    >
                      <PlayCircle size={16} />
                      Start Work
                    </GlassButton>
                  )}

                  {task.status === 'In Progress' && (
                    <GlassButton
                      className="text-sm py-2 h-auto bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
                      onClick={() => openReviewModal(task)}
                    >
                      <Eye size={16} />
                      Start Review
                    </GlassButton>
                  )}

                  {task.status === 'Resolved' && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle2 size={16} />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* TICKET DETAIL & REVIEW MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Review Ticket</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {loadingDetails ? (
                <div className="text-center py-8 text-slate-400">Loading ticket details...</div>
              ) : ticketDetails ? (
                <>
                  {/* Ticket Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${ticketDetails.priority === 'Urgent' ? 'bg-red-500/20 text-red-400' :
                        ticketDetails.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                          ticketDetails.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-slate-500/20 text-slate-400'
                        }`}>
                        {ticketDetails.priority} Priority
                      </span>
                      <span className="text-slate-500 text-sm">
                        Created: {new Date(ticketDetails.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{ticketDetails.title}</h3>
                      <p className="text-slate-300 whitespace-pre-wrap">{ticketDetails.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Contact Email</p>
                        <p className="text-sm text-white">{ticketDetails.contact_email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Contact Phone</p>
                        <p className="text-sm text-white">{ticketDetails.contact_phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Review Notes */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300">
                      Resolution Notes <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Describe how you resolved this issue, any actions taken, and recommendations for the client..."
                      className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary resize-none"
                    />
                    <p className="text-xs text-slate-500">This review will be visible to the Compliance team and the client.</p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                    <GlassButton
                      className="text-sm py-2 h-auto"
                      onClick={closeModal}
                    >
                      Cancel
                    </GlassButton>
                    <GlassButton
                      className="text-sm py-2 h-auto bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                      onClick={handleResolve}
                      isLoading={processing === selectedTask._id}
                    >
                      <Send size={16} />
                      Mark Resolved & Submit
                    </GlassButton>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-red-400">Failed to load ticket details</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
