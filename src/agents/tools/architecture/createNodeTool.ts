import { BaseArchitectureTool } from '../baseTool';
import { architectureService } from '../../../services/architectureService';
import { diagramService } from '../../../services/diagramService';

export class CreateNodeTool extends BaseArchitectureTool {
  constructor() {
    super(
      'createNode',
      'Create a new node in the architecture. Input format: {"type": "nodeType", "name": "nodeName", "description": "nodeDescription", "relatedNodes": [{"nodeId": "id", "relationType": "type"}]}'
    );
  }

  async execute(input: string): Promise<string> {
    try {
      // Parse the input JSON
      const nodeData = JSON.parse(input);

      // Validate required fields
      if (!nodeData.type || !nodeData.name) {
        return JSON.stringify({
          error: true,
          message: 'Node type and name are required'
        });
      }

      // Validate node type
      const validNodeTypes = Object.keys(architectureService.allRelations());
      if (!validNodeTypes.includes(nodeData.type)) {
        return JSON.stringify({
          error: true,
          message: `Invalid node type. Valid types are: ${validNodeTypes.join(', ')}`
        });
      }

      // Create the node
      const newNode = architectureService.createNode({
        type: nodeData.type,
        name: nodeData.name,
        description: nodeData.description || '',
        data: nodeData.data || {},
        position: nodeData.position || { x: 0, y: 0 },
        relatedNodes: nodeData.relatedNodes || []
      });

      // Show the node in the diagram
      await diagramService.showNode(newNode.id);

      return JSON.stringify({
        success: true,
        node: newNode,
        message: `Created new ${nodeData.type} node: ${nodeData.name}`
      });
    } catch (error) {
      return JSON.stringify({
        error: true,
        message: `Error creating node: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
} 