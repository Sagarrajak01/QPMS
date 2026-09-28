import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import { ThemeProvider } from './context/ThemeContext';

// Admin Imports
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageFaculty from './pages/admin/ManageFaculty';
import ManageSubjects from './pages/admin/ManageSubjects';

// Faculty Imports
import FacultyLayout from './layouts/FacultyLayout';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import QuestionBank from './pages/faculty/QuestionBank';
import MySubjects from './pages/faculty/MySubjects';
import PaperManagement from './pages/faculty/PaperManagement';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="faculty" element={<ManageFaculty />} />
            <Route path="subjects" element={<ManageSubjects />} />
          </Route>
          
          {/* Faculty Routes */}
          <Route path="/faculty" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyLayout /></ProtectedRoute>}>
            <Route index element={<FacultyDashboard />} />
            <Route path="subjects" element={<MySubjects />} />
            <Route path="questions" element={<QuestionBank />} />
            {/* ONLY ONE route for papers now! */}
            <Route path="papers" element={<PaperManagement />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<div className="p-8 text-center text-xl">404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
