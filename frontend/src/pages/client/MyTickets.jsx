import { useEffect, useState } from 'react';
import api from '../../api/api';
import { useAuth } from '../../auth/AuthContext';

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/tickets/my-tickets');
        setTickets(res.data.tickets || []);
      } catch (err) {
        setError('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTickets();
  }, [user]);

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">My Tickets</h1>
      {error && <div className="text-red-400">{error}</div>}
      {tickets.length === 0 ? (
        <div className="glass p-4 rounded-lg text-white/70">No tickets yet.</div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t._id} className="glass p-4 rounded-lg text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-sm text-white/60">{t.status}</p>
                </div>
                <span className="text-xs text-white/60">Ref: {t.referenceID || t.reference_id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
