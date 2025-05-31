import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import type { Node, Edge, NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  TextField, 
  Box, 
  IconButton, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Drawer
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ApiIcon from '@mui/icons-material/Api';
import EventIcon from '@mui/icons-material/Event';
import StorageIcon from '@mui/icons-material/Storage';
import DomainIcon from '@mui/icons-material/Domain';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import CustomNode from './nodes/CustomNode';
import { architectureService } from '../services/architectureService';
import type { Node as ArchitectureNode } from '../services/architectureService';

const nodeTypes: NodeTypes = {
  custom: CustomNode
};

// Constants
const NODE_WIDTH = 250;
const NODE_HEIGHT = 200;
const HORIZONTAL_SPACING = 300;
const VERTICAL_SPACING = 250;

// Helper functions
const calculateNodePositions = (nodes: Node[], parentNode?: Node) => {
  if (parentNode) {
    return nodes.map((node, index) => ({
      ...node,
      position: {
        x: parentNode.position.x + (index - (nodes.length - 1) / 2) * HORIZONTAL_SPACING,
        y: parentNode.position.y + VERTICAL_SPACING
      }
    }));
  }
  
  const nodesPerRow = Math.ceil(Math.sqrt(nodes.length));
  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: (index % nodesPerRow) * HORIZONTAL_SPACING,
      y: Math.floor(index / nodesPerRow) * VERTICAL_SPACING
    }
  }));
};

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
    case 'capability':
      return <BusinessIcon />;
    default:
      return null;
  }
};

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

