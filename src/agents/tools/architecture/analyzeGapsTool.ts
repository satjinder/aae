import { BaseArchitectureTool, ToolMetadata } from '../baseTool';
import { architectureService } from '../../../services/architectureService';
import { z } from 'zod';

export class AnalyzeGapsTool extends BaseArchitectureTool {
  constructor() {
    const metadata: ToolMetadata = {
      name: "analyzeGaps",
      description: "Analyze the architecture for potential gaps or improvements",
      inputSchema: z.void(),
      outputSchema: z.object({
        gaps: z.array(z.object({
          type: z.string(),
          description: z.string(),
          severity: z.string(),
          recommendations: z.array(z.string())
        })),
        message: z.string()
      }),
      usageGuidelines: [
        'Use this tool to identify potential architectural gaps',
        'Helpful for architecture reviews and improvements',
        'Analyzes relationships, coverage, and best practices'
      ],
      examples: [
        {
          input: '',
          output: '{"gaps":[{"type":"coverage","description":"Missing API documentation","severity":"medium","recommendations":["Add OpenAPI specs"]}],"message":"Found 1 architectural gap"}',
          description: 'Analyze architecture for gaps'
        }
      ]
    };
    super(metadata);
  }

  async execute(): Promise<string> {
    const gaps = architectureService.analyzeGaps();
    return this.validateOutput({
      gaps,
      message: `Found ${gaps.length} architectural gap${gaps.length === 1 ? '' : 's'}`
    });
  }
} 