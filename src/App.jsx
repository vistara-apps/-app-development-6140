import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import CustomerForm from './pages/CustomerForm';
import OperatorPortal from './pages/OperatorPortal';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/quote" element={<CustomerForm />} />
                <Route path="/portal" element={<OperatorPortal />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </SupabaseProvider>
  );
}

export default App;