const ArchitectureViewer: React.FC = () => {
  // State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showSearch, setShowSearch] = useState(true);
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());
  const [boardContext, setBoardContext] = useState<{
    nodes: ArchitectureNode[];
    edges: Array<{ source: string; target: string; label?: string }>;
  }>({ nodes: [], edges: [] });
  const [availableNodes, setAvailableNodes] = useState<ArchitectureNode[]>([]);
  const [showNodeList, setShowNodeList] = useState(true);

  // Memoized handlers
  const nodeHandlers = useMemo(() => ({
    handleExpand: (nodeId: string) => {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        newSet.add(nodeId);
        return newSet;
      });
    },
    handleCollapse: (nodeId: string) => {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });
    },
    handleToggleNode: (nodeId: string, type: string) => {
      setHiddenNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
          loadNodeAndRelations(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    },
    handleToggleVisibility: (nodeId: string) => {
      setHiddenNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    }
  }), []);

  // Memoized board context update
  const updateBoardContext = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    setBoardContext({
      nodes: currentNodes.map(node => ({
        id: node.id,
        name: node.data.name,
        type: node.data.type,
        description: node.data.description,
        data: node.data.data,
        label: node.data.name
      })),
      edges: currentEdges.map(edge => ({
        source: edge.source,
        target: edge.target,
        label: typeof edge.label === 'string' ? edge.label : undefined
      }))
    });
  }, []);

  // Effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateBoardContext(nodes, edges);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, updateBoardContext]);

  useEffect(() => {
    const loadAvailableNodes = async () => {
      const allData = await architectureService.getAllData();
      setAvailableNodes(allData.nodes);
    };
    loadAvailableNodes();
  }, []);

  useEffect(() => {
    setNodes(prevNodes => prevNodes.filter(node => !hiddenNodes.has(node.id)));
    setEdges(prevEdges => prevEdges.filter(edge => 
      !hiddenNodes.has(edge.source) && !hiddenNodes.has(edge.target)
    ));
  }, [hiddenNodes]);

  // Node loading functions
  const loadNodeAndRelations = useCallback(async (nodeId: string) => {
    const { nodes: relatedNodes } = await architectureService.getRelatedNodes(nodeId);
    const targetNode = relatedNodes.find(node => node.id === nodeId);
    if (!targetNode) return;

    const newNode: Node = {
      ...targetNode,
      position: {
        x: nodes.length * 250,
        y: 0
      },
      type: 'custom',
      data: {
        ...targetNode,
        onExpand: nodeHandlers.handleExpand,
        onCollapse: nodeHandlers.handleCollapse,
        onToggleNode: nodeHandlers.handleToggleNode,
        onToggleVisibility: nodeHandlers.handleToggleVisibility,
        isExpanded: expandedNodes.has(targetNode.id),
        hiddenNodes,
        relatedNodes: relatedNodes,
        boardContext
      }
    };

    setNodes(prevNodes => {
      const existingNodeIds = new Set(prevNodes.map(n => n.id));
      if (!existingNodeIds.has(newNode.id)) {
        return [...prevNodes, newNode];
      }
      return prevNodes;
    });
  }, [nodes, expandedNodes, nodeHandlers, hiddenNodes, boardContext]);

  const handleAddNode = useCallback((node: ArchitectureNode) => {
    const newNode: Node = {
      id: node.id,
      position: { x: nodes.length * 250, y: 0 },
      type: 'custom',
      data: {
        ...node,
        onExpand: nodeHandlers.handleExpand,
        onCollapse: nodeHandlers.handleCollapse,
        onToggleNode: nodeHandlers.handleToggleNode,
        onToggleVisibility: nodeHandlers.handleToggleVisibility,
        isExpanded: expandedNodes.has(node.id),
        hiddenNodes,
        relatedNodes: architectureService.getRelatedNodes(node.id).nodes,
        boardContext
      }
    };

    if (node.type === 'capability') {
      const relatedEdges = architectureService.getAllData().edges.filter(
        edge => edge.source === node.id && edge.label === 'implements'
      );
      
      const domainServices = relatedEdges.map(edge => 
        availableNodes.find(n => n.id === edge.target)
      ).filter((n): n is ArchitectureNode => n !== undefined);

      domainServices.forEach((service, index) => {
        const serviceNode: Node = {
          id: service.id,
          position: { 
            x: nodes.length * 250 + (index * 250), 
            y: 200 
          },
          type: 'custom',
          data: {
            ...service,
            onExpand: nodeHandlers.handleExpand,
            onCollapse: nodeHandlers.handleCollapse,
            onToggleNode: nodeHandlers.handleToggleNode,
            onToggleVisibility: nodeHandlers.handleToggleVisibility,
            isExpanded: expandedNodes.has(service.id),
            hiddenNodes,
            relatedNodes: availableNodes,
            boardContext
          }
        };
        setNodes(prevNodes => [...prevNodes, serviceNode]);

        const edge: Edge = {
          id: `${node.id}-${service.id}`,
          source: node.id,
          target: service.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#555', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#555'
          },
          label: 'implements'
        };
        setEdges(prevEdges => [...prevEdges, edge]);
      });
    }

    if (node.type === 'domainService') {
      const relatedEdges = architectureService.getAllData().edges.filter(
        edge => edge.source === node.id && 
        (edge.label === 'exposes' || edge.label === 'publishes' || edge.label === 'produces')
      );
      
      const interfaces = relatedEdges.map(edge => 
        availableNodes.find(n => n.id === edge.target)
      ).filter((n): n is ArchitectureNode => n !== undefined);

      interfaces.forEach((interface_, index) => {
        const interfaceNode: Node = {
          id: interface_.id,
          position: { 
            x: nodes.length * 250 + (index * 250), 
            y: 400 
          },
          type: 'custom',
          data: {
            ...interface_,
            onExpand: nodeHandlers.handleExpand,
            onCollapse: nodeHandlers.handleCollapse,
            onToggleNode: nodeHandlers.handleToggleNode,
            onToggleVisibility: nodeHandlers.handleToggleVisibility,
            isExpanded: expandedNodes.has(interface_.id),
            hiddenNodes,
            relatedNodes: availableNodes,
            boardContext
          }
        };
        setNodes(prevNodes => [...prevNodes, interfaceNode]);

        const edge: Edge = {
          id: `${node.id}-${interface_.id}`,
          source: node.id,
          target: interface_.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#555', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#555'
          },
          label: relatedEdges.find(e => e.target === interface_.id)?.label
        };
        setEdges(prevEdges => [...prevEdges, edge]);
      });
    }

    setNodes(prevNodes => [...prevNodes, newNode]);
  }, [nodes, expandedNodes, nodeHandlers, hiddenNodes, availableNodes, boardContext]);

  // Memoized grouped nodes
  const groupedNodes = useMemo(() => {
    const groups: Record<string, ArchitectureNode[]> = {
      capability: [],
      domainService: [],
      api: [],
      event: [],
      dataProduct: []
    };

    availableNodes.forEach(node => {
      if (node.type in groups) {
        groups[node.type].push(node);
      }
    });

    return groups;
  }, [availableNodes]);

  return (
    <Box sx={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 2,
        display: 'flex',
        gap: 1
      }}>
        <IconButton 
          onClick={() => setShowNodeList(!showNodeList)}
          sx={{ 
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'background.paper' }
          }}
        >
          {showNodeList ? <CloseIcon /> : <AddIcon />}
        </IconButton>
      </Box>

      <Drawer
        variant="persistent"
        anchor="left"
        open={showNodeList}
        sx={{
          width: 300,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
            top: 0,
            height: '100%',
            position: 'absolute'
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Available Nodes</Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          {Object.entries(groupedNodes).map(([type, typeNodes]) => (
            <Box key={type} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {getNodeIcon(type)}
                {getTypeLabel(type)}
              </Typography>
              <List dense>
                {typeNodes
                  .filter(node => {
                    const searchLower = searchQuery.toLowerCase();
                    const nameMatch = node.label?.toLowerCase().includes(searchLower) || false;
                    const descMatch = node.description?.toLowerCase().includes(searchLower) || false;
                    return nameMatch || descMatch;
                  })
                  .map(node => (
                    <ListItem
                      key={node.id}
                      component="div"
                      onClick={() => handleAddNode(node)}
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
                        {getNodeIcon(node.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={node.label || 'Unnamed Node'}
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
      </Drawer>

      <Box sx={{ 
        flexGrow: 1,
        position: 'relative',
        width: '100%',
        height: '100%',
        ml: showNodeList ? '300px' : 0,
        transition: 'margin-left 0.2s'
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#555', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#555'
            }
          }}
          fitView
          style={{
            width: '100%',
            height: '100%',
            background: '#f8f8f8'
          }}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </Box>
    </Box>
  );
};

export default ArchitectureViewer; 