'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Mic, Keyboard, TrendingUp } from '@mui/icons-material';
import api from '@/utils/api';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/chat/analytics');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Voice Analytics Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track how users interact with the chatbot
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Mic sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3" fontWeight="bold">
              {stats?.voiceCount || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Voice Queries
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Keyboard sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h3" fontWeight="bold">
              {stats?.textCount || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Text Queries
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h3" fontWeight="bold">
              {stats?.voicePercentage || 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Voice Usage
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Voice Queries
            </Typography>
            {stats?.recentVoiceQueries?.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {stats.recentVoiceQueries.map((query: any, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Typography variant="body2" fontWeight="600">
                      {query.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(query.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No voice queries yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
