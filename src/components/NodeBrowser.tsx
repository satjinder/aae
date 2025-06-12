import React, { useState, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  TextField,
  Collapse,
  IconButton,
  Tooltip,
  Paper,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { NodeIcon, NodeType } from './NodeIcons';
import type { Node } from '../services/architectureService';
import { architectureService } from '../services/architectureService';

interface NodeBrowserProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  groupedNodes: Record<string, Node[]>;
  onAddNode: (node: Node) => void;
}

export const NodeBrowser: React.FC<NodeBrowserProps> = ({
  searchQuery,
  onSearchChange,
  groupedNodes,
  onAddNode
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMainSections, setExpandedMainSections] = useState<Set<string>>(new Set());

  const getChildNodes = (nodeId: string): Node[] => {
    const edges = architectureService.getAllData().edges;
    const childEdges = edges.filter(edge => edge.source === nodeId);
    return childEdges.map(edge => {
      const targetNode = architectureService.getNodeById(edge.target);
      return targetNode!;
    });
  };

  const toggleSection = (nodeId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMainSection = (sectionType: string) => {
    setExpandedMainSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionType)) {
        newSet.delete(sectionType);
      } else {
        newSet.add(sectionType);
      }
      return newSet;
    });
  };

  const getTypeLabel = (type: NodeType): string => {
    switch (type) {
      case 'business_area':
        return 'Business Areas';
      case 'business_domain':
        return 'Business Domains';
      case 'service_domain':
        return 'Service Domains';
      case 'api':
        return 'APIs';
      case 'event':
        return 'Events';
      case 'bom':
        return 'Business Object Models';
      case 'system':
        return 'Systems';
      case 'dev_team':
        return 'Development Teams';
      default:
        return type;
    }
  };

  const searchInNode = (node: Node, query: string): boolean => {
    // Check if current node matches
    const nodeMatches = 
      node.name.toLowerCase().includes(query) ||
      node.description.toLowerCase().includes(query);

    // Get child nodes
    const childNodes = getChildNodes(node.id);
    
    // Check if any child nodes match
    const childrenMatch = childNodes.some(child => searchInNode(child, query));
    
    return nodeMatches || childrenMatch;
  };

  const getMatchingNodes = (nodes: Node[], query: string): Node[] => {
    return nodes.filter(node => searchInNode(node, query));
  };

  const filteredNodes = useMemo(() => {
    if (!searchQuery) {
      return {
        business_area: groupedNodes.business_area || [],
        system: groupedNodes.system || [],
        dev_team: groupedNodes.dev_team || []
      };
    }

    const query = searchQuery.toLowerCase();
    return {
      business_area: getMatchingNodes(groupedNodes.business_area || [], query),
      system: getMatchingNodes(groupedNodes.system || [], query),
      dev_team: getMatchingNodes(groupedNodes.dev_team || [], query)
    };
  }, [groupedNodes, searchQuery]);

  const renderNode = (node: Node) => {
    const hasChildren = ['business_area', 'business_domain', 'service_domain'].includes(node.type);
    const isExpanded = expandedSections[node.id];
    const childNodes = hasChildren ? getChildNodes(node.id) : [];
    const childCount = hasChildren ? childNodes.length : 0;

    // If searching, expand nodes that have matching children
    if (searchQuery && hasChildren && !isExpanded) {
      const query = searchQuery.toLowerCase();
      const hasMatchingChildren = childNodes.some(child => 
        child.name.toLowerCase().includes(query) ||
        child.description.toLowerCase().includes(query) ||
        searchInNode(child, query)
      );
      if (hasMatchingChildren) {
        setExpandedSections(prev => ({
          ...prev,
          [node.id]: true
        }));
      }
    }

    return (
      <Box key={node.id}>
        <ListItem
          button
          onClick={() => hasChildren && toggleSection(node.id)}
          sx={{
            pl: 2,
            cursor: hasChildren ? 'pointer' : 'default',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            ...(isExpanded && {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.selected',
              },
            }),
          }}
        >
          {hasChildren && (
            <ListItemIcon sx={{ minWidth: 36 }}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemIcon>
          )}
          {!hasChildren && <ListItemIcon sx={{ minWidth: 36 }}><ChevronRightIcon /></ListItemIcon>}
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: hasChildren ? 'bold' : 'normal',
                    color: isExpanded ? 'primary.main' : 'inherit'
                  }}
                >
                  {node.name}
                </Typography>
                {hasChildren && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: isExpanded ? 'primary.main' : 'text.secondary',
                      bgcolor: isExpanded ? 'primary.light' : 'action.hover',
                      px: 0.5,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: '0.75rem'
                    }}
                  >
                    {childCount}
                  </Typography>
                )}
              </Box>
            }
            secondary={node.description}
            secondaryTypographyProps={{
              variant: 'caption',
              style: { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
            }}
          />
          <Tooltip title="Add to diagram">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onAddNode(node);
              }}
            >
              <NodeIcon type={node.type} />
            </IconButton>
          </Tooltip>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {childNodes.map(childNode => renderNode(childNode))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const renderSection = (type: Node['type'], nodes: Node[]) => (
    <Box>
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'background.default',
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={() => toggleMainSection(type)}
      >
        <Typography variant="subtitle2">
          {getTypeLabel(type)} ({nodes.length})
        </Typography>
        <IconButton size="small">
          {expandedMainSections.has(type) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expandedMainSections.has(type)} timeout="auto" unmountOnExit>
        <List>
          {nodes.map((node, nodeIndex) => (
            <React.Fragment key={node.id}>
              {renderNode(node)}
              {nodeIndex < nodes.length - 1 && (
                <Box sx={{ 
                  height: 1, 
                  bgcolor: 'divider',
                  mx: 2,
                  opacity: 0.5
                }} />
              )}
            </React.Fragment>
          ))}
        </List>
      </Collapse>
    </Box>
  );

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        width: isCollapsed ? '48px' : '300px',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        p: 1, 
        display: 'flex', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        {!isCollapsed && (
          <TextField
            fullWidth
            size="small"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ mr: 1 }}
          />
        )}
        <IconButton onClick={toggleCollapse} size="small">
          {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>

      {!isCollapsed && (
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {renderSection('dev_team', filteredNodes.dev_team)}
          <Divider />
          {renderSection('business_area', filteredNodes.business_area)}
          <Divider />
          {renderSection('system', filteredNodes.system)}
        </Box>
      )}
    </Paper>
  );
}; 