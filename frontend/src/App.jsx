import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

// Logout component that clears localStorage and redirects to Login
function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

// Clear localStorage and redirect to Register
function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <div className="center">
      <Router>
        <Routes>
          {/* Protected HomePage Route */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<RegisterAndLogout />} />

          {/* Catch-all route for 404 */}
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;