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
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import ChatProductCard from './ChatProductCard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  products?: Array<{
    name: string;
    category: string;
    price: number;
    image?: string;
    description?: string;
  }>;
}

export default function ChatWidget() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
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
  const chatBoxRef = useRef<HTMLDivElement>(null);

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

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && chatBoxRef.current && !chatBoxRef.current.contains(event.target as Node)) {
        const fabButton = document.querySelector('[aria-label="chat"]');
        if (fabButton && !fabButton.contains(event.target as Node)) {
          setOpen(false);
        }
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

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
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Check if this looks like a symptom description
      const isSymptomQuery = /\b(feel|feeling|have|experiencing|symptoms?|pain|hurt|ache|tired|weak|sick|ill|problem|issue|trouble|bukhar|fever|medicine|dawa|recommend|suggest|bimari|takleef|dard)\b/i.test(currentInput);
      
      let response;
      if (isSymptomQuery) {
        // Use symptom checker endpoint
        response = await api.post('/symptom-checker', { 
          symptoms: currentInput, 
          inputType 
        });
        
        if (response.data.success) {
          const { analysis, products, followUpQuestion } = response.data;
          
          // Add analysis message
          const analysisMessage: Message = {
            role: 'assistant',
            content: analysis,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, analysisMessage]);
          
          // Add product recommendations if any
          if (products && products.length > 0) {
            const productMessage: Message = {
              role: 'assistant',
              content: 'Here are some products that may help with your symptoms:',
              timestamp: new Date().toISOString(),
              products: products.map((p: any) => ({
                name: p.name,
                category: p.category,
                price: p.price,
                image: p.image,
                description: p.description
              }))
            };
            setMessages((prev) => [...prev, productMessage]);
          }
          
          // Add follow-up question if confidence is low
          if (followUpQuestion) {
            setTimeout(() => {
              const followUpMessage: Message = {
                role: 'assistant',
                content: followUpQuestion,
                timestamp: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, followUpMessage]);
            }, 1000);
          }
        } else {
          throw new Error(response.data.message);
        }
      } else {
        // Use regular chat endpoint
        response = await api.post('/chat', { message: currentInput, inputType });
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.message,
          timestamp: response.data.timestamp,
          products: response.data.products || []
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
      
      // Speak response if voice mode is enabled
      if (voiceMode || inputType === 'voice') {
        const textToSpeak = isSymptomQuery && response.data.success 
          ? response.data.analysis 
          : response.data.message;
        speakResponse(textToSpeak);
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
          ref={chatBoxRef}
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
                  {msg.products && msg.products.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {msg.products.map((product, idx) => (
                        <ChatProductCard 
                          key={idx} 
                          product={product}
                          onViewDetails={() => {
                            // Optional: Add product details modal or navigation
                            console.log('View details for:', product.name);
                          }}
                        />
                      ))}
                    </Box>
                  )}
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
                placeholder={isListening ? 'Listening...' : 'Describe your symptoms or ask about health products...'}
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
        onClick={() => {
          if (!isAuthenticated) {
            router.push('/login');
          } else {
            setOpen(!open);
          }
        }}
      >
        {open ? <Close /> : <Chat />}
      </Fab>
    </>
  );
}