import { BaseArchitectureTool, ToolMetadata } from '../baseTool';
import { architectureService } from '../../../services/architectureService';
import { diagramService } from '../../../services/diagramService';
import { z } from 'zod';

export class CreateNodeTool extends BaseArchitectureTool {
  constructor() {
    const metadata: ToolMetadata = {
      name: 'createNode',
      description: 'Create a new node in the architecture with specified properties',
      inputSchema: z.object({
        name: z.string().min(1),
        type: z.string(),
        description: z.string().optional(),
        properties: z.record(z.string()).optional()
      }),
      outputSchema: z.object({
        message: z.string(),
        node: z.object({
          id: z.string(),
          name: z.string(),
          type: z.string(),
          description: z.string().optional(),
          properties: z.record(z.string()).optional()
        })
      }),
      usageGuidelines: [
        'Use this tool when you need to create a new node in the architecture',
        'The name field is required and must be non-empty',
        'The type field must be one of the valid node types',
        'Description and properties are optional',
        'The tool will automatically show the created node in the diagram',
        'Use this tool when adding new components, services, or capabilities to the architecture'
      ],
      examples: [
        {
          input: '{"name": "Payment Service", "type": "domainService", "description": "Handles payment processing"}',
          output: '{"message":"Created new domainService node: Payment Service","node":{"id":"1","name":"Payment Service","type":"domainService","description":"Handles payment processing"}}',
          description: 'Create a new domain service node'
        },
        {
          input: '{"name": "User Authentication", "type": "capability", "properties": {"priority": "high"}}',
          output: '{"message":"Created new capability node: User Authentication","node":{"id":"2","name":"User Authentication","type":"capability","properties":{"priority":"high"}}}',
          description: 'Create a new capability node with properties'
        }
      ]
    };
    super(metadata);
  }

  async execute(input: string): Promise<string> {
    try {
      const { name, type, description, properties } = this.validateInput(input);

      // Validate node type
      const validNodeTypes = Object.keys(architectureService.allRelations());
      if (!validNodeTypes.includes(type)) {
        return this.validateOutput({
          error: true,
          message: `Invalid node type. Valid types are: ${validNodeTypes.join(', ')}`
        });
      }

      // Create the node
      const node = architectureService.createNode({
        type,
        name,
        description: description || '',
        data: properties || {},
        position: { x: 0, y: 0 }
      });

      // Show the node in the diagram
      await diagramService.showNode(node.id);

      return this.validateOutput({
        message: `Created new ${type} node: ${name}`,
        node: {
          id: node.id,
          name: node.name,
          type: node.type,
          description: node.description,
          properties: node.data
        }
      });
    } catch (error) {
      return this.validateOutput({
        error: true,
        message: `Failed to create node: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
} 