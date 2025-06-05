import { BaseArchitectureTool } from '../baseTool';
import { architectureService } from '../../../services/architectureService';
import { diagramService } from '../../../services/diagramService';

export class FindAndShowNodesWithRelationsTool extends BaseArchitectureTool {
  constructor() {
    super(
      'findAndShowNodesWithRelations',
      'Find nodes by name or description and show them in the diagram along with their related nodes'
    );
  }

  async execute(input: string): Promise<string> {
    // Remove quotes and trim
    const query = input.replace(/['"]/g, '').trim();
    const nodes = await architectureService.searchNodes(query);
    
    // Show the nodes and their relations in the diagram
    for (const node of nodes) {
      await diagramService.showNode(node.id);
      const relatedNodes = await architectureService.getRelatedNodes(node.id);
      for (const relatedNode of relatedNodes) {
        await diagramService.showNode(relatedNode.id);
      }
    }

    return JSON.stringify({
      nodes,
      message: `Found and showed ${nodes.length} nodes and their relations matching "${query}"`
    });
  }
} 