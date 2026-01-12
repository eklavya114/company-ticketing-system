import { useEffect, useState } from 'react';
import api from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { Search, Filter, Clock, AlertCircle } from 'lucide-react';

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await api.get('/tickets/my-tickets');
        setTickets(res.data.tickets || []);
      } catch (err) {
        console.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTickets();
  }, [user]);

  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(filter.toLowerCase()) ||
    (t.referenceID && t.referenceID.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">My Ticket History</h1>
        <div className="w-full md:w-64">
          <GlassInput
            icon={Search}
            placeholder="Search tickets..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="py-2"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <GlassCard className="text-center py-12 text-slate-400">
          {filter ? 'No tickets match your search.' : 'You haven\'t raised any tickets yet.'}
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map(t => (
            <GlassCard key={t._id} className="p-6 transition-all hover:bg-slate-800/40">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${t.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        t.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                      {t.priority}
                    </span>
                    <span className="text-xs text-slate-500">#{t.referenceID || t._id.slice(-6)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{t.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{t.description}</p>
                </div>

                <div className="flex flex-col items-end justify-between min-w-[150px]">
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${t.status === 'Closed' ? 'text-green-400' : 'text-primary'
                    }`}>
                    {t.status}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-4">
                    <Clock size={12} />
                    {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
