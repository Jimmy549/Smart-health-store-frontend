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
  Tooltip,
} from '@mui/material';
import { Chat, Close, Send, Mic, MicOff, VolumeUp, VolumeOff, RecordVoiceOver } from '@mui/icons-material';
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
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pendingVoiceSend, setPendingVoiceSend] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      } else {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          setPendingVoiceSend(true);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          // Auto-restart in voice mode
          if (voiceMode && !loading) {
            setTimeout(() => {
              try {
                recognitionRef.current?.start();
                setIsListening(true);
              } catch (e) {
                console.error('Error restarting recognition:', e);
              }
            }, 1000);
          }
        };
      }
      
      // Initialize speech synthesis
      synthRef.current = window.speechSynthesis;
    }
  }, [voiceMode, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-send when input changes in voice mode
  useEffect(() => {
    if (voiceMode && input && pendingVoiceSend && !loading) {
      setPendingVoiceSend(false);
      setTimeout(() => handleSend('voice'), 500);
    }
  }, [input, voiceMode, pendingVoiceSend, loading]);

  const handleVoiceInput = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const toggleVoiceMode = () => {
    const newVoiceMode = !voiceMode;
    setVoiceMode(newVoiceMode);
    
    if (newVoiceMode) {
      // Start listening when voice mode is enabled
      handleVoiceInput();
    } else {
      // Stop listening when voice mode is disabled
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  const handleSend = async (inputType: 'text' | 'voice' = 'text') => {
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
      const response = await api.post('/chat', { message: input, inputType });
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message,
        timestamp: response.data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Speak response if voice mode is enabled
      if (voiceMode || inputType === 'voice') {
        speakResponse(response.data.message);
      }
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
      handleSend('text');
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
              {voiceMode && (
                <Tooltip title="Voice Mode Active">
                  <RecordVoiceOver sx={{ fontSize: 20, animation: 'pulse 2s infinite' }} />
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={voiceMode ? 'Disable Voice Mode' : 'Enable Voice Mode'}>
                <IconButton 
                  size="small" 
                  onClick={toggleVoiceMode}
                  sx={{ 
                    color: 'white',
                    bgcolor: voiceMode ? 'rgba(255,255,255,0.2)' : 'transparent',
                  }}
                >
                  <RecordVoiceOver />
                </IconButton>
              </Tooltip>
              {isSpeaking && (
                <Tooltip title="Stop Speaking">
                  <IconButton size="small" onClick={stopSpeaking} sx={{ color: 'white' }}>
                    <VolumeOff />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </Box>
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
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title={isListening ? 'Stop recording' : 'Voice input'}>
                <IconButton
                  color={isListening ? 'error' : 'default'}
                  onClick={handleVoiceInput}
                  disabled={loading || !speechSupported || voiceMode}
                  sx={{
                    ...(isListening && {
                      animation: 'pulse 1.5s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }),
                  }}
                >
                  {isListening ? <MicOff /> : <Mic />}
                </IconButton>
              </Tooltip>
              <TextField
                fullWidth
                size="small"
                placeholder={isListening ? 'Listening...' : 'Ask me about health products...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading || isListening}
              />
              <IconButton
                color="primary"
                onClick={() => handleSend('text')}
                disabled={!input.trim() || loading}
              >
                <Send />
              </IconButton>
            </Box>
            {!speechSupported && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                Voice input not supported in this browser
              </Typography>
            )}
            {voiceMode && (
              <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block', fontWeight: 600 }}>
                🎙️ Voice Mode Active - Speak your query
              </Typography>
            )}
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