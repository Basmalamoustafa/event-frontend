import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import EventList from './pages/EventList';
import LoginPage from './pages/LoginPage';
import MyBookings from './pages/BookingsPage';
import Register from './pages/Register';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventForm from './pages/admin/AdminEventForm';
import AdminUsers from './pages/admin/AdminUsers';
import Congratulations from './pages/Congratulations';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useDarkMode from './hooks/useDarkMode';
import { useTranslation } from 'react-i18next';

function App() {
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // RTL support for Arabic
  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <Router>
      <div className="App">
        <AppNavbar 
          isDarkMode={isDarkMode} 
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
        />
        <ToastContainer position="top-center" />
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/events/new" element={<AdminEventForm />} />
          <Route path="/admin/events/:id/edit" element={<AdminEventForm />} />
          <Route path="/congratulations" element={<Congratulations />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;