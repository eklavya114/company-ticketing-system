import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { AlertCircle, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'sonner';

export default function CreateTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    contact_email: user?.email || '',
    contact_phone: user?.phone || ''
  });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tickets', data);
      toast.success('Ticket created successfully!');
      navigate('/client/tickets');
    } catch (err) {
      console.error("T:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown Error';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-white">Raise New Ticket</h1>
      </div>

      <GlassCard>
        <form onSubmit={submit} className="space-y-6">
          <GlassInput
            placeholder="Issue Title"
            value={data.title}
            onChange={e => setData({ ...data, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <select
                className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-100 rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 appearance-none"
                value={data.priority}
                onChange={e => setData({ ...data, priority: e.target.value })}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <AlertCircle size={18} />
              </div>
            </div>

            <GlassInput
              placeholder="Contact Phone"
              value={data.contact_phone}
              onChange={e => setData({ ...data, contact_phone: e.target.value })}
              required
            />
          </div>

          <textarea
            className="w-full h-32 bg-slate-900/50 border border-slate-700/50 text-slate-100 rounded-xl px-4 py-3 placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none"
            placeholder="Describe your issue in detail..."
            value={data.description}
            onChange={e => setData({ ...data, description: e.target.value })}
            required
          />

          <GlassButton type="submit" className="w-full" isLoading={loading}>
            <Send size={18} />
            Submit Ticket
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
