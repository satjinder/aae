import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import type { Node } from '../services/architectureService';

interface CreateNodeDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { type: Node['type']; name: string; description?: string }) => void;
  sourceNode: Node;
}

export const CreateNodeDialog: React.FC<CreateNodeDialogProps> = ({
  open,
  onClose,
  onAdd,
  sourceNode
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Node['type']>('service_domain');

  const handleSubmit = () => {
    onAdd({
      type,
      name,
      description: description || undefined
    });
    setName('');
    setDescription('');
    setType('service_domain');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Node</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Creating node from: {sourceNode.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Node ID: {sourceNode.id}
          </Typography>
        </Box>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth>
          <InputLabel>Node Type</InputLabel>
          <Select
            value={type}
            label="Node Type"
            onChange={(e) => setType(e.target.value as Node['type'])}
          >
            <MenuItem value="business_area">Business Area</MenuItem>
            <MenuItem value="business_domain">Business Domain</MenuItem>
            <MenuItem value="service_domain">Service Domain</MenuItem>
            <MenuItem value="api">API</MenuItem>
            <MenuItem value="event">Event</MenuItem>
            <MenuItem value="bom">Business Object Model</MenuItem>
            <MenuItem value="system">System</MenuItem>
            <MenuItem value="dev_team">Development Team</MenuItem>
            <MenuItem value="business_team">Business Team</MenuItem>
            <MenuItem value="business_owner">Business Owner</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!name.trim()}
        >
          Create Node
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 