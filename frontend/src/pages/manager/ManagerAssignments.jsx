import { useEffect, useState } from 'react';
import api from '../../api/api';

export default function ManagerAssignments() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    api.get('/department/manager/assignments')
      .then(res => setAssignments(res.data.assignments));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">My Department Tasks</h1>
      {assignments.map(a => (
        <div key={a._id} className="card">
          <p>{a.department}</p>
          <p>Status: {a.status}</p>
        </div>
      ))}
    </div>
  );
}
