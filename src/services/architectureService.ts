// Types for our architecture nodes
export type NodeType = 'business_area' | 'business_domain' | 'service_domain' | 'api' | 'event' | 'bom' | 'system' | 'dev_team' | 'business_team' | 'business_owner';

export type RoadmapAlignment = 'strategic' | 'sunset' | 'maintain' | 'transform' | 'not-aligned';
export type DomainServiceStatus = 'proposed' | 'endorsed' | 'active' | 'deprecated';

// Define relation types with their directions
export interface RelationType {
  name: string;                    // Forward relation name (source -> target)
  inverseName: string;            // Inverse relation name (target -> source)
  description: string;
  sourceType: NodeType;
  targetType: NodeType;
  isBidirectional: boolean;
}

// Define all possible relations
export const relationTypes: RelationType[] = [
  // Business Area Relations
  {
    name: 'contains',
    inverseName: 'containedBy',
    description: 'Business area contains a business domain',
    sourceType: 'business_area',
    targetType: 'business_domain',
    isBidirectional: true
  },
  {
    name: 'integrates with',
    inverseName: 'integrated by',
    description: 'Business area integrates with another business area',
    sourceType: 'business_area',
    targetType: 'business_area',
    isBidirectional: true
  },
  {
    name: 'governs',
    inverseName: 'governed by',
    description: 'Business area governs another business area',
    sourceType: 'business_area',
    targetType: 'business_area',
    isBidirectional: true
  },
  {
    name: 'shares data with',
    inverseName: 'shares data with',
    description: 'Business areas share data between them',
    sourceType: 'business_area',
    targetType: 'business_area',
    isBidirectional: true
  },

  // Business Domain Relations
  {
    name: 'implements',
    inverseName: 'implementedBy',
    description: 'Business domain is implemented by a service domain',
    sourceType: 'business_domain',
    targetType: 'service_domain',
    isBidirectional: true
  },
  {
    name: 'collaborates with',
    inverseName: 'collaborates with',
    description: 'Business domains collaborate with each other',
    sourceType: 'business_domain',
    targetType: 'business_domain',
    isBidirectional: true
  },

  // Service Domain Relations
  {
    name: 'exposes',
    inverseName: 'exposedBy',
    description: 'Service domain exposes an API',
    sourceType: 'service_domain',
    targetType: 'api',
    isBidirectional: true
  },
  {
    name: 'publishes',
    inverseName: 'publishedBy',
    description: 'Service domain publishes an event',
    sourceType: 'service_domain',
    targetType: 'event',
    isBidirectional: true
  },
  {
    name: 'implements',
    inverseName: 'implementedBy',
    description: 'Service domain implements a business object model',
    sourceType: 'service_domain',
    targetType: 'bom',
    isBidirectional: true
  },

  // API Relations
  {
    name: 'depends on',
    inverseName: 'required by',
    description: 'API depends on another API',
    sourceType: 'api',
    targetType: 'api',
    isBidirectional: true
  },

  // Event Relations
  {
    name: 'triggers',
    inverseName: 'triggered by',
    description: 'Event triggers a service domain action',
    sourceType: 'event',
    targetType: 'service_domain',
    isBidirectional: true
  },

  // System Relations
  {
    name: 'implements',
    inverseName: 'implementedBy',
    description: 'System implements a service domain',
    sourceType: 'system',
    targetType: 'service_domain',
    isBidirectional: true
  },
  {
    name: 'hosts',
    inverseName: 'hostedBy',
    description: 'System hosts an API',
    sourceType: 'system',
    targetType: 'api',
    isBidirectional: true
  },
  {
    name: 'publishes',
    inverseName: 'publishedBy',
    description: 'System publishes an event',
    sourceType: 'system',
    targetType: 'event',
    isBidirectional: true
  },
  {
    name: 'integrates with',
    inverseName: 'integrated by',
    description: 'System integrates with another system',
    sourceType: 'system',
    targetType: 'system',
    isBidirectional: true
  },

  // Team Relations
  {
    name: 'owns',
    inverseName: 'owned by',
    description: 'Development team owns and maintains a system',
    sourceType: 'dev_team',
    targetType: 'system',
    isBidirectional: true
  }
];

