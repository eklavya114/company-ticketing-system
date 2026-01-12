import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/client/CreateTicket';
import MyTickets from './pages/client/MyTickets';
import ComplianceQueue from './pages/compliance/ComplianceQueue';
import ManagerAssignments from './pages/manager/ManagerAssignments';
import TeamLeadAssignments from './pages/teamlead/TeamLeadAssignments';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';

import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" theme="dark" richColors />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Route - Now at /dashboard or redirected from root if logged in?
              Actually, let's keep Dashboard at /dashboard to separate it from Landing Page.
              Or we can have conditional rendering at /.
              Let's put Dashboard at /dashboard and ProtectedRoute will handle it.
           */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />

          <Route path="/client/create" element={
            <ProtectedRoute role="CLIENT"><Layout><CreateTicket /></Layout></ProtectedRoute>
          } />

          <Route path="/client/tickets" element={
            <ProtectedRoute role="CLIENT"><Layout><MyTickets /></Layout></ProtectedRoute>
          } />

          <Route path="/compliance" element={
            <ProtectedRoute role="SUPER_ADMIN"><Layout><ComplianceQueue /></Layout></ProtectedRoute>
          } />

          <Route path="/manager" element={
            <ProtectedRoute role="ADMIN"><Layout><ManagerAssignments /></Layout></ProtectedRoute>
          } />

          <Route path="/teamlead" element={
            <ProtectedRoute role="USER"><Layout><TeamLeadAssignments /></Layout></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
