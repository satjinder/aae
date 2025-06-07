import { BaseArchitectureTool, ToolMetadata } from '../baseTool';
import { diagramService } from '../../../services/diagramService';
import { z } from 'zod';

export class GetVisibleNodesOnDiagramTool extends BaseArchitectureTool {
  constructor() {
    const metadata: ToolMetadata = {
      name: 'getVisibleNodesOnDiagram',
      description: 'Get all currently visible nodes on the diagram',
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
        }
      ]
    };
    super(metadata);
  }

  async execute(input: string): Promise<string> {
    const nodes = await diagramService.getVisibleNodes();
    return this.validateOutput({
      nodes,
      message: `Found ${nodes.length} visible node${nodes.length === 1 ? '' : 's'}`
    });
  }
} 