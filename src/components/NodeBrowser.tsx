import React from 'react';
import { 
  Box, 
  TextField, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { NodeIcon } from './NodeIcon';
import type { Node as ArchitectureNode } from '../services/architectureService';

interface NodeBrowserProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  groupedNodes: Record<string, ArchitectureNode[]>;
  onAddNode: (node: ArchitectureNode) => void;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'capability':
      return 'BIAN Capabilities';
    case 'domainService':
      return 'Domain Services';
    case 'api':
      return 'APIs';
    case 'event':
      return 'Events';
    case 'dataProduct':
      return 'Data Products';
    default:
      return type;
  }
};

export const NodeBrowser: React.FC<NodeBrowserProps> = ({
  searchQuery,
  onSearchChange,
  groupedNodes,
  onAddNode
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Available Nodes</Typography>
      <TextField
        fullWidth
        size="small"
        placeholder="Search nodes..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ mb: 2 }}
      />
      {groupedNodes && Object.entries(groupedNodes).map(([type, typeNodes]) => (
        <Box key={type} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <NodeIcon type={type as ArchitectureNode['type']} />
            {getTypeLabel(type)}
          </Typography>
          <List dense>
            {typeNodes
              .filter(node => {
                const searchLower = searchQuery.toLowerCase();
                const nameMatch = node.name?.toLowerCase().includes(searchLower) || false;
                const descMatch = node.description?.toLowerCase().includes(searchLower) || false;
                return nameMatch || descMatch;
              })
              .map(node => (
                <ListItem
                  key={node.id}
                  component="div"
                  onClick={() => onAddNode(node)}
                  sx={{ 
                    borderRadius: 1,
                    mb: 0.5,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon>
                    <NodeIcon type={node.type} />
                  </ListItemIcon>
                  <ListItemText
                    primary={node.name || 'Unnamed Node'}
                    secondary={node.description || 'No description available'}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <IconButton size="small">
                    <AddIcon fontSize="small" />
                  </IconButton>
                </ListItem>
              ))}
          </List>
          <Divider />
        </Box>
      ))}
    </Box>
  );
}; 