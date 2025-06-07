import { BaseArchitectureTool, ToolMetadata } from '../baseTool';
import { architectureService } from '../../../services/architectureService';
import { diagramService } from '../../../services/diagramService';
import { NodeType } from '../../../services/architectureService';
import { z } from 'zod';

export class FindAndShowRelatedNodesByNodeIdTool extends BaseArchitectureTool {
  constructor() {
    const metadata: ToolMetadata = {
      name: 'findAndShowRelatedNodesByNodeId',
      description: 'Find and show all nodes related to a specific node by its ID',
      inputSchema: z.union([
        z.object({
          nodeId: z.string(),
          targetType: z.string().optional()
        }),
        z.string().describe('CSV format: "nodeId,targetType" (targetType is optional)')
      ]),
      outputSchema: z.object({
        message: z.string(),
        nodes: z.array(z.object({
          id: z.string(),
          name: z.string(),
          type: z.string(),
          description: z.string().optional()
        })).optional(),
        paths: z.array(z.object({
          description: z.string(),
          nodes: z.array(z.object({
            id: z.string(),
            name: z.string(),
            type: z.string()
          })),
          relations: z.array(z.string())
        })).optional(),
        relationType: z.enum(['direct', 'indirect']).optional()
      }),
      usageGuidelines: [
        'Use this tool when you have a specific node ID and want to find its related nodes',
        'First tries to find direct relationships between nodes',
        'If no direct relationships are found, searches for indirect paths through intermediate nodes',
        'If targetType is specified, only returns relationships to nodes of that type',
        'The tool will show all found nodes in the diagram',
        'Use this tool when analyzing how components are connected in the architecture'
      ],
      examples: [
        {
          input: '{"nodeId": "payment-service-1"}',
          output: '{"message":"Found and displayed 3 directly related nodes","nodes":[{"id":"1","name":"Payment Gateway","type":"externalService"}],"relationType":"direct"}',
          description: 'Find all nodes directly related to a payment service'
        },
        {
          input: 'payment-service-1,capability',
          output: '{"message":"Found and displayed 2 paths from node payment-service-1 to capability nodes","paths":[{"description":"Payment Service -> Payment Processing Capability","nodes":[{"id":"1","name":"Payment Service","type":"domainService"},{"id":"2","name":"Payment Processing Capability","type":"capability"}],"relations":["implements"]}],"relationType":"indirect"}',
          description: 'Find all paths from a payment service to capability nodes'
        }
      ]
    };
    super(metadata);
  }

  async execute(input: string): Promise<string> {
    try {
      let nodeId: string;
      let targetType: string | undefined;

      // Try to parse as JSON first
      try {
        const jsonInput = JSON.parse(input);
        nodeId = jsonInput.nodeId;
        targetType = jsonInput.targetType;
      } catch {
        // If JSON parsing fails, try CSV format
        const parts = input.split(',').map(part => part.trim());
        if (parts.length < 1) {
          return this.validateOutput({
            error: true,
            message: 'Input must be either JSON format or CSV format with at least nodeId'
          });
        }
        nodeId = parts[0];
        targetType = parts[1];
      }

      if (!nodeId) {
        return this.validateOutput({
          error: true,
          message: 'nodeId is required'
        });
      }

      // First try direct relations
      const directRelatedNodes = architectureService.getRelatedNodes(nodeId);
      
      // If we have direct relations and no specific target type requested, return those
      if (directRelatedNodes.length > 0 && !targetType) {
        // Show the related nodes in the diagram
        for (const node of directRelatedNodes) {
          await diagramService.showNode(node.id);
        }

        return this.validateOutput({
          message: `Found and displayed ${directRelatedNodes.length} directly related nodes`,
          nodes: directRelatedNodes.map(node => ({
            id: node.id,
            name: node.name,
            type: node.type,
            description: node.description
          })),
          relationType: 'direct'
        });
      }

      // Validate targetType if provided
      if (targetType) {
        const validNodeTypes = Object.keys(architectureService.allRelations());
        if (!validNodeTypes.includes(targetType)) {
          return this.validateOutput({
            error: true,
            message: `Invalid target type. Valid types are: ${validNodeTypes.join(', ')}`
          });
        }
        // check if   directRelatedNodes has the targetType if yes then return the nodes of the targetType
        if (directRelatedNodes.some(node => node.type === targetType)) {
          const filteredNodes = directRelatedNodes.filter(node => node.type === targetType);
          // Show only the filtered nodes in the diagram
          for (const node of filteredNodes) {
            await diagramService.showNode(node.id);
          }
          return this.validateOutput({
            message: `Found and displayed ${filteredNodes.length} directly related ${targetType} nodes`,
            nodes: filteredNodes.map(node => ({
              id: node.id,
              name: node.name,
              type: node.type,
              description: node.description
            })),
            relationType: 'direct'
          });
        }
      }

      // If no direct relations found or specific target type requested, try indirect paths
      const paths = architectureService.findPathsFromNodeToType(nodeId, targetType as NodeType || 'any');
      
      if (!paths.length) {
        return this.validateOutput({
          message: `No relations found for node ${nodeId}${targetType ? ` to ${targetType} nodes` : ''}`,
          nodes: [],
          paths: []
        });
      }

      // Show all nodes in the paths in the diagram
      const allNodes = new Set(paths.flatMap(path => path.nodes));
      for (const node of allNodes) {
        await diagramService.showNode(node.id);
      }

      return this.validateOutput({
        message: `Found and displayed ${paths.length} paths from node ${nodeId}${targetType ? ` to ${targetType} nodes` : ''}`,
        paths: paths.map(path => ({
          description: architectureService.getNodePathDescription(path),
          nodes: path.nodes.map(node => ({
            id: node.id,
            name: node.name,
            type: node.type
          })),
          relations: path.relations
        })),
        relationType: 'indirect'
      });
    } catch (error) {
      return this.validateOutput({
        error: true,
        message: `Failed to get related nodes: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
} 