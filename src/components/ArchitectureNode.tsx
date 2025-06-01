import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Box, Typography, IconButton, Paper, Badge, Tooltip, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { Node } from '../services/architectureService';
import { architectureService } from '../services/architectureService';
import { AddNodeDialog } from './AddNodeDialog';

export const ArchitectureNode: React.FC<NodeProps<Node>> = ({ data }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const connectedNodes = architectureService.getConnectedNodes(data.id);
  const incomingConnections = connectedNodes.filter(node => 
    architectureService.getEdgesByNodeId(data.id).some(edge => edge.target === data.id)
  );
  const outgoingConnections = connectedNodes.filter(node => 
    architectureService.getEdgesByNodeId(data.id).some(edge => edge.source === data.id)
  );

  const getNodeTypeColor = (type: Node['type']) => {
    switch (type) {
      case 'capability':
        return '#4caf50';
      case 'domainService':
        return '#2196f3';
      case 'api':
        return '#ff9800';
      case 'event':
        return '#9c27b0';
      case 'dataProduct':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const handleCreateNode = (newNodeData: { type: Node['type']; name: string; description?: string }) => {
    const newNode = architectureService.createNode({
      ...newNodeData,
      relatedNodes: [{ nodeId: data.id }]
    });
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        minWidth: 200,
        backgroundColor: 'white',
        border: `2px solid ${getNodeTypeColor(data.type)}`,
        position: 'relative'
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: getNodeTypeColor(data.type) }}
      />
      <Tooltip title={`Incoming connections: ${incomingConnections.length}`}>
        <Badge
          badgeContent={incomingConnections.length}
          color="primary"
          sx={{
            position: 'absolute',
            top: -10,
            right: 10,
            '& .MuiBadge-badge': {
              backgroundColor: getNodeTypeColor(data.type)
            }
          }}
        />
      </Tooltip>

      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {data.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {data.type}
        </Typography>
      </Box>

      {data.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {data.description}
        </Typography>
      )}

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mt: 2,
        mb: 2,
        borderTop: '2px solid #e0e0e0',
        pt: 2
      }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            backgroundColor: getNodeTypeColor(data.type),
            color: 'white',
            minWidth: '120px',
            '&:hover': {
              backgroundColor: getNodeTypeColor(data.type),
              opacity: 0.8,
            }
          }}
        >
          Add Node
        </Button>
      </Box>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: getNodeTypeColor(data.type) }}
      />
      <Tooltip title={`Outgoing connections: ${outgoingConnections.length}`}>
        <Badge
          badgeContent={outgoingConnections.length}
          color="primary"
          sx={{
            position: 'absolute',
            bottom: -10,
            right: 10,
            '& .MuiBadge-badge': {
              backgroundColor: getNodeTypeColor(data.type)
            }
          }}
        />
      </Tooltip>

      <AddNodeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleCreateNode}
        sourceNode={data}
      />
    </Paper>
  );
}; 