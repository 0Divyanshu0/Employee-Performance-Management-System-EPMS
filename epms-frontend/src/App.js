import React, { useState, useEffect } from 'react';
// 1. Import routing components
import { Routes, Route, Navigate } from 'react-router-dom';

// Import your page components
// UPDATED: Changed all paths from './pages/' to './screens/'
import Login from "./screens/Login/Login.js";
import Home from "./screens/Home/Home.js";
import Employee from './screens/Employee/Employee.js';
import Admin from './screens/Admin/Admin.js';
import ManagerDashboard from './screens/Manager/ManagerDashboard.js';
import HRDashboard from './screens/HR/HRDashboard.js';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    // Check for user in sessionStorage on initial load
    const storedRole = sessionStorage.getItem('userRole');
    const storedName = sessionStorage.getItem('firstName');
    const storedId = sessionStorage.getItem('userID');
    
    if (storedRole && storedName && storedId) {
      setUser({ role: storedRole, firstName: storedName, id: storedId });
    }
    setLoading(false); // Finished checking auth
  }, []);

  const handleLoginSuccess = (userData) => {
    // This is your complete login handler
    const id = userData.id ?? userData.userID ?? userData.userId;

    sessionStorage.setItem('userRole', userData.role);
    sessionStorage.setItem('firstName', userData.firstName);
    sessionStorage.setItem('userID', id); 
    localStorage.setItem('userId', id);
    localStorage.setItem('firstName', userData.firstName ?? '');

    setUser({ ...userData, id });
  };

  const handleLogout = () => {
    // This is your complete logout handler
    sessionStorage.clear();
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    setUser(null);
  };

  /**
   * A component to protect routes that require login.
   */
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />; // Not authorized, send to home
    }
    return children;
  };

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // 2. UPDATED: Define the application's routes
  return (
    <Routes>
      {/* LOGIN PAGE */}
      <Route 
        path="/login" 
        element={
          !user ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" replace />
        } 
      />

      {/* EMPLOYEE DASHBOARD */}
      <Route 
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={['Employee']}>
            <Employee 
              userId={user?.id} 
              firstName={user?.firstName} 
              userRole={user?.role} 
              onLogout={handleLogout} 
            />
          </ProtectedRoute>
        } 
      />

      {/* MANAGER DASHBOARD */}
      {/* The "/*" is critical for nested routing to work! */}
      <Route 
        path="/manager/*" 
        element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <ManagerDashboard 
              user={user} 
              firstName={user?.firstName}
              userRole={user?.role}
              onLogout={handleLogout} 
            />
          </ProtectedRoute>
        } 
      />

      {/* HR DASHBOARD */}
      {/* UPDATED: Added /* to the end of the path */}
      <Route 
        path="/hr/*"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <HRDashboard 
              firstName={user?.firstName} 
              userRole={user?.role} 
              onLogout={handleLogout} 
            />
          </ProtectedRoute>
        } 
      />
      
      {/* ADMIN DASHBOARD */}
      <Route 
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Admin 
              firstName={user?.firstName} 
              userRole={user?.role} 
              onLogout={handleLogout} 
            />
          </ProtectedRoute>
        } 
      />
      
      {/* HOME/DEFAULT PAGE (Redirects logged-in users) */}
      <Route 
        path="/"
        element={
          <ProtectedRoute>
            {/* This logic figures out where to send a logged-in user */}
            {!user ? <Navigate to="/login" replace /> : 
             user.role === 'Employee' ? <Navigate to="/employee" replace /> :
             user.role === 'Manager' ? <Navigate to="/manager" replace /> :
             user.role === 'HR' ? <Navigate to="/hr" replace /> :
             user.role === 'Admin' ? <Navigate to="/admin" replace /> :
             // Fallback for any other role
             <Home 
               firstName={user?.firstName} 
               userRole={user?.role} 
               onLogout={handleLogout} 
             />
            }
          </ProtectedRoute>
        } 
      />

      {/* CATCH-ALL REDIRECT */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;