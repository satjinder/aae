import { BaseArchitectureTool } from '../baseTool';
import { diagramService } from '../../../services/diagramService';

export class ToggleNodeTool extends BaseArchitectureTool {
  constructor() {
    super({
      name: "toggleNode",
      description: "Toggle the visibility of a node in the diagram",
      func: async (nodeId: string) => {
        if (diagramService.isNodeVisible(nodeId)) {
          diagramService.removeNode(nodeId);
        } else {
          diagramService.addNode(nodeId);
        }
        return JSON.stringify({ success: true });
      }
    });
  }
} 