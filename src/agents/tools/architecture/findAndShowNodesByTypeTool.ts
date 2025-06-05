import { BaseArchitectureTool } from '../baseTool';
import { architectureService } from '../../../services/architectureService';
import { diagramService } from '../../../services/diagramService';

export class FindAndShowNodesByTypeTool extends BaseArchitectureTool {
  constructor() {
    super(
      'findAndShowNodesByType',
      'Find nodes by keyword in name/description and node type, then show them in the diagram. Input format: "keyword,nodeType"'
    );
  }

  async execute(input: string): Promise<string> {
    try {
      // Remove quotes and trim
      const cleanInput = input.replace(/['"]/g, '').trim();
      
      // Split input into keyword and nodeType
      const parts = cleanInput.split(',').map(part => part.trim());
      
      if (parts.length !== 2) {
        return JSON.stringify({
          error: true,
          message: 'Please provide both keyword and node type in the format: "keyword,nodeType"'
        });
      }

      const [keyword, nodeType] = parts;
      
      if (!keyword) {
        return JSON.stringify({
          error: true,
          message: 'Please provide a keyword to search for'
        });
      }

      if (!nodeType) {
        return JSON.stringify({
          error: true,
          message: 'Please provide a node type'
        });
      }

      // Validate node type
      const validNodeTypes = Object.keys(architectureService.allRelations());
      if (!validNodeTypes.includes(nodeType)) {
        return JSON.stringify({
          error: true,
          message: `Invalid node type. Valid types are: ${validNodeTypes.join(', ')}`
        });
      }

      // Search nodes using the new method
      const nodes = architectureService.searchNodesByTypeAndKeyword(keyword, nodeType as any);
      
      if (nodes.length === 0) {
        return JSON.stringify({
          nodes: [],
          message: `No nodes found matching "${keyword}" of type "${nodeType}"`
        });
      }

      // Show the nodes in the diagram
      for (const node of nodes) {
        await diagramService.showNode(node.id);
      }

      return JSON.stringify({
        nodes,
        message: `Found and showed ${nodes.length} nodes matching "${keyword}" of type "${nodeType}"`
      });
    } catch (error) {
      return JSON.stringify({
        error: true,
        message: `Error executing findAndShowNodesByType: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
} 