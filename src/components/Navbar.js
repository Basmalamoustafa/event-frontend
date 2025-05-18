import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AppNavbar = ({ isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <Navbar bg={isDarkMode ? 'dark' : 'light'} variant={isDarkMode ? 'dark' : 'light'} expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">{t("Event Booker")}</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">{t("Browse Events")}</Nav.Link>
            {token && <Nav.Link as={Link} to="/bookings">{t("My Bookings")}</Nav.Link>}
            {token && role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin/events">{t("Admin: Manage Events")}</Nav.Link>
                <Nav.Link as={Link} to="/admin/users">{t("Admin: Manage Users")}</Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="align-items-center">
            {/* Language Switcher */}
            <Button
              variant="outline-secondary"
              className="me-2"
              onClick={() => i18n.changeLanguage('en')}
              disabled={i18n.language === 'en'}
            >
              EN
            </Button>
            <Button
              variant="outline-secondary"
              className="me-2"
              onClick={() => i18n.changeLanguage('ar')}
              disabled={i18n.language === 'ar'}
            >
              عربي
            </Button>
            {/* Dark Mode Toggle Button */}
            <Button 
              variant={isDarkMode ? 'light' : 'dark'} 
              onClick={toggleDarkMode} 
              className="me-2"
            >
              {isDarkMode ? t('Light Mode') : t('Dark Mode')}
            </Button>
            {token ? (
              <Button variant="outline-danger" onClick={handleLogout} className="btn-logout">
                {t("Logout")}
              </Button>
            ) : (
              <>
                <Button variant="outline-primary" as={Link} to="/login" className="me-2 btn-login">
                  {t("Log In")}
                </Button>
                <Button variant="primary" as={Link} to="/register" className="btn-register">
                  {t("Register")}
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;