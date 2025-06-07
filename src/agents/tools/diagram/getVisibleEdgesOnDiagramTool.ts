import { BaseArchitectureTool, ToolMetadata } from '../baseTool';
import { diagramService } from '../../../services/diagramService';
import { z } from 'zod';

export class GetVisibleEdgesOnDiagramTool extends BaseArchitectureTool {
  constructor() {
    const metadata: ToolMetadata = {
      name: 'getVisibleEdgesOnDiagram',
      description: 'Get all currently visible edges in the diagram',
      inputSchema: z.string().optional().describe('No input required, but can be used to filter edges by label'),
      outputSchema: z.object({
        edges: z.array(z.object({
          id: z.string(),
          source: z.string(),
          target: z.string(),
          label: z.string()
        })),
        message: z.string()
      }),
      usageGuidelines: [
        'Use this tool to get information about relationships between visible nodes',
        'Helpful for understanding how different components are connected',
        'Can be used to analyze dependencies and interactions',
        'Use when user asks about relationships or connections between nodes'
      ],
      examples: [
        {
          input: '',
          output: '{"edges":[{"id":"1","source":"node1","target":"node2","label":"depends on"}],"message":"Found 1 visible edge"}',
          description: 'Get all visible edges'
        },
        {
          input: 'depends on',
          output: '{"edges":[{"id":"1","source":"node1","target":"node2","label":"depends on"}],"message":"Found 1 edge with label \'depends on\'"}',
          description: 'Get edges filtered by label'
        }
      ]
    };
    super(metadata);
  }

  async execute(input: string): Promise<string> {
    const edges = diagramService.getEdges();
    const filteredEdges = input ? edges.filter(edge => edge.label === input) : edges;
    return this.validateOutput({
      edges: filteredEdges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label
      })),
      message: `Found ${filteredEdges.length} visible ${input ? `edge with label '${input}'` : 'edge'}${filteredEdges.length === 1 ? '' : 's'}`
    });
  }
} 