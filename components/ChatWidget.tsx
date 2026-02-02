'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Slide,
} from '@mui/material';
import { Chat, Close, Send } from '@mui/icons-material';
import api from '@/utils/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Smart Health Store assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chat', { message: input });
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message,
        timestamp: response.data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            width: { xs: 'calc(100% - 48px)', sm: 400 },
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1300,
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chat />
              <Typography variant="h6" fontWeight="bold">
                Health Assistant
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: 2,
              bgcolor: '#f5f5f5',
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '85%',
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'white',
                    color: msg.role === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    ...(msg.role === 'user' && {
                      borderBottomRightRadius: 4,
                    }),
                    ...(msg.role === 'assistant' && {
                      borderBottomLeftRadius: 4,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }),
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      fontSize: '0.9rem',
                      '& strong': { fontWeight: 600 },
                      '& ul, & ol': { pl: 2, my: 1 },
                      '& li': { mb: 0.5 },
                    }}
                  >
                    {msg.content}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.7,
                      fontSize: '0.7rem',
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Typing...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #ddd' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask me about health products..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim() || loading}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>

      {/* Floating Button */}
      <Fab
        color="primary"
        aria-label="chat"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
        }}
        onClick={() => setOpen(!open)}
      >
        {open ? <Close /> : <Chat />}
      </Fab>
    </>
  );
}