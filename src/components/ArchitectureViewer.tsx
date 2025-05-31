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
import ELK from 'elkjs/lib/elk.bundled.js';
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

const elk = new ELK();

// Layout options for ELK
const layoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '80',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'elk.layered.spacing.edgeNodeBetweenLayers': '50',
  'elk.layered.spacing.edgeEdgeBetweenLayers': '50',
  'elk.layered.spacing.edgeNode': '50',
  'elk.layered.spacing.edgeEdge': '50',
  'elk.layered.spacing.baseValue': '80',
  'elk.layered.spacing.layer': '100'
};

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
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());
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

      // Get the current node
      const currentNode = nodes.find(n => n.id === nodeId);
      if (!currentNode) return;

      // Get related nodes from the node's data
      const relatedNodes = currentNode.data.relatedNodes || [];
      
      // Add related nodes to the board
      relatedNodes.forEach((relatedNode: ArchitectureNode) => {
        // Skip if the node is already visible
        if (visibleNodes.has(relatedNode.id)) return;

        const newNode: Node = {
          id: relatedNode.id,
          position: { 
            x: currentNode.position.x + HORIZONTAL_SPACING, 
            y: currentNode.position.y + VERTICAL_SPACING 
          },
          type: 'custom',
          data: {
            ...relatedNode,
            onExpand: nodeHandlers.handleExpand,
            onCollapse: nodeHandlers.handleCollapse,
            onToggleNode: nodeHandlers.handleToggleNode,
            onToggleVisibility: nodeHandlers.handleToggleVisibility,
            isExpanded: expandedNodes.has(relatedNode.id),
            relatedNodes: architectureService.getRelatedNodes(relatedNode.id).nodes,
            boardContext
          }
        };

        setNodes(prevNodes => [...prevNodes, newNode]);
        setVisibleNodes(prev => new Set([...prev, relatedNode.id]));

        // Add edge between current node and related node
        const edge: Edge = {
          id: `${nodeId}-${relatedNode.id}`,
          source: nodeId,
          target: relatedNode.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#555', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#555'
          }
        };
        setEdges(prevEdges => [...prevEdges, edge]);
      });
    },
    handleCollapse: (nodeId: string) => {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });

      // Get the current node
      const currentNode = nodes.find(n => n.id === nodeId);
      if (!currentNode) return;

      // Get related nodes from the node's data
      const relatedNodes = currentNode.data.relatedNodes || [];
      
      // Remove related nodes and their edges
      setNodes(prevNodes => prevNodes.filter(n => 
        n.id === nodeId || !relatedNodes.some((rn: { id: string }) => rn.id === n.id)
      ));
      setEdges(prevEdges => prevEdges.filter(e => 
        e.source !== nodeId && e.target !== nodeId
      ));

      // Update visible nodes
      setVisibleNodes(prev => {
        const newSet = new Set(prev);
        relatedNodes.forEach((rn: { id: string }) => newSet.delete(rn.id));
        return newSet;
      });
    },
    handleToggleNode: (nodeId: string, type: string) => {
      // If the node is not visible, add it
      if (!visibleNodes.has(nodeId)) {
        // Get the node details from the architecture service
        const nodeToAdd = architectureService.getNodeById(nodeId);
        if (!nodeToAdd) return;

        handleAddNode(nodeToAdd);
      
      }
      // If the node is visible, hide it
      else {
        setVisibleNodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(nodeId);
          return newSet;
        });
      }
    },
    handleToggleVisibility: (nodeId: string) => {
      // Remove only this node from visible nodes
      setVisibleNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });

      // Remove only this node from the board
      setNodes(prevNodes => prevNodes.filter(n => n.id !== nodeId));
      
      // Remove edges that have this node as source or target
      setEdges(prevEdges => prevEdges.filter(e => 
        e.source !== nodeId && e.target !== nodeId
      ));

      // Update edges to only show relations between visible nodes
      setEdges(prevEdges => {
        return prevEdges.filter(edge => {
          const sourceVisible = visibleNodes.has(edge.source);
          const targetVisible = visibleNodes.has(edge.target);
          return sourceVisible && targetVisible;
        });
      });
    }
  }), [nodes, expandedNodes, visibleNodes, boardContext]);

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
    // Check relations between all visible nodes
    const visibleNodeIds = Array.from(visibleNodes);
    
    // Create a set to track all edges we want to keep
    const edgesToKeep = new Set<string>();
    
    // For each visible node, check its relations with other visible nodes
    visibleNodeIds.forEach(nodeId => {
      // Get relations for this node
      const { edges: nodeEdges } = architectureService.getRelatedNodes(nodeId);
      
      // Find edges that connect to other visible nodes
      nodeEdges.forEach(edge => {
        const sourceVisible = visibleNodes.has(edge.source);
        const targetVisible = visibleNodes.has(edge.target);
        
        // If both nodes are visible, keep this edge
        if (sourceVisible && targetVisible) {
          edgesToKeep.add(edge.id);
        }
      });
    });

    // Update edges to only keep those between visible nodes
    setEdges(prevEdges => {
      // First remove edges that aren't between visible nodes
      const filteredEdges = prevEdges.filter(edge => edgesToKeep.has(edge.id));
      
      // Then add any missing edges between visible nodes
      const existingEdgeIds = new Set(filteredEdges.map(e => e.id));
      
      visibleNodeIds.forEach(nodeId => {
        const { edges: nodeEdges } = architectureService.getRelatedNodes(nodeId);
        nodeEdges.forEach(edge => {
          if (!existingEdgeIds.has(edge.id) && edgesToKeep.has(edge.id)) {
            filteredEdges.push({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#555', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#555'
              },
              label: edge.label
            });
          }
        });
      });

      return filteredEdges;
    });
  }, [visibleNodes]);

  useEffect(() => {
    const loadAvailableNodes = async () => {
      const allData = await architectureService.getAllData();
      setAvailableNodes(allData.nodes);
    };
    loadAvailableNodes();
  }, []);

  useEffect(() => {
    // Remove nodes that are not visible
    setNodes(prevNodes => prevNodes.filter(node => visibleNodes.has(node.id)));
  }, [visibleNodes]);

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
  }, [nodes, expandedNodes, nodeHandlers, visibleNodes, boardContext]);

  const handleAddNode = useCallback((node: ArchitectureNode) => {
    // Get related nodes and edges
    const { nodes: relatedNodes, edges: relatedEdges } = architectureService.getRelatedNodes(node.id);

    // Calculate a temporary position for the new node
    // Place it to the right of the rightmost node, or at (0,0) if no nodes exist
    const rightmostNode = nodes.reduce((rightmost, current) => {
      return (current.position.x > rightmost.position.x) ? current : rightmost;
    }, { position: { x: -HORIZONTAL_SPACING, y: 0 } });

    const position = {
      x: rightmostNode.position.x + HORIZONTAL_SPACING,
      y: 0
    };

    // Create the main node
    const newNode: Node = {
      id: node.id,
      position,
      type: 'custom',
      data: {
        ...node,
        onExpand: nodeHandlers.handleExpand,
        onCollapse: nodeHandlers.handleCollapse,
        onToggleNode: nodeHandlers.handleToggleNode,
        onToggleVisibility: nodeHandlers.handleToggleVisibility,
        isExpanded: expandedNodes.has(node.id),
        relatedNodes,
        boardContext
      }
    };

    // Add the main node
    setNodes(prevNodes => [...prevNodes, newNode]);
    setVisibleNodes(prev => new Set([...prev, node.id]));


  }, [nodes, expandedNodes, nodeHandlers, visibleNodes, boardContext]);

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