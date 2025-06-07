import { BaseArchitectureTool, ToolMetadata } from '../baseTool';
import { diagramService } from '../../../services/diagramService';
import { z } from 'zod';

export class ManageNodeVisibilityTool extends BaseArchitectureTool {
  constructor() {
    const metadata: ToolMetadata = {
      name: 'manageNodeVisibility',
      description: 'Add or remove nodes from the diagram',
      inputSchema: z.union([
        z.array(z.object({
          nodeId: z.string(),
          action: z.enum(['add', 'remove', 'show', 'hide'])
        })),
        z.string().describe('CSV format: "action,nodeId1,nodeId2,..." or semicolon-separated format: "nodeId1,action1; nodeId2,action2; ..."')
      ]),
      outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
        results: z.array(z.object({
          nodeId: z.string(),
          success: z.boolean(),
          error: z.string().optional()
        }))
      }),
      usageGuidelines: [
        'Use this tool to control node visibility in the diagram',
        'Can add or remove multiple nodes at once',
        'Supports multiple input formats for flexibility',
        'Use when you need to show or hide specific nodes in the visualization',
        'Helpful for focusing on specific parts of the architecture'
      ],
      examples: [
        {
          input: '[{"nodeId": "node1", "action": "add"}, {"nodeId": "node2", "action": "remove"}]',
          output: '{"success":true,"message":"2 nodes processed","results":[{"nodeId":"node1","success":true},{"nodeId":"node2","success":true}]}',
          description: 'Add one node and remove another using JSON format'
        },
        {
          input: 'add,node1,node2,node3',
          output: '{"success":true,"message":"3 nodes processed","results":[{"nodeId":"node1","success":true},{"nodeId":"node2","success":true},{"nodeId":"node3","success":true}]}',
          description: 'Add multiple nodes using CSV format'
        }
      ]
    };
    super(metadata);
  }

  async execute(input: string): Promise<string> {
    try {
      let nodeActions: Array<{ nodeId: string; action: string }>;

      // Try to parse as JSON first
      try {
        const jsonInput = JSON.parse(input);
        if (Array.isArray(jsonInput)) {
          // Handle array of node actions
          nodeActions = jsonInput;
        } else if (jsonInput.nodeId && jsonInput.action) {
          // Handle single node action
          nodeActions = [jsonInput];
        } else {
          throw new Error('Invalid JSON format');
        }
      } catch {
        // If JSON parsing fails, try semicolon-separated format first
        if (input.includes(';')) {
          const pairs = input.split(';').map(pair => pair.trim());
          nodeActions = pairs.map(pair => {
            const [nodeId, action] = pair.split(',').map(s => s.trim());
            return { nodeId, action };
          });
        } else {
          // Try CSV format as fallback
          const parts = input.split(',');
          if (parts.length < 2) {
            return this.validateOutput({
              error: true,
              message: 'Input must be either JSON format, CSV format, or semicolon-separated format'
            });
          }
          const action = parts[0].trim();
          const nodeIds = parts.slice(1).map(id => id.trim());
          nodeActions = nodeIds.map(nodeId => ({ nodeId, action }));
        }
      }

      // Validate and normalize actions
      const validActions = ['add', 'remove', 'show', 'hide'];
      const invalidActions = nodeActions.filter(na => !validActions.includes(na.action));
      if (invalidActions.length > 0) {
        return this.validateOutput({
          error: true,
          message: `Invalid actions found: ${invalidActions.map(na => na.action).join(', ')}. Valid actions are: ${validActions.join(', ')}`
        });
      }

      // Perform the actions for each node
      const results = nodeActions.map(({ nodeId, action }) => {
        try {
          const normalizedAction = action === 'show' ? 'add' : action === 'hide' ? 'remove' : action;
          if (normalizedAction === 'add') {
            diagramService.addNode(nodeId);
          } else {
            diagramService.removeNode(nodeId);
          }
          return { nodeId, success: true };
        } catch (error) {
          return { nodeId, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.length - successCount;

      return this.validateOutput({
        success: true,
        message: `${successCount} nodes processed${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
        results
      });
    } catch (error) {
      return this.validateOutput({
        error: true,
        message: `Error managing node visibility: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
} 