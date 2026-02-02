'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Badge } from '@mui/material';
import { LocalHospital, Logout, ShoppingCart } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();

  return (
    <AppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ bgcolor: '#1976d2' }}>
          <LocalHospital sx={{ mr: { xs: 1, sm: 2 } }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
            onClick={() => router.push('/')}
          >
            Smart Health Store
          </Typography>

          <IconButton color="inherit" sx={{ mr: { xs: 1, sm: 2 } }}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Welcome, {user?.name}
              </Typography>
              <IconButton
                color="inherit"
                onClick={logout}
                size="small"
                sx={{ display: { xs: 'flex', sm: 'none' } }}
              >
                <Logout />
              </IconButton>
              <Button
                color="inherit"
                startIcon={<Logout />}
                onClick={logout}
                variant="outlined"
                size="small"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
              <Button 
                color="inherit" 
                onClick={() => router.push('/login')}
                size="small"
              >
                Login
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => router.push('/signup')}
                size="small"
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}