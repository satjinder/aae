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
  Typography,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import type { Node } from '../services/architectureService';
import { architectureService } from '../services/architectureService';

interface CreateNodeDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { 
    type: Node['type']; 
    name: string; 
    description?: string;
    relationType?: string;
    existingNodeId?: string;
  }) => void;
  sourceNode: Node;
}

export const CreateNodeDialog: React.FC<CreateNodeDialogProps> = ({
  open,
  onClose,
  onCreate,
  sourceNode
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Node['type']>('domainService');
  const [relationType, setRelationType] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [nodeSelectionType, setNodeSelectionType] = useState<'new' | 'existing'>('new');
  const [selectedExistingNode, setSelectedExistingNode] = useState<string>('');

  // Get allowed node types based on source node type
  const allowedNodeTypes = useMemo(() => {
    const allTypes: Node['type'][] = ['capability', 'domainService', 'api', 'event', 'dataProduct'];
    return allTypes.filter(targetType => {
      const allowedRelations = architectureService.getAllowedRelations(sourceNode.type, targetType);
      return allowedRelations.length > 0;
    });
  }, [sourceNode.type]);

  // Get available relation types for selected node type
  const availableRelationTypes = useMemo(() => {
    return architectureService.getAllowedRelations(sourceNode.type, type);
  }, [sourceNode.type, type]);

  // Get existing nodes of selected type
  const existingNodes = useMemo(() => {
    return architectureService.getNodesByType(type);
  }, [type]);

  // Set initial type to first allowed type
  React.useEffect(() => {
    if (allowedNodeTypes.length > 0) {
      setType(allowedNodeTypes[0]);
    }
  }, [allowedNodeTypes]);

  // Set initial relation type when type changes
  React.useEffect(() => {
    if (availableRelationTypes.length > 0) {
      setRelationType(availableRelationTypes[0]);
    }
  }, [availableRelationTypes]);

  const handleSubmit = () => {
    if (nodeSelectionType === 'new') {
      onCreate({
        type,
        name,
        description: description || undefined,
        relationType
      });
    } else {
      onCreate({
        type,
        name: '',
        relationType,
        existingNodeId: selectedExistingNode
      });
    }
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setType(allowedNodeTypes[0] || 'domainService');
    setRelationType('');
    setTabValue(0);
    setNodeSelectionType('new');
    setSelectedExistingNode('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Relation</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Creating relation from: {sourceNode.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Node ID: {sourceNode.id}
          </Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Target Node Type</InputLabel>
          <Select
            value={type}
            label="Target Node Type"
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

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Relation Type</InputLabel>
          <Select
            value={relationType}
            label="Relation Type"
            onChange={(e) => setRelationType(e.target.value)}
          >
            {availableRelationTypes.map(relType => (
              <MenuItem key={relType} value={relType}>
                {relType}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label="New Node" />
          <Tab label="Existing Node" />
        </Tabs>

        {tabValue === 0 ? (
          <>
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
          </>
        ) : (
          <FormControl fullWidth>
            <InputLabel>Select Existing Node</InputLabel>
            <Select
              value={selectedExistingNode}
              label="Select Existing Node"
              onChange={(e) => setSelectedExistingNode(e.target.value)}
            >
              {existingNodes.map(node => (
                <MenuItem key={node.id} value={node.id}>
                  {node.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={
            (tabValue === 0 && !name.trim()) || 
            (tabValue === 1 && !selectedExistingNode)
          }
        >
          Create Relation
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 