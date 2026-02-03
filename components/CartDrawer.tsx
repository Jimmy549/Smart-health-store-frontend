'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';
import { Close, Delete } from '@mui/icons-material';
import { useCart } from '@/context/CartContext';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Shopping Cart</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {cart.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            Your cart is empty
          </Typography>
        ) : (
          <>
            <List>
              {cart.map((item) => (
                <ListItem
                  key={item._id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => removeFromCart(item._id)}>
                      <Delete />
                    </IconButton>
                  }
                  sx={{ px: 0 }}
                >
                  <ListItemText
                    primary={item.title}
                    secondary={`$${item.price.toFixed(2)} x ${item.quantity}`}
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Total:</Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                ${total.toFixed(2)}
              </Typography>
            </Box>

            <Button variant="contained" fullWidth sx={{ mb: 1 }}>
              Checkout
            </Button>
            <Button variant="outlined" fullWidth onClick={clearCart}>
              Clear Cart
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );
}
