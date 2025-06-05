import { BaseArchitectureTool } from '../baseTool';
import { diagramService } from '../../../services/diagramService';

export class ExpandNodeTool extends BaseArchitectureTool {
  constructor() {
    super({
      name: "expandNode",
      description: "Expand a node to show its related nodes",
      func: async (nodeId: string) => {
        const relatedNodes = diagramService.getVisibleNodes()
          .find(n => n.id === nodeId)?.relatedNodes || [];
        relatedNodes.forEach(node => diagramService.addNode(node.id));
        return JSON.stringify({ success: true, relatedNodes });
      }
    });
  }
} 