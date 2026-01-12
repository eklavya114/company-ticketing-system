import { useState } from 'react';
import api from '../../api/api';

export default function CreateTicket() {
  const [data, setData] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });

  const submit = async () => {
    await api.post('/tickets', data);
    alert('Ticket created');
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Create Ticket</h1>
      <input className="input" placeholder="Title"
        onChange={e => setData({ ...data, title: e.target.value })} />
      <textarea className="input mt-2" placeholder="Description"
        onChange={e => setData({ ...data, description: e.target.value })} />
      <select className="input mt-2"
        onChange={e => setData({ ...data, priority: e.target.value })}>
        <option>Low</option><option>Medium</option>
        <option>High</option><option>Urgent</option>
      </select>
      <button onClick={submit} className="btn-primary mt-4">Submit</button>
    </div>
  );
}
