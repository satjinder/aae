import { BaseArchitectureTool } from '../baseTool';
import { diagramService } from '../../../services/diagramService';
import type { ToolMetadata } from '../baseTool';

export class ManageNodeVisibilityTool extends BaseArchitectureTool {
  constructor() {
    const metadata: ToolMetadata = {
      name: 'manageNodeVisibility',
      description: 'Add or remove nodes from the diagram. Input can be JSON format: [{"nodeId": "id", "action": "add"|"remove"}], CSV format: "action,nodeId1,nodeId2,...", or semicolon-separated format: "nodeId1,action1; nodeId2,action2; ..."'
    };
    super(metadata);
  }

  getGuidance(): string {
    return `This tool helps manage node visibility in the diagram. You can:
1. Add nodes to make them visible
2. Remove nodes to hide them
3. Process multiple nodes at once

Input formats supported:
- JSON: [{"nodeId": "id", "action": "add"|"remove"}]
- CSV: "action,nodeId1,nodeId2,..."
- Semicolon-separated: "nodeId1,action1; nodeId2,action2; ..."

Valid actions:
- add/show: Make a node visible
- remove/hide: Hide a node

Example inputs:
- JSON: [{"nodeId": "node1", "action": "add"}, {"nodeId": "node2", "action": "remove"}]
- CSV: "add,node1,node2,node3"
- Semicolon: "node1,add; node2,remove; node3,show"

The tool will return a summary of successful and failed operations.`;
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
            return JSON.stringify({
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
        return JSON.stringify({
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

      return JSON.stringify({
        success: true,
        message: `${successCount} nodes processed${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
        results
      });
    } catch (error) {
      return JSON.stringify({
        error: true,
        message: `Error managing node visibility: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
} 