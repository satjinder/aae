import { BaseArchitectureTool } from '../baseTool';
import { diagramService } from '../../../services/diagramService';

export class GetVisibleEdgesOnDiagramTool extends BaseArchitectureTool {
  constructor() {
    super(
      'getVisibleEdgesOnDiagram',
      'Get all currently visible edges in the diagram'
    );
  }

  async execute(input: string): Promise<string> {
    const edges = diagramService.getEdges();
    return JSON.stringify(edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label
    })));
  }
} 