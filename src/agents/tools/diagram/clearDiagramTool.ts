import { BaseArchitectureTool, ToolMetadata } from '../baseTool';
import { diagramService } from '../../../services/diagramService';
import { z } from 'zod';

export class ClearDiagramTool extends BaseArchitectureTool {
  constructor() {
    const metadata: ToolMetadata = {
      name: 'clearDiagram',
      description: 'Clear all nodes from the diagram',
      inputSchema: z.void(),
      outputSchema: z.object({
        message: z.string(),
        clearedNodes: z.number()
      }),
      usageGuidelines: [
        'Use this tool when you want to start with a clean diagram',
        'This will remove all nodes from the current diagram view',
        'The nodes still exist in the architecture, they are just not shown',
        'Use this tool when you want to focus on a specific subset of nodes',
        'Be careful when using this tool as it will hide all currently visible nodes'
      ],
      examples: [
        {
          input: '',
          output: '{"message":"Cleared diagram","clearedNodes":5}',
          description: 'Clear all nodes from the diagram'
        }
      ]
    };
    super(metadata);
  }

  async execute(input: string): Promise<string> {
    try {
      // Clear the diagram
      await diagramService.clear();
      const visibleNodes = await diagramService.getVisibleNodes();
      const clearedNodes = visibleNodes.length;

      return this.validateOutput({
        message: 'Cleared diagram',
        clearedNodes
      });
    } catch (error) {
      return this.validateOutput({
        error: true,
        message: `Failed to clear diagram: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
} 