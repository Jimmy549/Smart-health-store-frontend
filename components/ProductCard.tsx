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
} from '@mui/material';
import { ShoppingCart, CheckCircle } from '@mui/icons-material';
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

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product);
    enqueueSnackbar(`${product.title} added to cart!`, { variant: 'success' });
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 345,
        mx: 'auto',
        transition: 'transform 0.2s',
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
  );
}