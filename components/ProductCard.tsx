'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { ShoppingCart, CheckCircle, Close } from '@mui/icons-material';
import { useCart } from '@/context/CartContext';
import { useSnackbar } from 'notistack';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  image: string;
  inStock: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { enqueueSnackbar } = useSnackbar();
  const [isAdding, setIsAdding] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product);
    enqueueSnackbar(`${product.title} added to cart!`, { variant: 'success' });
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <>
    <Card
      onClick={() => setOpen(true)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 345,
        mx: 'auto',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardMedia
        component="img"
        height="240"
        image={product.image}
        alt={product.title}
        sx={{ objectFit: 'cover', bgcolor: 'grey.200' }}
        onError={(e: any) => {
          e.target.src = 'https://via.placeholder.com/400x240?text=Product+Image';
        }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Typography gutterBottom variant="h6" component="h2" fontWeight="bold" sx={{ minHeight: 48, fontSize: '1rem' }}>
          {product.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, fontSize: '0.875rem' }}>
          {product.description.length > 80 ? product.description.substring(0, 80) + '...' : product.description}
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: 28 }}>
          {product.tags.slice(0, 2).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" sx={{ fontSize: '1.25rem' }}>
            ${product.price.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={isAdding ? <CheckCircle /> : <ShoppingCart />}
            disabled={!product.inStock}
            onClick={handleAddToCart}
            sx={{ 
              fontSize: '0.75rem',
              transition: 'all 0.3s',
              ...(isAdding && {
                bgcolor: 'success.main',
                '&:hover': { bgcolor: 'success.dark' },
              }),
            }}
          >
            {isAdding ? 'Added!' : 'Add'}
          </Button>
        </Box>
      </CardContent>
    </Card>

    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {product.title}
        <IconButton onClick={() => setOpen(false)} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <img
            src={product.image}
            alt={product.title}
            style={{ width: '100%', borderRadius: 8 }}
            onError={(e: any) => {
              e.target.src = 'https://via.placeholder.com/400x240?text=Product+Image';
            }}
          />
        </Box>
        <Typography variant="body1" paragraph>
          {product.description}
        </Typography>
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {product.tags.map((tag) => (
            <Chip key={tag} label={tag} color="primary" variant="outlined" />
          ))}
        </Box>
        <Typography variant="h5" color="primary" fontWeight="bold">
          ${product.price.toFixed(2)}
        </Typography>
        <Typography variant="body2" color={product.inStock ? 'success.main' : 'error.main'} sx={{ mt: 1 }}>
          {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={() => setOpen(false)}>Close</Button>
        <Button
          variant="contained"
          startIcon={isAdding ? <CheckCircle /> : <ShoppingCart />}
          disabled={!product.inStock}
          onClick={handleAddToCart}
          sx={{
            ...(isAdding && {
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' },
            }),
          }}
        >
          {isAdding ? 'Added to Cart!' : 'Add to Cart'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}