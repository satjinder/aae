// Types for our architecture nodes
export type NodeType = 'capability' | 'domainService' | 'api' | 'event' | 'dataProduct';

export interface Node {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  visible: boolean;
  expanded: boolean;
  relatedNodes: Node[];
  position: { x: number; y: number };
  data?: Record<string, any>;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
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
export const allowedRelations: Record<Node['type'], Record<Node['type'], string[]>> = {
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

export class ArchitectureService {
  private static instance: ArchitectureService;
  private data: ArchitectureData;

  private constructor(data: ArchitectureData = typedArchitectureData) {
    this.data = data;
  }

  public static getInstance(): ArchitectureService {
    if (!ArchitectureService.instance) {
      ArchitectureService.instance = new ArchitectureService();
    }
    return ArchitectureService.instance;
  }

  public createNode(data: {
    type: Node['type'];
    name: string;
    description?: string;
    data?: Record<string, unknown>;
    position?: { x: number; y: number };
    relatedNodes?: Array<{
      nodeId: string;
      relationType?: string;
    }>;
  }): Node {
    const newNode: Node = {
      id: uuidv4(),
      type: data.type,
      name: data.name,
      description: data.description || '',
      position: data.position || { x: 0, y: 0 },
      data: data.data || {},
      relatedNodes: [],
      visible: true,
      expanded: true
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

  public allRelations(): Record<Node['type'], Record<Node['type'], string[]>> {
    return allowedRelations;
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
    const searchTerm = query.toLowerCase();
    return this.data.nodes.filter(node => 
      node.name.toLowerCase().includes(searchTerm) ||
      node.description.toLowerCase().includes(searchTerm) ||
      node.type.toLowerCase().includes(searchTerm)
    );
  }

  public getNodeById(id: string): Node | undefined {
    return this.data.nodes.find(node => node.id === id);
  }

  public getRelatedNodes(nodeId: string): Node[] {
    const node = this.data.nodes.find(n => n.id === nodeId);
    if (!node) return [];
    
    // Get all edges connected to this node
    const edges = this.getEdgesByNodeId(nodeId);
    
    // Get all connected node IDs
    const connectedNodeIds = new Set<string>();
    edges.forEach(edge => {
      if (edge.source === nodeId) connectedNodeIds.add(edge.target);
      if (edge.target === nodeId) connectedNodeIds.add(edge.source);
    });
    
    // Return all connected nodes
    return this.data.nodes.filter(n => connectedNodeIds.has(n.id));
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

  // public addNode(node: Node) {
  //   // Ensure the node has a position
  //   if (!node.position) {
  //     node.position = { x: 0, y: 0 };
  //   }
  //   this.data.nodes.push(node);
  // }

  public analyzeGaps(): string[] {
    const allNodes = this.data.nodes;
    const nodeTypes = new Set(allNodes.map(n => n.type));
    const allNodeTypes: Node['type'][] = ['capability', 'domainService', 'api', 'event', 'dataProduct'];
    const missingTypes = allNodeTypes.filter(type => !nodeTypes.has(type));
    return missingTypes;
  }

  /**
   * Search nodes by keyword in name and description, filtered by node type
   * @param keyword - The search term to look for in node names and descriptions
   * @param nodeType - Optional node type to filter the results
   * @returns Array of nodes matching the search criteria
   */
  public searchNodesByTypeAndKeyword(keyword: string, nodeType?: Node['type']): Node[] {
    const searchTerm = keyword.toLowerCase();
    
    return this.data.nodes.filter(node => {
      // First check if node type matches (if specified)
      if (nodeType && node.type !== nodeType) {
        return false;
      }
      
      // Then check if name or description contains the keyword
      return node.name.toLowerCase().includes(searchTerm) ||
             node.description.toLowerCase().includes(searchTerm);
    });
  }
}

// Export a singleton instance
export const architectureService = ArchitectureService.getInstance(); 