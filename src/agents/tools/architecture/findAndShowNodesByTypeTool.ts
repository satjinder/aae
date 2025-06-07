import { BaseArchitectureTool, ToolMetadata } from '../baseTool';
import { architectureService } from '../../../services/architectureService';
import { diagramService } from '../../../services/diagramService';
import { z } from 'zod';

export class FindAndShowNodesByTypeTool extends BaseArchitectureTool {
  constructor() {
    const metadata: ToolMetadata = {
      name: 'findAndShowNodesByType',
      description: 'Find nodes by keyword in name/description and node type, then show them in the diagram',
      inputSchema: z.string().describe('Comma-separated string in format: "keyword,nodeType"'),
      outputSchema: z.object({
        nodes: z.array(z.object({
          id: z.string(),
          name: z.string(),
          type: z.string(),
          description: z.string().optional()
        })),
        message: z.string()
      }),
      usageGuidelines: [
        'Use this tool when the user mentions both a keyword and a specific node type',
        'The keyword can be part of the node name or description',
        'The node type must be one of the valid architecture node types',
        'This tool is more specific than findAndShowNodes as it filters by node type',
        'If you need to find nodes without type filtering, use findAndShowNodes instead'
      ],
      examples: [
        {
          input: 'payment,domainService',
          output: '{"nodes":[{"id":"1","name":"Payment Processing Service","type":"domainService"}],"message":"Found 1 payment-related domain service"}',
          description: 'Find all domain services related to payments'
        },
        {
          input: 'user management,capability',
          output: '{"nodes":[{"id":"2","name":"User Management Capability","type":"capability"}],"message":"Found 1 user management capability"}',
          description: 'Find all capabilities related to user management'
        }
      ]
    };
    super(metadata);
  }

  async execute(input: string): Promise<string> {
    try {
      const [keyword, nodeType] = input.split(',').map(part => part.trim());
      
      if (!keyword || !nodeType) {
        return this.validateOutput({
          nodes: [],
          message: 'Both keyword and nodeType are required in format: "keyword,nodeType"'
        });
      }

      // Validate node type
      const validNodeTypes = Object.keys(architectureService.allRelations());
      if (!validNodeTypes.includes(nodeType)) {
        return this.validateOutput({
          nodes: [],
          message: `Invalid node type. Valid types are: ${validNodeTypes.join(', ')}`
        });
      }

      const nodes = await architectureService.searchNodes(keyword);
      const filteredNodes = nodes.filter(node => node.type === nodeType);

      // Show the nodes in the diagram
      for (const node of filteredNodes) {
        await diagramService.showNode(node.id);
      }

      return this.validateOutput({
        nodes: filteredNodes,
        message: `Found ${filteredNodes.length} ${keyword}-related ${nodeType}${filteredNodes.length === 1 ? '' : 's'}`
      });
    } catch (error) {
      return this.validateOutput({
        nodes: [],
        message: `Error finding nodes: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
} 