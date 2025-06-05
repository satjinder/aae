import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import type { Edge, NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
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

const nodeTypes: NodeTypes = {
  custom: CustomNode
};

// Helper function to generate random position
const getRandomPosition = (): XYPosition => ({
  x: Math.random() * 500,
  y: Math.random() * 500
});



export const ArchitectureViewer: React.FC = () => {
  const [allNodes, setAllNodes] = useState<ArchitectureNode[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<DiagramNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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
    onToggleNode: (nodeId: string) => {
      if (diagramService.isNodeVisible(nodeId)) {
        diagramService.removeNode(nodeId);
      } else {
        diagramService.addNode(nodeId);
      }
      // Update visible nodes and edges
      const visibleNodes = diagramService.getVisibleNodes();
      const visibleEdges = diagramService.getEdges();
      setNodes(visibleNodes.map(toReactFlowNode));
      setEdges(visibleEdges);
      const data = architectureService.getAllData();
      setAllNodes(data.nodes);
      loadGroupedNodes(data.nodes);
    },
    onToggleVisibility: (nodeId: string) => {
      if (diagramService.isNodeVisible(nodeId)) {
        diagramService.removeNode(nodeId);
      } else {
        diagramService.addNode(nodeId);
      }
      // Update visible nodes and edges
      const visibleNodes = diagramService.getVisibleNodes();
      const visibleEdges = diagramService.getEdges();
      setNodes(visibleNodes.map(toReactFlowNode));
      setEdges(visibleEdges);
    }
  }
});

  // Load initial data
  useEffect(() => {
    const data = architectureService.getAllData();
    setAllNodes(data.nodes);
    
    // Add all nodes to diagram service
    //data.nodes.forEach(node => diagramService.addNode(node.id));
    
    // Get visible nodes and edges
    const visibleNodes = diagramService.getVisibleNodes();
    const visibleEdges = diagramService.getEdges();
    
    // Set initial nodes and edges
    setNodes(visibleNodes.map(toReactFlowNode));
    setEdges(visibleEdges);
  }, []);

  const handleNodeAdd = useCallback((node: ArchitectureNode) => {
    // Add node to the architecture service with position
    const nodeWithPosition = {
      ...node,
      position: getRandomPosition()
    };
   
    // Add node to the diagram
    diagramService.addNode(node.id);
    
    // Create new node with related nodes
    const newNode: DiagramNode = {
      ...nodeWithPosition,
      relatedNodes: architectureService.getRelatedNodes(node.id)
    };
    
    // Add to ReactFlow state
    setNodes(nds => [...nds, toReactFlowNode(newNode)]);
    
    // Update edges
    const newEdges = diagramService.getEdges();
    setEdges(newEdges);
  }, []);

  // Handle node changes (position updates, selection, etc.)
  const onNodesChangeHandler = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  // Handle edge changes
  const onEdgesChangeHandler = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);


  const loadGroupedNodes = (all: ArchitectureNode[]) => {
    const groups: Record<string, ArchitectureNode[]> = {
      capability: [],
      domainService: [],
      api: [],
      event: [],
      dataProduct: []
    };

    all.forEach(node => {
      if (node.type in groups) {
        groups[node.type].push(node);
      }
    });

    setGroupedNodes(groups);
  };

  // Memoized grouped nodes
  useEffect(() => {
    loadGroupedNodes(allNodes);
  }, [allNodes]);

  const handleDiagramStateChange = useCallback(() => {
    // Get updated nodes and edges from services
    const visibleNodes = diagramService.getVisibleNodes();
    const visibleEdges = diagramService.getEdges();
    const data = architectureService.getAllData();
    
    // Update state
    setNodes(visibleNodes.map(toReactFlowNode));
    setEdges(visibleEdges);
    setAllNodes(data.nodes);
    loadGroupedNodes(data.nodes);
  }, []);

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
          onNodesChange={onNodesChangeHandler}
          onEdgesChange={onEdgesChangeHandler}
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

      <ArchitectureChat
        onAddNode={handleNodeAdd}
        onSearchNodes={(query: string) => architectureService.searchNodes(query)}
        onDiagramStateChange={handleDiagramStateChange}
      />
    </Box>
  );
};

export default ArchitectureViewer; 