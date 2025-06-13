import { allBusinessAreaNodes, allBusinessAreaEdges } from './business_areas';
import { allApiNodes, allApiEdges, allEventNodes, allEventEdges } from './apis';

// Combine all nodes
export const allNodes = [
  ...allBusinessAreaNodes,
  ...allApiNodes.apis,
  ...allEventNodes.events
];

// Combine all edges
export const allEdges = [
  ...allBusinessAreaEdges,
  ...allApiEdges.nodes,
  ...allEventEdges.nodes
]; 