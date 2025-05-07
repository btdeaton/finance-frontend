import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children, title }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Personal Finance
          </Typography>
          <Button color="inherit" component={Link} to="/">Dashboard</Button>
          <Button color="inherit" component={Link} to="/transactions">Transactions</Button>
          <Button color="inherit" component={Link} to="/categories">Categories</Button>
          <Button color="inherit" component={Link} to="/budgets">Budgets</Button>
          <Button color="inherit" component={Link} to="/reports">Reports</Button>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {title && (
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
        )}
        {children}
      </Container>
    </>
  );
};

export default Layout;