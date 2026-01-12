import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// TEMP: comment these if not created yet
// import ClientDashboard from './client/ClientDashboard';
// import ComplianceDashboard from './compliance/ComplianceDashboard';
// import ManagerDashboard from './manager/ManagerDashboard';
// import TeamLeadDashboard from './teamlead/TeamLeadDashboard';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 🔒 HARD GUARD
  if (!user) {
    return <div className="p-6">Loading user...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Welcome, {user.name || 'User'}
        </h1>

        <button
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="btn-secondary"
        >
          Logout
        </button>
      </div>

      <div className="glass p-4 rounded-xl flex flex-wrap gap-3">
        <Link to="/" className="btn-secondary">Home</Link>

        {user.role === 'CLIENT' && (
          <>
            <Link to="/client/create" className="btn-primary">Create Ticket</Link>
            <Link to="/client/tickets" className="btn-secondary">My Tickets</Link>
          </>
        )}

        {user.role === 'SUPER_ADMIN' && (
          <Link to="/compliance" className="btn-primary">Compliance Queue</Link>
        )}

        {user.role === 'ADMIN' && (
          <Link to="/manager" className="btn-primary">Manager Assignments</Link>
        )}

        {user.role === 'USER' && (
          <Link to="/teamlead" className="btn-primary">Team Lead Board</Link>
        )}
      </div>

      {/* COMMENT THESE UNTIL VERIFIED */}
      {/* {user.role === 'CLIENT' && <ClientDashboard />} */}
      {/* {user.role === 'SUPER_ADMIN' && <ComplianceDashboard />} */}
      {/* {user.role === 'ADMIN' && <ManagerDashboard />} */}
      {/* {user.role === 'USER' && <TeamLeadDashboard />} */}
    </div>
  );
}
