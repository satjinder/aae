// Types for our architecture nodes
export interface Node {
  id: string;
  type: 'capability' | 'domainService' | 'api' | 'event' | 'dataProduct';
  label: string;
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

import { v4 as uuidv4 } from 'uuid';

// Define allowed relation types between different node types
const allowedRelations: Record<Node['type'], Record<Node['type'], string[]>> = {
  capability: {
    capability: ['dependsOn'],
    domainService: ['implements'],
    api: [],
    event: [],
    dataProduct: []
  },
  domainService: {
    capability: [ 'implementedBy'],
    domainService: ['dependsOn'],
    api: ['exposes'],
    event: ['publishedBy'],
    dataProduct: ['producedBy']
  },
  api: {
    capability: [],
    domainService: ['exposedBy'],
    api: [],
    event: [],
    dataProduct: []
  },
  event: {
    capability: [],
    domainService: ['publishes'],
    api: [],
    event: [],
    dataProduct: []
  },
  dataProduct: {
    capability: [],
    domainService: ['producedBy'],
    api: [],
    event: [],
    dataProduct: []
  }
};

class ArchitectureService {
  private data: ArchitectureData;

  constructor(data: ArchitectureData = typedArchitectureData) {
    this.data = data;
  }

  public createNode(data: {
    type: Node['type'];
    label: string;
    description?: string;
    data?: Record<string, unknown>;
    relatedNodes?: Array<{
      nodeId: string;
      relationType?: string;
    }>;
  }): Node {
    const newNode: Node = {
      id: uuidv4(),
      type: data.type,
      label: data.label,
      description: data.description,
      data: data.data || {}
    };

    // Add the new node to the data
    this.data.nodes.push(newNode);

    // Handle related nodes if provided
    if (data.relatedNodes) {
      data.relatedNodes.forEach(({ nodeId, relationType }) => {
        const relatedNode = this.getNodeById(nodeId);
        if (!relatedNode) return;

        // If relationType is not provided, try to determine it based on node types
        let finalRelationType = relationType;
        if (!finalRelationType) {
          const allowedTypes = this.getAllowedRelations(newNode.type, relatedNode.type);
          if (allowedTypes.length > 0) {
            finalRelationType = allowedTypes[0]; // Use the first allowed relation type
          }
        }

        // Create the edge if we have a valid relation type
        if (finalRelationType && this.isValidRelation(newNode.type, relatedNode.type, finalRelationType)) {
          this.addEdge(newNode.id, nodeId, finalRelationType);
        }
      });
    }

    return newNode;
  }

  public getAllowedRelations(sourceType: Node['type'], targetType: Node['type']): string[] {
    return allowedRelations[sourceType]?.[targetType] || [];
  }

  public isValidRelation(sourceType: Node['type'], targetType: Node['type'], relationType: string): boolean {
    const allowedTypes = this.getAllowedRelations(sourceType, targetType);
    return allowedTypes.includes(relationType);
  }

  public addEdge(sourceId: string, targetId: string, relationType: string): Edge | null {
    const sourceNode = this.getNodeById(sourceId);
    const targetNode = this.getNodeById(targetId);

    if (!sourceNode || !targetNode) {
      return null;
    }

    if (!this.isValidRelation(sourceNode.type, targetNode.type, relationType)) {
      return null;
    }

    const newEdge: Edge = {
      id: uuidv4(),
      source: sourceId,
      target: targetId,
      label: relationType
    };

    this.data.edges.push(newEdge);
    return newEdge;
  }

  public searchNodes(query: string): Node[] {
    const searchLower = query.toLowerCase();
    return this.data.nodes.filter(node => {
      const nameMatch = node.label.toLowerCase().includes(searchLower);
      const descMatch = node.description?.toLowerCase().includes(searchLower) || false;
      return nameMatch || descMatch;
    });
  }

  public getNodeById(id: string): Node | undefined {
    return this.data.nodes.find(node => node.id === id);
  }

  public getRelatedNodes(nodeId: string): Node[] {
    const edges = this.getEdgesByNodeId(nodeId);
    const relatedNodeIds = new Set<string>();
    
    // Get all node IDs where the passed node is either source or target
    edges.forEach(edge => {
      if (edge.source === nodeId) {
        relatedNodeIds.add(edge.target);
      }
      if (edge.target === nodeId) {
        relatedNodeIds.add(edge.source);
      }
    });
    
    // Convert node IDs to actual nodes
    return Array.from(relatedNodeIds)
      .map(id => this.getNodeById(id))
      .filter((node): node is Node => node !== null);
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