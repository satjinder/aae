import { BaseArchitectureTool, ToolMetadata } from '../baseTool';
import { diagramService } from '../../../services/diagramService';
import { z } from 'zod';

export class GetVisibleNodesOnDiagramTool extends BaseArchitectureTool {
  constructor() {
    const metadata: ToolMetadata = {
      name: 'getVisibleNodesOnDiagram',
      description: 'Get all currently visible nodes on the diagram',
      inputSchema: z.string().optional().describe('No input required, but can be used to filter nodes by type'),
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
        'Use this tool when the user refers to nodes using phrases like "this node", "that service", etc.',
        'If multiple nodes are visible, ask for clarification about which node they\'re referring to',
        'If only one node is visible, use that as the context for their query',
        'If no nodes are visible, ask them to select or point to the node they\'re interested in'
      ],
      examples: [
        {
          input: '',
          output: '{"nodes":[{"id":"1","name":"Payment Service","type":"domainService"}],"message":"Found 1 visible node"}',
          description: 'Get all visible nodes when one node is shown'
        },
        {
          input: 'domainService',
          output: '{"nodes":[{"id":"1","name":"Payment Service","type":"domainService"}],"message":"Found 1 visible domain service"}',
          description: 'Get visible nodes filtered by type'
        }
      ]
    };
    super(metadata);
  }

  async execute(input: string): Promise<string> {
    const nodes = await diagramService.getVisibleNodes();
    const filteredNodes = input ? nodes.filter(node => node.type === input) : nodes;
    return this.validateOutput({
      nodes: filteredNodes,
      message: `Found ${filteredNodes.length} visible ${input ? input : 'node'}${filteredNodes.length === 1 ? '' : 's'}`
    });
  }
} 