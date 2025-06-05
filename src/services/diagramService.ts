import { architectureService } from './architectureService';
import type { Node, Edge } from './architectureService';

interface DiagramState {
  visibleNodes: Set<string>;
  expandedNodes: Set<string>;
}

export interface DiagramNode extends Node {
  relatedNodes: Node[];
}

export class DiagramService {
  private static instance: DiagramService;
  private state: DiagramState;
  private nodes: Node[] = [];
  private edges: Edge[] = [];

  private constructor() {
    this.state = {
      visibleNodes: new Set(),
      expandedNodes: new Set()
    };
  }

  public static getInstance(): DiagramService {
    if (!DiagramService.instance) {
      DiagramService.instance = new DiagramService();
    }
    return DiagramService.instance;
  }

  public addNode(nodeId: string) {
    this.state.visibleNodes.add(nodeId);
  }

  public removeNode(nodeId: string) {
    this.state.visibleNodes.delete(nodeId);
  }

  public isNodeVisible(nodeId: string): boolean {
    return this.state.visibleNodes.has(nodeId);
  }

  public getVisibleNodes(): DiagramNode[] {
    return Array.from(this.state.visibleNodes)
      .map(id => {
        const node = architectureService.getNodeById(id);
        if (!node) return null;
        
        // Get related nodes for this node
        const relatedNodes = architectureService.getRelatedNodes(id);
        
        // Return node with related nodes data
        return {
          ...node,
          relatedNodes
        };
      })
      .filter((node): node is DiagramNode => node !== null);
  }

  public getEdges(): Edge[] {
    // Get all edges from the architecture service
    const allEdges = architectureService.getAllData().edges;
    
    // Filter edges to only include those where both source and target nodes are visible
    return allEdges.filter(edge => 
      this.state.visibleNodes.has(edge.source) && 
      this.state.visibleNodes.has(edge.target)
    );
  }

  async showNode(nodeId: string): Promise<void> {
    this.state.visibleNodes.add(nodeId);
  }

  async hideNode(nodeId: string): Promise<void> {
    this.state.visibleNodes.delete(nodeId);
  }

  async toggleNode(nodeId: string): Promise<void> {
    if (this.state.visibleNodes.has(nodeId)) {
      this.state.visibleNodes.delete(nodeId);
    } else {
      this.state.visibleNodes.add(nodeId);
    }
  }

  async expandNode(nodeId: string): Promise<void> {
    this.state.expandedNodes.add(nodeId);
  }

  async collapseNode(nodeId: string): Promise<void> {
    this.state.expandedNodes.delete(nodeId);
  }

  async getVisibleEdges(): Promise<Edge[]> {
    return this.getEdges();
  }

  async clear(): Promise<void> {
    this.state.visibleNodes.clear();
    this.state.expandedNodes.clear();
    this.nodes = [];
    this.edges = [];
  }
}

// Export a singleton instance
export const diagramService = DiagramService.getInstance(); 