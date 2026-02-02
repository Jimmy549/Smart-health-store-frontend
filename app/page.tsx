'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  TextField,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  InputAdornment,
  Alert,
} from '@mui/material';
import { Search, Psychology, TextFields } from '@mui/icons-material';
import ProductCard from '@/components/ProductCard';
import ChatWidget from '@/components/ChatWidget';
import api from '@/utils/api';
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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'normal' | 'ai'>('normal');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (query = '', type: 'normal' | 'ai' = 'normal') => {
    setLoading(true);
    try {
      const response = await api.get('/products', {
        params: { query, searchType: type },
      });
      setProducts(response.data);
    } catch (error: any) {
      enqueueSnackbar('Error loading products', { variant: 'error' });
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProducts(searchQuery, searchType);
  };

  const handleSearchTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: 'normal' | 'ai' | null,
  ) => {
    if (newType !== null) {
      setSearchType(newType);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4, md: 6 } }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}>
            Welcome to Smart Health Store
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: { xs: 2, sm: 3, md: 4 }, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }}>
            AI-Powered Healthcare Products for Your Wellness Journey
          </Typography>

          {/* Search Section */}
          <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <ToggleButtonGroup
                value={searchType}
                exclusive
                onChange={handleSearchTypeChange}
                aria-label="search type"
                size="small"
                sx={{ flexWrap: 'wrap' }}
              >
                <ToggleButton value="normal" aria-label="normal search" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  <TextFields sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Normal Search</Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Normal</Box>
                </ToggleButton>
                <ToggleButton value="ai" aria-label="ai search" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  <Psychology sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>AI Intent Search</Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>AI Search</Box>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <TextField
              fullWidth
              placeholder={
                searchType === 'normal'
                  ? 'Search products by name...'
                  : 'Describe your health needs (e.g., "I have weak bones")'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderWidth: 2,
                  },
                },
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
              }}
            />

            {searchType === 'ai' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  <strong>AI Intent Search:</strong> Describe your health concern in natural language,
                  and our AI will find products that match your needs based on health tags.
                </Typography>
              </Alert>
            )}
          </Box>
        </Box>

        {/* Products Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              No products found. Try a different search query.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h5" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 'bold', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {searchQuery
                ? `Search Results (${products.length})`
                : `All Products (${products.length})`}
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {products.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>

      {/* Chat Widget */}
      <ChatWidget />
    </>
  );
}