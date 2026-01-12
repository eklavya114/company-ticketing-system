import { useEffect, useState } from 'react';
import api from '../../api/api';

export default function ComplianceQueue() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get('/admin/compliance/queue').then(res => setTickets(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Compliance Queue</h1>
      {tickets.map(t => (
        <div key={t._id} className="card">
          <p>{t.title}</p>
        </div>
      ))}
    </div>
  );
}
