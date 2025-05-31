// Types for our architecture nodes
export interface Node {
  id: string;
  type: 'capability' | 'domainService' | 'api' | 'event' | 'dataProduct';
  name: string;
  label?: string;
  description?: string;
  data: Record<string, unknown>;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ArchitectureData {
  nodes: Node[];
  edges: Edge[];
}

// Import architecture data from JSON file
import architectureData from '../data/architecture.json';

// Type assertion to ensure the imported JSON matches our interfaces
const typedArchitectureData = architectureData as unknown as ArchitectureData;

class ArchitectureService {
  private data: ArchitectureData;

  constructor(data: ArchitectureData = typedArchitectureData) {
    this.data = data;
  }

  public searchNodes(query: string): Node[] {
    const searchLower = query.toLowerCase();
    return this.data.nodes.filter(node => {
      const nameMatch = node.name.toLowerCase().includes(searchLower);
      const descMatch = node.description?.toLowerCase().includes(searchLower) || false;
      return nameMatch || descMatch;
    });
  }

  public getNodeById(id: string): Node | undefined {
    return this.data.nodes.find(node => node.id === id);
  }

  public getRelatedNodes(nodeId: string): { nodes: Node[]; edges: Edge[] } {
    const relatedEdges = this.data.edges.filter(
      edge => edge.source === nodeId || edge.target === nodeId
    );

    const relatedNodeIds = new Set<string>();
    relatedEdges.forEach(edge => {
      if (edge.source !== nodeId) relatedNodeIds.add(edge.source);
      if (edge.target !== nodeId) relatedNodeIds.add(edge.target);
    });

    const relatedNodes = this.data.nodes.filter(node => 
      relatedNodeIds.has(node.id)
    );

    return {
      nodes: relatedNodes,
      edges: relatedEdges
    };
  }

  public getAllData(): ArchitectureData {
    return this.data;
  }

  public getNodesByType(type: Node['type']): Node[] {
    return this.data.nodes.filter(node => node.type === type);
  }

  public getEdgesByNodeId(nodeId: string): Edge[] {
    return this.data.edges.filter(
      edge => edge.source === nodeId || edge.target === nodeId
    );
  }

  public getConnectedNodes(nodeId: string): Node[] {
    const edges = this.getEdgesByNodeId(nodeId);
    const connectedNodeIds = new Set<string>();
    
    edges.forEach(edge => {
      if (edge.source === nodeId) connectedNodeIds.add(edge.target);
      if (edge.target === nodeId) connectedNodeIds.add(edge.source);
    });

    return this.data.nodes.filter(node => connectedNodeIds.has(node.id));
  }
}

export const architectureService = new ArchitectureService(); 