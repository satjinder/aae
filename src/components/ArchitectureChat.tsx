import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Collapse
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ChatIcon from '@mui/icons-material/Chat';
import { architectureAgent, type ChatMessage } from '../agents/architectureAgent';
import { useApiKey } from '../App';

interface ArchitectureChatProps {
  onDiagramStateChange?: () => void;
}

export const ArchitectureChat: React.FC<ArchitectureChatProps> = ({
  onDiagramStateChange
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { apiKey } = useApiKey();

  // Filter messages to exclude tool results
  const filteredMessages = useMemo(() => {
    return messages.filter(message => message.role !== 'tool');
  }, [messages]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages, scrollToBottom]);

  // Set up message callback and load initial history
  useEffect(() => {
    // Set up callback for new messages
    architectureAgent.setMessageCallback((newMessages) => {
      setMessages(newMessages);
    });
  }, []);

  // Set API key when available
  useEffect(() => {
    if (apiKey) {
      architectureAgent.setApiKey(apiKey);
    }
  }, [apiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setInput('');
    setIsProcessing(true);

    try {
      // Get response from agent
      await architectureAgent.invoke(input);
      
      // Notify parent about diagram state changes
      onDiagramStateChange?.();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}
    >
      <IconButton
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          mb: 1,
          '&:hover': {
            bgcolor: 'primary.dark'
          }
        }}
      >
        {isExpanded ? <ExpandLessIcon /> : <ChatIcon />}
      </IconButton>

      <Collapse in={isExpanded} orientation="vertical">
        <Paper
          elevation={3}
          sx={{
            width: 400,
            height: 600,
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease'
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Architecture Assistant</Typography>
            <IconButton size="small" onClick={() => setIsExpanded(false)}>
              <ExpandLessIcon />
            </IconButton>
          </Box>

          <List
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            {filteredMessages.map((message, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1,
                      backgroundColor: message.role === 'user' 
                        ? 'primary.light' 
                        : 'grey.100',
                      color: message.role === 'user' ? 'white' : 'text.primary'
                    }}
                  >
                    <ListItemText
                      primary={message.content}
                      secondary={message.timestamp.toLocaleTimeString()}
                      secondaryTypographyProps={{
                        color: message.role === 'user' ? 'white' : 'text.secondary'
                      }}
                    />
                  </Paper>
                </ListItem>
                {index < filteredMessages.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {isProcessing && (
              <ListItem sx={{ alignSelf: 'flex-start' }}>
                <CircularProgress size={20} />
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask about the architecture..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleSubmit}
                    disabled={!input.trim() || isProcessing}
                    color="primary"
                  >
                    <SendIcon />
                  </IconButton>
                )
              }}
            />
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
}; 