const nodeTypes: NodeType[] = [
  'business_area',
  'business_domain',
  'service_domain',
  'api',
  'event',
  'bom',
  'system',
  'dev_team',
  'business_team',
  'business_owner'
];

// Initialize empty allowed relations map with all node types
const initializeAllowedRelations = (): Record<NodeType, Record<NodeType, string[]>> => {
  const initialMap: Record<NodeType, Record<NodeType, string[]>> = {
    business_area: {
      business_area: [],
      business_domain: [],
      service_domain: [],
      api: [],
      event: [],
      bom: [],
      system: [],
      dev_team: [],
      business_team: [],
      business_owner: []
    },
    business_domain: {
      business_area: [],
      business_domain: [],
      service_domain: [],
      api: [],
      event: [],
      bom: [],
      system: [],
      dev_team: [],
      business_team: [],
      business_owner: []
    },
    service_domain: {
      business_area: [],
      business_domain: [],
      service_domain: [],
      api: [],
      event: [],
      bom: [],
      system: [],
      dev_team: [],
      business_team: [],
      business_owner: []
    },
    api: {
      business_area: [],
      business_domain: [],
      service_domain: [],
      api: [],
      event: [],
      bom: [],
      system: [],
      dev_team: [],
      business_team: [],
      business_owner: []
    },
    event: {
      business_area: [],
      business_domain: [],
      service_domain: [],
      api: [],
      event: [],
      bom: [],
      system: [],
      dev_team: [],
      business_team: [],
      business_owner: []
    },
    bom: {
      business_area: [],
      business_domain: [],
      service_domain: [],
      api: [],
      event: [],
      bom: [],
      system: [],
      dev_team: [],
      business_team: [],
      business_owner: []
    },
    system: {
      business_area: [],
      business_domain: [],
      service_domain: [],
      api: [],
      event: [],
      bom: [],
      system: [],
      dev_team: [],
      business_team: [],
      business_owner: []
    },
    dev_team: {
      business_area: [],
      business_domain: [],
      service_domain: [],
      api: [],
      event: [],
      bom: [],
      system: [],
      dev_team: [],
      business_team: [],
      business_owner: []
    },
    business_team: {
      business_area: [],
      business_domain: [],
      service_domain: [],
      api: [],
      event: [],
      bom: [],
      system: [],
      dev_team: [],
      business_team: [],
      business_owner: []
    },
    business_owner: {
      business_area: [],
      business_domain: [],
      service_domain: [],
      api: [],
      event: [],
      bom: [],
      system: [],
      dev_team: [],
      business_team: [],
      business_owner: []
    }
  };
  
  return initialMap;
};

// Generate allowed relations map from relation types
export const allowedRelations: Record<NodeType, Record<NodeType, string[]>> = 
  relationTypes.reduce((acc, relation) => {
    // Add forward relation
    if (!acc[relation.sourceType][relation.targetType].includes(relation.name)) {
      acc[relation.sourceType][relation.targetType].push(relation.name);
    }
    // Add inverse relation if bidirectional
    if (relation.isBidirectional && !acc[relation.targetType][relation.sourceType].includes(relation.inverseName)) {
      acc[relation.targetType][relation.sourceType].push(relation.inverseName);
    }
    return acc;
  }, initializeAllowedRelations());

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

  public allRelations(): Record<NodeType, Record<NodeType, string[]>> {
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
    const allNodeTypes: Node['type'][] = ['business_area', 'business_domain', 'service_domain', 'api', 'event', 'bom', 'system', 'dev_team', 'business_team', 'business_owner'];
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