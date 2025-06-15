import { allBusinessAreaNodes, allBusinessAreaEdges } from './business_areas';
import { allApiNodes, allApiEdges, allEventNodes, allEventEdges } from './apis';
import { allSystemNodes, allTeamNodes, allSystemEdges, allTeamEdges } from './systems';

// Combine all nodes
export const allNodes = [
  ...allBusinessAreaNodes,
  ...allApiNodes.apis,
  ...allEventNodes.events,
  ...allSystemNodes.nodes,
  ...allTeamNodes.nodes
];

// Combine all edges
export const allEdges = [
  ...allBusinessAreaEdges,
  ...allApiEdges.nodes,
  ...allEventEdges.nodes,
  ...allSystemEdges.nodes,
  ...allTeamEdges.nodes
]; 