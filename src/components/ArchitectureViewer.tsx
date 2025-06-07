import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowInstance,
  Node as ReactFlowNode,
  XYPosition,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import type { NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Box, 
  IconButton, 
  Drawer
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

import CustomNode from './nodes/CustomNode';
import { NodeBrowser } from './NodeBrowser';
import { ArchitectureChat } from './ArchitectureChat';
import { architectureService } from '../services/architectureService';
import { diagramService } from '../services/diagramService';
import type { Node as ArchitectureNode } from '../services/architectureService';
import type { DiagramNode } from '../services/diagramService';
import { ManageNodeVisibilityTool } from '../agents/tools/diagram/manageNodeVisibilityTool';

const nodeTypes: NodeTypes = {
  custom: CustomNode
};

// Helper function to generate random position
const getRandomPosition = (): XYPosition => ({
  x: Math.random() * 500,
  y: Math.random() * 500
});

export const ArchitectureViewer: React.FC = () => {
  const [nodes, setNodes] = useNodesState<DiagramNode>([]);
  const [edges, setEdges] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNodeList, setShowNodeList] = useState(true);
  const [groupedNodes, setGroupedNodes] = useState<Record<string, ArchitectureNode[]>>({});

  // Convert architecture node to ReactFlow node
  const toReactFlowNode = (node: DiagramNode): ReactFlowNode => ({
    id: node.id,
    type: 'custom',
    position: node.position || getRandomPosition(),
    data: { 
      ...node,
      onToggleNode: async (nodeId: string) => {
        const tool = new ManageNodeVisibilityTool();
        await tool.execute(JSON.stringify({
          nodeId,
          action: diagramService.isNodeVisible(nodeId) ? 'remove' : 'add'
        }));
        // Update visible nodes and edges
        const visibleNodes = diagramService.getVisibleNodes();
        const visibleEdges = diagramService.getEdges();
        setNodes(visibleNodes.map(toReactFlowNode));
        setEdges(visibleEdges);
      },
      onToggleVisibility: async (nodeId: string) => {
        const tool = new ManageNodeVisibilityTool();
        await tool.execute(JSON.stringify({
          nodeId,
          action: diagramService.isNodeVisible(nodeId) ? 'remove' : 'add'
        }));
        // Update visible nodes and edges
        const visibleNodes = diagramService.getVisibleNodes();
        const visibleEdges = diagramService.getEdges();
        setNodes(visibleNodes.map(toReactFlowNode));
        setEdges(visibleEdges);
      }
    }
  });

  // Load and group nodes by type
  const loadGroupedNodes = useCallback((nodes: ArchitectureNode[]) => {
    const grouped = nodes.reduce((acc, node) => {
      if (!acc[node.type]) {
        acc[node.type] = [];
      }
      acc[node.type].push(node);
      return acc;
    }, {} as Record<string, ArchitectureNode[]>);
    setGroupedNodes(grouped);
  }, []);

  // Initialize nodes and edges
  useEffect(() => {
    const data = architectureService.getAllData();
    loadGroupedNodes(data.nodes);
    
    // Start with empty diagram
    setNodes([]);
    setEdges([]);
  }, [loadGroupedNodes]);

  const handleNodeAdd = useCallback((node: ArchitectureNode) => {
    // Add node to diagram service
    diagramService.addNode(node.id);
    
    // Get updated visible nodes and edges
    const visibleNodes = diagramService.getVisibleNodes();
    const visibleEdges = diagramService.getEdges();
    
    // Update ReactFlow state
    setNodes(visibleNodes.map(toReactFlowNode));
    setEdges(visibleEdges);

    // If this is the first node, fit the view
    if (visibleNodes.length === 1 && reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance]);

  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  // Handle diagram state changes
  const handleDiagramStateChange = useCallback(() => {
    // Get updated nodes and edges from services
    const visibleNodes = diagramService.getVisibleNodes();
    const visibleEdges = diagramService.getEdges();
    const data = architectureService.getAllData();
    
    // Update state
    setNodes(visibleNodes.map(toReactFlowNode));
    // Ensure each edge has a unique ID
    setEdges(visibleEdges.map(edge => ({
      ...edge,
      id: edge.id || `edge-${edge.source}-${edge.target}-${edge.label}`
    })));
    loadGroupedNodes(data.nodes);
  }, [loadGroupedNodes]);

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
        <NodeBrowser
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          groupedNodes={groupedNodes}
          onAddNode={handleNodeAdd}
        />
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
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onInit={setReactFlowInstance}
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
          fitView={nodes.length === 0}
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

      <ArchitectureChat
        onDiagramStateChange={handleDiagramStateChange}
      />
    </Box>
  );
};

export default ArchitectureViewer; 