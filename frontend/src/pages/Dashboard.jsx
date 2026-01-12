import React from 'react';
import { useAuth } from '../auth/AuthContext';
import ClientDashboard from './client/ClientDashboard';
import ComplianceQueue from './compliance/ComplianceQueue';
import ManagerAssignments from './manager/ManagerAssignments';
import TeamLeadAssignments from './teamlead/TeamLeadAssignments';
import { GlassCard } from '../components/ui/GlassCard';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center py-20 text-slate-400">Loading user profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Welcome back, {user.name}
          </h1>
          <p className="text-slate-400 mt-1">
            {user.role === 'CLIENT' && 'Client Portal'}
            {user.role === 'SUPER_ADMIN' && 'Compliance Administration'}
            {user.role === 'ADMIN' && 'Department Management'}
            {user.role === 'USER' && 'Technical Dashboard'}
          </p>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-300">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="mt-8">
        {user.role === 'CLIENT' && <ClientDashboard />}
        {user.role === 'SUPER_ADMIN' && <ComplianceQueue />}
        {user.role === 'ADMIN' && <ManagerAssignments />}
        {user.role === 'USER' && <TeamLeadAssignments />}

        {/* Fallback for unknown roles */}
        {!['CLIENT', 'SUPER_ADMIN', 'ADMIN', 'USER'].includes(user.role) && (
          <GlassCard className="text-center py-12 text-slate-400">
            Unauthorized access level. Please contact support.
          </GlassCard>
        )}
      </div>
    </div>
  );
}
