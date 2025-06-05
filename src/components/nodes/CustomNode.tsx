import React, { useState } from 'react';

import { Handle, Position } from 'reactflow';
import { Box, Typography, Paper, Chip, Badge, IconButton, Tooltip, Button } from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import { CreateNodeDialog } from '../CreateNodeDialog';
import { architectureService } from '../../services/architectureService';
import { NodeIcon } from '../NodeIcon';
import type { Node } from '../../services/architectureService';

type NodeType = Node['type'];

interface CustomNodeProps {
  data: {
    id: string;
    name: string;
    type: NodeType;
    description?: string;
    data?: Record<string, any>;
    relatedNodes?: Array<{
      id: string;
      name: string;
      type: NodeType;
    }>;
    isExpanded?: boolean;
    onToggleNode?: (nodeId: string, type: NodeType) => void;
    onToggleVisibility?: (nodeId: string) => void;
    hiddenNodes?: Set<string>;
    onRefreshNodes?: () => void;
    onExpand?: (nodeId: string) => void;
    onCollapse?: (nodeId: string) => void;
  };
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const connectedNodes = architectureService.getConnectedNodes(data.id);
  const incomingConnections = connectedNodes.filter(node => 
    architectureService.getEdgesByNodeId(data.id).some(edge => edge.target === data.id)
  );
  const outgoingConnections = connectedNodes.filter(node => 
    architectureService.getEdgesByNodeId(data.id).some(edge => edge.source === data.id)
  );


  const getNodeTypeColor = (type: NodeType) => {
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

  const formatDataValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getRelatedNodesByType = (type: NodeType) => {
    if (!data.relatedNodes) return [];
    return data.relatedNodes.filter(node => node.type === type);
  };

  const getVisibleRelatedNodesByType = (type: NodeType) => {
    return getRelatedNodesByType(type).filter(node => !data.hiddenNodes?.has(node.id));
  };

  const handleIconClick = (type: NodeType) => {
    if (!data.onToggleNode) return;
    const relatedNodes = getRelatedNodesByType(type);
    relatedNodes.forEach(node => {
      if (node.id !== data.id) {
        data.onToggleNode(node.id, type);
      }
    });
  };

  const handleShowNode = (newNodeData: { type: NodeType; name: string; description?: string }) => {
    const newNode = architectureService.createNode({
      type: newNodeData.type,
      name: newNodeData.name,
      description: newNodeData.description,
      relatedNodes: [{ nodeId: data.id }]
    });

    // Force a refresh of the node list
    if (data.onToggleNode) {
      data.onToggleNode(newNode.id, newNode.type);
    }

    // Force a refresh of available nodes
    if (data.onRefreshNodes) {
      data.onRefreshNodes();
    }
  };

  const isNodeHidden = data.hiddenNodes?.has(data.id);

  const handleToggleVisibility = () => {
    if (data.onToggleVisibility) {
      data.onToggleVisibility(data.id);
    }
  };

  const handleExpandCollapse = () => {
    if (data.isExpanded && data.onCollapse) {
      data.onCollapse(data.id);
    } else if (!data.isExpanded && data.onExpand) {
      data.onExpand(data.id);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        minWidth: 250,
        maxWidth: 300,
        backgroundColor: 'white',
        position: 'relative',
        border: `2px solid ${getNodeTypeColor(data.type)}`
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: getNodeTypeColor(data.type) }} />
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
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <NodeIcon type={data.type} color={getNodeTypeColor(data.type)} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {data.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {data.onToggleVisibility && (
            <Tooltip title="Hide node">
              <IconButton
                size="small"
                onClick={handleToggleVisibility}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {data.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {data.description}
        </Typography>
      )}

      {data.data && Object.keys(data.data).length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Data:</Typography>
          {Object.entries(data.data).map(([key, value]) => (
            <Box key={key} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {key}:
              </Typography>
              <Typography variant="body2">
                {formatDataValue(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {data.relatedNodes && data.relatedNodes.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {(() => {
            // Get all possible node types
            const allTypes: NodeType[] = ['capability', 'domainService', 'api', 'event', 'dataProduct'];
            
            // Get all possible relations for this node type
            const possibleRelations = allTypes.flatMap(targetType => {
              const relations = architectureService.getAllowedRelations(data.type, targetType);
              return relations.map(relation => ({
                type: targetType,
                relation
              }));
            });

            const elements = possibleRelations.map(({ type, relation }) => {
              const visibleNodes = getVisibleRelatedNodesByType(type);
              
              const name = type === 'domainService' ? 'Domain Service' :
                           type === 'api' ? 'API' :
                           type === 'event' ? 'Event' :
                           type === 'dataProduct' ? 'Data Product' :
                           'Capability';

              return (
                <Badge
                  key={`${type}-${relation}`}
                  badgeContent={visibleNodes.length}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      right: -3,
                      top: 3,
                    }
                  }}
                >
                  <Chip
                    icon={<NodeIcon type={type} fontSize="small" />}
                    label={`${name} (${relation})`}
                    size="small"
                    onClick={() => handleIconClick(type)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      opacity: visibleNodes.length === 0 ? 0.5 : 1
                    }}
                  />
                </Badge>
              );
            }).filter((element): element is JSX.Element => element !== null);

            // Add the add button as the last element
            elements.push(
              <IconButton
                key="add"
                onClick={() => setDialogOpen(true)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    color: getNodeTypeColor(data.type),
                  }
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            );

            return elements;
          })()}
        </Box>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: getNodeTypeColor(data.type) }} />
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

      <CreateNodeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleShowNode}
        sourceNode={{
          id: data.id,
          name: data.name,
          type: data.type,
          description: data.description || '',
          data: data.data || {},
          visible: true,
          expanded: true,
          relatedNodes: [],
          position: { x: 0, y: 0 }
        }}
      />
    </Paper>
  );
};

export default CustomNode; 