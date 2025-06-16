// Types for our architecture nodes
export type NodeType = 'business_area' | 'business_domain' | 'service_domain' | 'api' | 'event' | 'bom' | 'system' | 'dev_team' | 'business_team' | 'business_owner';

// Import architecture data from JSON files
import { allNodes, allEdges } from '../data';
import { v4 as uuidv4 } from 'uuid';

// Type assertion for imported JSON data
const typedBusinessAreaNodes = allNodes as Array<{ id: string; name: string; type: NodeType; description: string }>;

// Type for business area edges
interface BusinessAreaEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

// Type assertion for edges
const typedBusinessAreaEdges = allEdges as BusinessAreaEdge[];

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

export const nodeTypes: NodeType[] = [
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

// Maximum number of hops allowed in relation paths
export const MAX_RELATION_HOPS = 4;

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

export class ArchitectureService {
  private static instance: ArchitectureService;
  private data: ArchitectureData;

  private constructor(data: ArchitectureData = { nodes: [], edges: [] }) {
    // Initialize with edges data from business areas
    this.data = {
      nodes: data.nodes.length > 0 ? data.nodes : typedBusinessAreaNodes.map((nodeData) => ({
        ...nodeData,
        visible: true,
        expanded: true,
        relatedNodes: [],
        position: { x: 0, y: 0 }
      })),
      edges: data.edges.length > 0 ? data.edges : typedBusinessAreaEdges.map((edge: BusinessAreaEdge) => ({
        id: edge.source + '-' + edge.target,
        source: edge.source,
        target: edge.target,
        label: edge.label
      }))
    };
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
      (node.name?.toLowerCase() || '').includes(searchTerm) ||
      (node.description?.toLowerCase() || '').includes(searchTerm) ||
      (node.type?.toLowerCase() || '').includes(searchTerm)
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

  /**
   * Finds all possible relation paths between two node types, including indirect paths through intermediate nodes
   * @param sourceType - The source node type
   * @param targetType - The target node type
   * @returns Array of relation paths, where each path is an array of relation types
   */
  public findRelationPaths(sourceType: NodeType, targetType: NodeType): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();

    const findPaths = (currentType: NodeType, targetType: NodeType, currentPath: string[], hops: number) => {
      // If we've reached the target type, add the path
      if (currentType === targetType) {
        paths.push([...currentPath]);
        return;
      }

      // Stop if we've reached the maximum number of hops
      if (hops >= MAX_RELATION_HOPS) {
        return;
      }

      // Mark current type as visited
      visited.add(currentType);

      // Try all possible node types as intermediate steps
      for (const intermediateType of nodeTypes) {
        // Skip if we've already visited this type
        if (visited.has(intermediateType)) continue;

        // Check if there's a direct relation from current to intermediate
        const relationsToIntermediate = this.getAllowedRelations(currentType, intermediateType);
        if (relationsToIntermediate.length > 0) {
          // For each possible relation, try to find a path to target
          for (const relation of relationsToIntermediate) {
            currentPath.push(relation);
            findPaths(intermediateType, targetType, currentPath, hops + 1);
            currentPath.pop();
          }
        }
      }

      // Backtrack
      visited.delete(currentType);
    };

    // Start the path finding from the source type with 0 hops
    findPaths(sourceType, targetType, [], 0);

    return paths;
  }

  /**
   * Gets a human-readable description of a relation path
   * @param path - Array of relation types forming a path
   * @returns Human-readable description of the path
   */
  public getRelationPathDescription(path: string[]): string {
    if (path.length === 0) return 'No path found';
    if (path.length === 1) return path[0];

    return path.join(' → ');
  }

  /**
   * Finds the shortest path(s) from a specific node to any node of a target type
   * @param sourceNodeId - The ID of the source node
   * @param targetType - The target node type to find paths to
   * @returns Array of shortest paths, where each path contains the sequence of nodes and relations
   */
  public findPathsFromNodeToType(sourceNodeId: string, targetType: NodeType): Array<{
    path: string[];
    nodes: Node[];
    relations: string[];
  }> {
    const sourceNode = this.getNodeById(sourceNodeId);
    if (!sourceNode) {
      return [];
    }

    const paths: Array<{
      path: string[];
      nodes: Node[];
      relations: string[];
      length: number;
    }> = [];
    const visited = new Set<string>();
    let shortestPathLength = Infinity;

    const findPaths = (
      currentNode: Node,
      currentPath: string[],
      currentNodes: Node[],
      currentRelations: string[],
      currentLength: number
    ) => {
      // If we've reached a node of the target type
      if (currentNode.type === targetType) {
        // Only add the path if it's not longer than the current shortest path
        if (currentLength <= shortestPathLength) {
          // If this path is shorter than current shortest, clear previous paths
          if (currentLength < shortestPathLength) {
            paths.length = 0;
            shortestPathLength = currentLength;
          }
          paths.push({
            path: [...currentPath],
            nodes: [...currentNodes],
            relations: [...currentRelations],
            length: currentLength
          });
        }
        return;
      }

      // Stop if we've already found a shorter path
      if (currentLength >= shortestPathLength) {
        return;
      }

      // Mark current node as visited
      visited.add(currentNode.id);

      // Get all connected nodes
      const connectedNodes = this.getConnectedNodes(currentNode.id);
      const edges = this.getEdgesByNodeId(currentNode.id);

      // For each connected node
      for (const connectedNode of connectedNodes) {
        // Skip if we've already visited this node
        if (visited.has(connectedNode.id)) continue;

        // Find the edge between current and connected node
        const edge = edges.find(e => 
          (e.source === currentNode.id && e.target === connectedNode.id) ||
          (e.source === connectedNode.id && e.target === currentNode.id)
        );

        if (edge) {
          // Add the node and relation to the current path
          currentPath.push(connectedNode.id);
          currentNodes.push(connectedNode);
          currentRelations.push(edge.label);

          // Continue searching from this node
          findPaths(connectedNode, currentPath, currentNodes, currentRelations, currentLength + 1);

          // Backtrack
          currentPath.pop();
          currentNodes.pop();
          currentRelations.pop();
        }
      }

      // Backtrack
      visited.delete(currentNode.id);
    };

    // Start the path finding from the source node
    findPaths(sourceNode, [sourceNodeId], [sourceNode], [], 0);

    // Return only the path information without the length property
    return paths.map(({ path, nodes, relations }) => ({
      path,
      nodes,
      relations
    }));
  }

  /**
   * Gets a human-readable description of a node path
   * @param path - The path object containing nodes and relations
   * @returns Human-readable description of the path
   */
  public getNodePathDescription(path: {
    path: string[];
    nodes: Node[];
    relations: string[];
  }): string {
    if (path.nodes.length === 0) return 'No path found';
    if (path.nodes.length === 1) return path.nodes[0].name;

    const descriptions: string[] = [];
    for (let i = 0; i < path.nodes.length - 1; i++) {
      descriptions.push(`${path.nodes[i].name} (${path.nodes[i].type})`);
      descriptions.push(path.relations[i]);
    }
    descriptions.push(`${path.nodes[path.nodes.length - 1].name} (${path.nodes[path.nodes.length - 1].type})`);

    return descriptions.join(' → ');
  }
}

// Export a singleton instance
export const architectureService = ArchitectureService.getInstance(); 