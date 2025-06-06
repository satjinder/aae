import React, { useState, useCallback, useEffect } from 'react';
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
  Button,
  Collapse
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ChatIcon from '@mui/icons-material/Chat';
import { architectureService } from '../services/architectureService';
import type { Node } from '../services/architectureService';
import { architectureAgent, AgentResponse } from '../agents/architectureAgent';
import { HumanMessage, AIMessage } from "@langchain/core/messages";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ArchitectureChatProps {
  onAddNode: (node: Node) => void;
  onSearchNodes: (query: string) => Node[];
  onNodeAdded?: (node: Node) => void;
  onDiagramStateChange?: () => void;
}

export const ArchitectureChat: React.FC<ArchitectureChatProps> = ({
  onAddNode,
  onSearchNodes,
  onNodeAdded,
  onDiagramStateChange
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Set up message callback
  useEffect(() => {
    architectureAgent.setMessageCallback((message) => {
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date()
      }]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Get response from agent
      const response = await architectureAgent.invoke(input, messages.map(msg => 
        msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
      ));

      // Add the final answer to messages if it exists
      if (response.finalAnswer) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.finalAnswer,
          timestamp: new Date()
        }]);
      }

      // Notify parent about diagram state changes
      onDiagramStateChange?.();
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
            {messages.map((message, index) => (
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
                      backgroundColor: message.role === 'user' ? 'primary.light' : 'grey.100',
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
                {index < messages.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {isProcessing && (
              <ListItem sx={{ alignSelf: 'flex-start' }}>
                <CircularProgress size={20} />
              </ListItem>
            )}
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