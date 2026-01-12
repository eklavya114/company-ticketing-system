import { useEffect, useState } from 'react';
import api from '../../api/api';

export default function TeamLeadAssignments() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get('/tl/team-lead/assignments')
      .then(res => setTasks(res.data.assignments));
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/tl/team-lead/assignments/${id}/status`, { status });
    alert('Updated');
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">My Tasks</h1>
      {tasks.map(t => (
        <div key={t._id} className="card">
          <p>{t.department}</p>
          <button onClick={() => updateStatus(t._id, 'Resolved')}
            className="btn-primary mt-2">Resolve</button>
        </div>
      ))}
    </div>
  );
}
