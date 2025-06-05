import { BaseArchitectureTool } from '../baseTool';
import { diagramService } from '../../../services/diagramService';

export class GetVisibleNodesOnDiagramTool extends BaseArchitectureTool {
  constructor() {
    super(
      'getVisibleNodesOnDiagram',
      'Get all currently visible nodes in the diagram'
    );
  }

  async execute(input: string): Promise<string> {
    const nodes = diagramService.getVisibleNodes();
    return JSON.stringify(nodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      description: node.description,
      relatedNodes: node.relatedNodes.map(rn => ({
        id: rn.id,
        name: rn.name,
        type: rn.type
      }))
    })));
  }
} 