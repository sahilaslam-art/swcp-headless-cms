import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FeedbackPage from './pages/FeedbackPage';
import ContentEditorPage from './pages/ContentEditorPage';
import EnquiriesPage from './pages/EnquiriesPage';
import SettingsPage from './pages/SettingsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import IntegrationSetup from './pages/IntegrationSetup';
import VisualEditor from './pages/VisualEditor';

// Layout wrapper for authenticated admin pages
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex">
      <div className="noise-overlay"></div>
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Admin Routes */}
          <Route path="/" element={<ProtectedRoute><AdminLayout><DashboardPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AdminLayout><AnalyticsPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><AdminLayout><FeedbackPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/cms" element={<ProtectedRoute><AdminLayout><ContentEditorPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/visual-editor" element={<ProtectedRoute><AdminLayout><VisualEditor /></AdminLayout></ProtectedRoute>} />
          <Route path="/integration" element={<ProtectedRoute><AdminLayout><IntegrationSetup /></AdminLayout></ProtectedRoute>} />
          <Route path="/enquiries" element={<ProtectedRoute><AdminLayout><EnquiriesPage /></AdminLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AdminLayout><SettingsPage /></AdminLayout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
