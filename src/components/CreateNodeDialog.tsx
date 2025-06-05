import React, { useState, useMemo } from 'react';
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
import { architectureService } from '../services/architectureService';

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
  const [type, setType] = useState<Node['type']>('domainService');

  // Get allowed node types based on source node type
  const allowedNodeTypes = useMemo(() => {
    const allTypes: Node['type'][] = ['capability', 'domainService', 'api', 'event', 'dataProduct'];
    return allTypes.filter(targetType => {
      const allowedRelations = architectureService.getAllowedRelations(sourceNode.type, targetType);
      return allowedRelations.length > 0;
    });
  }, [sourceNode.type]);

  // Set initial type to first allowed type
  React.useEffect(() => {
    if (allowedNodeTypes.length > 0) {
      setType(allowedNodeTypes[0]);
    }
  }, [allowedNodeTypes]);

  const handleSubmit = () => {
    onAdd({
      type,
      name,
      description: description || undefined
    });
    setName('');
    setDescription('');
    setType(allowedNodeTypes[0] || 'domainService');
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
          label="Label"
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
            {allowedNodeTypes.map(nodeType => (
              <MenuItem key={nodeType} value={nodeType}>
                {nodeType === 'domainService' ? 'Domain Service' :
                 nodeType === 'api' ? 'API' :
                 nodeType === 'event' ? 'Event' :
                 nodeType === 'dataProduct' ? 'Data Product' :
                 'Capability'}
              </MenuItem>
            ))}
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