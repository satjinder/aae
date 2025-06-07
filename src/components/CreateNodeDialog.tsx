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
  Radio,
  Alert,
  Snackbar
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
  const [type, setType] = useState<Node['type']>('business_area');
  const [relationType, setRelationType] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [nodeSelectionType, setNodeSelectionType] = useState<'new' | 'existing'>('new');
  const [selectedExistingNode, setSelectedExistingNode] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Get allowed node types based on source node type
  const allowedNodeTypes = useMemo(() => {
    const allTypes: Node['type'][] = ['business_area', 'business_domain', 'service_domain', 'api', 'event', 'bom'];
    return allTypes.filter(targetType => {
      const allowedRelations = architectureService.getAllowedRelations(sourceNode.type, targetType);
      return allowedRelations.length > 0;
    });
  }, [sourceNode.type]);

  // Get available relation types for selected node type
  const availableRelationTypes = useMemo(() => {
    // Define the valid relation types based on architecture.json
    const validRelations: Record<Node['type'], string[]> = {
      'business_area': ['contains', 'integrates with', 'governs', 'shares data with'],
      'business_domain': ['implements', 'collaborates with'],
      'service_domain': ['exposes', 'publishes', 'implements'],
      'api': ['depends on'],
      'event': ['triggers'],
      'bom': ['represents'],
      'system': ['implements', 'depends on'],
      'dev_team': ['maintains', 'develops'],
      'business_team': ['owns', 'manages'],
      'business_owner': ['owns', 'approves']
    };

    // Get the allowed relations from the architecture service
    const allowedRelations = architectureService.getAllowedRelations(sourceNode.type, type);
    
    // Filter to only include valid relations from our architecture
    return allowedRelations.filter(relation => 
      validRelations[sourceNode.type]?.includes(relation) || 
      validRelations[type]?.includes(relation)
    );
  }, [sourceNode.type, type]);

  // Get existing nodes of selected type
  const existingNodes = useMemo(() => {
    return architectureService.getNodesByType(type).filter(node => node.id !== sourceNode.id);
  }, [type, sourceNode.id]);

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
      setSuccessMessage(`Created new ${type} "${name}" with relation "${relationType}" from ${sourceNode.name}`);
    } else {
      const targetNode = existingNodes.find(node => node.id === selectedExistingNode);
      onCreate({
        type,
        name: '',
        relationType,
        existingNodeId: selectedExistingNode
      });
      setSuccessMessage(`Created relation "${relationType}" between ${sourceNode.name} and ${targetNode?.name || 'selected node'}`);
    }
    setShowSuccess(true);
    
    // Close dialog after showing success message
    setTimeout(() => {
      resetForm();
      onClose();
    }, 2000);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setType(allowedNodeTypes[0] || 'business_area');
    setRelationType('');
    setTabValue(0);
    setNodeSelectionType('new');
    setSelectedExistingNode('');
    setShowSuccess(false);
    setSuccessMessage('');
  };

  return (
    <>
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
                  {nodeType === 'business_area' ? 'Business Area' :
                   nodeType === 'business_domain' ? 'Business Domain' :
                   nodeType === 'service_domain' ? 'Service Domain' :
                   nodeType === 'api' ? 'API' :
                   nodeType === 'event' ? 'Event' :
                   nodeType === 'bom' ? 'Business Object Model' :
                   nodeType}
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
                  {relType === 'contains' ? 'Contains' :
                   relType === 'implements' ? 'Implements' :
                   relType === 'exposes' ? 'Exposes' :
                   relType === 'publishes' ? 'Publishes' :
                   relType === 'depends on' ? 'Depends On' :
                   relType === 'triggers' ? 'Triggers' :
                   relType === 'collaborates with' ? 'Collaborates With' :
                   relType === 'integrates with' ? 'Integrates With' :
                   relType === 'governs' ? 'Governs' :
                   relType === 'shares data with' ? 'Shares Data With' :
                   relType}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tabs 
            value={tabValue} 
            onChange={(_, newValue) => {
              setTabValue(newValue);
              setNodeSelectionType(newValue === 0 ? 'new' : 'existing');
            }} 
            sx={{ mb: 2 }}
          >
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
      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}; 