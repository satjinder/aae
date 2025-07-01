import { architectureService } from './architectureService';
import type { Node, Edge } from './architectureService';

interface DiagramState {
  visibleNodes: Set<string>;
  expandedNodes: Set<string>;
  nodeDimensions: Record<string, { x: number; y: number; width?: number; height?: number }>;
}

export interface DiagramNode extends Node {
  relatedNodes: Node[];
  width?: number;
  height?: number;
}

export class DiagramService {
  private static instance: DiagramService;
  private state: DiagramState;

  private constructor() {
    this.state = {
      visibleNodes: new Set(),
      expandedNodes: new Set(),
      nodeDimensions: {}
    };
    this.initialize();
  }

  private initialize() {
    // Get all nodes from architecture service but don't make them visible
    architectureService.getAllData();
    // Start with empty visible nodes
    this.state.visibleNodes.clear();
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
    const nodes: (DiagramNode | null)[] = Array.from(this.state.visibleNodes)
      .map(id => {
        const node = architectureService.getNodeById(id);
        if (!node) return null;
        const relatedNodes = architectureService.getRelatedNodes(id);
        const dims = this.getNodeDimensions(id);
        return {
          ...node,
          relatedNodes,
          position: dims ? { x: dims.x, y: dims.y } : node.position,
          width: dims?.width,
          height: dims?.height
        };
      });
    // Remove nulls and ensure type
    return nodes.filter((node): node is DiagramNode => node !== null);
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
  }

  public refresh() {
    this.initialize();
  }

  public setNodeDimensions(nodeId: string, dims: { x: number; y: number; width?: number; height?: number }) {
    this.state.nodeDimensions[nodeId] = { ...dims };
  }

  public getNodeDimensions(nodeId: string): { x: number; y: number; width?: number; height?: number } | undefined {
    return this.state.nodeDimensions[nodeId];
  }
}

// Export a singleton instance
export const diagramService = DiagramService.getInstance(); 