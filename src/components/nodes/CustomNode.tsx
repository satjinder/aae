import React, { useState } from 'react';

import { Handle, Position } from 'reactflow';
import { Box, Typography, Paper, Chip, Badge, IconButton, Tooltip } from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { CreateNodeDialog } from '../CreateNodeDialog';
import { architectureService } from '../../services/architectureService';
import { NodeIcon, getNodeTypeColor } from '../NodeIcons';
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

  const formatDataValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getRelatedNodesByType = (type: NodeType) => {
    if (!data.relatedNodes) return [];
    return data.relatedNodes.filter(node => node.type === type);
  };

  const handleIconClick = (type: NodeType) => {
    if (!data.onToggleNode) return;
    const relatedNodes = getRelatedNodesByType(type);
    relatedNodes.forEach(node => {
      if (node.id !== data.id && data.onToggleNode) {
        data.onToggleNode(node.id, type);
      }
    });
  };

  const handleCreateNode = (newNodeData: { 
    type: NodeType; 
    name: string; 
    description?: string;
    relationType?: string;
    existingNodeId?: string;
  }) => {
    if (newNodeData.existingNodeId) {
      // Create relation with existing node
      const edge = architectureService.addEdge(
        data.id,
        newNodeData.existingNodeId,
        newNodeData.relationType || ''
      );
      
      if (edge && data.onToggleNode) {
        // Force a refresh of the node list
        data.onToggleNode(newNodeData.existingNodeId, newNodeData.type);
      }
    } else {
      // Create new node with relation
      const newNode = architectureService.createNode({
        type: newNodeData.type,
        name: newNodeData.name,
        description: newNodeData.description,
        relatedNodes: [{ 
          nodeId: data.id,
          relationType: newNodeData.relationType
        }]
      });

      // Force a refresh of the node list
      if (data.onToggleNode) {
        data.onToggleNode(newNode.id, newNode.type);
      }
    }

    // Force a refresh of available nodes
    if (data.onRefreshNodes) {
      data.onRefreshNodes();
    }
  };

  const handleToggleVisibility = () => {
    if (data.onToggleVisibility) {
      data.onToggleVisibility(data.id);
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
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <NodeIcon type={data.type} color="primary" />
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
            const allTypes: NodeType[] = ['business_area', 'business_domain', 'service_domain', 'api', 'event', 'bom', 'system', 'dev_team', 'business_team', 'business_owner'];
            
            // Get all possible relations for this node type
            const possibleRelations = allTypes.flatMap(targetType => {
              const relations = architectureService.getAllowedRelations(data.type, targetType);
              return relations.map(relation => ({
                type: targetType,
                relation
              }));
            });

            const elements = possibleRelations.map(({ type, relation }) => {
              const visibleNodes = getRelatedNodesByType(type);
              
              const name = type === 'business_area' ? 'Business Area' :
                           type === 'business_domain' ? 'Business Domain' :
                           type === 'service_domain' ? 'Service Domain' :
                           type === 'api' ? 'API' :
                           type === 'event' ? 'Event' :
                           type === 'bom' ? 'Business Object Model' :
                           type === 'system' ? 'System' :
                           type === 'dev_team' ? 'Development Team' :
                           type;

              // Show count for all relations, including system owner
              const badgeContent = visibleNodes.length;

              return (
                <Badge
                  key={`${type}-${relation}`}
                  badgeContent={badgeContent}
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

      <CreateNodeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreateNode}
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