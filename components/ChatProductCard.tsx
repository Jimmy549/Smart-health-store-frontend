import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import { ShoppingCart, Info } from '@mui/icons-material';
import { useCart } from '@/context/CartContext';

interface ChatProductCardProps {
  product: {
    name: string;
    category: string;
    price: number;
    image?: string;
    description?: string;
  };
  onViewDetails?: () => void;
}

export default function ChatProductCard({ product, onViewDetails }: ChatProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      _id: product.name.toLowerCase().replace(/\s+/g, '-'),
      title: product.name,
      price: product.price,
      image: product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      description: product.description || '',
      tags: [product.category.toLowerCase()],
      inStock: true
    });
  };

  return (
    <Card sx={{ maxWidth: 280, mb: 1, boxShadow: 2 }}>
      <CardMedia
        component="img"
        height="120"
        image={product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'}
        alt={product.name}
      />
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          {product.name}
        </Typography>
        <Chip 
          label={product.category} 
          size="small" 
          sx={{ mb: 1, fontSize: '0.7rem' }}
        />
        <Typography variant="h6" color="primary" fontWeight="bold">
          ${product.price}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={handleAddToCart}
            sx={{ flex: 1, fontSize: '0.7rem' }}
          >
            Add to Cart
          </Button>
          {onViewDetails && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Info />}
              onClick={onViewDetails}
              sx={{ fontSize: '0.7rem' }}
            >
              Details
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}