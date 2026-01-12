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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          <Route path="/client/create" element={
            <ProtectedRoute role="CLIENT"><CreateTicket /></ProtectedRoute>
          } />

          <Route path="/client/tickets" element={
            <ProtectedRoute role="CLIENT"><MyTickets /></ProtectedRoute>
          } />

          <Route path="/compliance" element={
            <ProtectedRoute role="SUPER_ADMIN"><ComplianceQueue /></ProtectedRoute>
          } />

          <Route path="/manager" element={
            <ProtectedRoute role="ADMIN"><ManagerAssignments /></ProtectedRoute>
          } />

          <Route path="/teamlead" element={
            <ProtectedRoute role="USER"><TeamLeadAssignments /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
