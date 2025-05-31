import React from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, Paper, Chip, Badge, IconButton, Tooltip } from '@mui/material';
import ApiIcon from '@mui/icons-material/Api';
import EventIcon from '@mui/icons-material/Event';
import StorageIcon from '@mui/icons-material/Storage';
import DomainIcon from '@mui/icons-material/Domain';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface CustomNodeProps {
  data: {
    id: string;
    name: string;
    type: string;
    description?: string;
    data?: Record<string, any>;
    relatedNodes?: Array<{
      id: string;
      name: string;
      type: string;
    }>;
    onExpand?: (nodeId: string) => void;
    onCollapse?: (nodeId: string) => void;
    isExpanded?: boolean;
    onToggleNode?: (nodeId: string, type: string) => void;
    onToggleVisibility?: (nodeId: string) => void;
    hiddenNodes?: Set<string>;
  };
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'api':
        return <ApiIcon />;
      case 'event':
        return <EventIcon />;
      case 'dataProduct':
        return <StorageIcon />;
      case 'domainService':
        return <DomainIcon />;
      default:
        return null;
    }
  };

  const formatDataValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getRelatedNodesByType = (type: string) => {
    if (!data.relatedNodes) return [];
    
    // Get nodes that are directly connected to this node
    const connectedNodes = data.relatedNodes.filter(node => 
      node.type === type && 
      // Check if this node is in the related nodes list
      data.relatedNodes?.some(relatedNode => 
        relatedNode.id === data.id || relatedNode.id === node.id
      )
    );
    
    // Ensure unique nodes by id
    return Array.from(new Map(connectedNodes.map(node => [node.id, node])).values());
  };

  const getVisibleRelatedNodesByType = (type: string) => {
    return getRelatedNodesByType(type).filter(node => !data.hiddenNodes?.has(node.id));
  };

  const handleIconClick = (type: string) => {
    if (data.onToggleNode) {
      const relatedNodes = getRelatedNodesByType(type);
      const visibleNodes = getVisibleRelatedNodesByType(type);
      
      // If there are visible nodes of this type, hide them all
      if (visibleNodes.length > 0) {
        visibleNodes.forEach(node => {
          data.onToggleNode?.(node.id, type);
        });
      } 
      // If all nodes of this type are hidden, show the first one
      else if (relatedNodes.length > 0) {
        data.onToggleNode(relatedNodes[0].id, type);
      }
    }
  };

  const isNodeHidden = data.hiddenNodes?.has(data.id);

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        minWidth: 250,
        maxWidth: 300,
        backgroundColor: 'white',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {getNodeIcon(data.type)}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {data.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {data.onToggleVisibility && (
            <Tooltip title="Hide node">
              <IconButton
                size="small"
                onClick={() => data.onToggleVisibility?.(data.id)}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          )}
          {data.onExpand && data.onCollapse && (
            <Tooltip title={data.isExpanded ? "Collapse" : "Expand"}>
              <IconButton
                size="small"
                onClick={() => data.isExpanded ? data.onCollapse?.(data.id) : data.onExpand?.(data.id)}
              >
                {data.isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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

      {data.data && Object.entries(data.data).length > 0 && (
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
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {(() => {
            // Only show relevant type icons based on node type
            let relevantTypes: string[] = [];
            switch (data.type) {
              case 'capability':
                relevantTypes = ['domainService'];
                break;
              case 'domainService':
                relevantTypes = ['capability', 'api', 'event', 'dataProduct'];
                break;
              case 'api':
              case 'event':
              case 'dataProduct':
                relevantTypes = ['domainService'];
                break;
              default:
                relevantTypes = [];
            }

            const elements = relevantTypes.map((type) => {
              const relatedNodes = getRelatedNodesByType(type);
              const visibleNodes = getVisibleRelatedNodesByType(type);
              if (relatedNodes.length === 0) return null;

              const label = type === 'domainService' ? 'Domain Service' :
                           type === 'api' ? 'API' :
                           type === 'event' ? 'Event' :
                           'Data Product';

              return (
                <Badge
                  key={type}
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
                    icon={getNodeIcon(type)}
                    label={label}
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

            return elements;
          })()}
        </Box>
      )}

      <Handle type="source" position={Position.Bottom} />
    </Paper>
  );
};

export default CustomNode; 