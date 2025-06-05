import { BaseArchitectureTool } from '../baseTool';
import { diagramService } from '../../../services/diagramService';

export class CollapseNodeTool extends BaseArchitectureTool {
  constructor() {
    super({
      name: "collapseNode",
      description: "Collapse a node to hide its related nodes",
      func: async (nodeId: string) => {
        const relatedNodes = diagramService.getVisibleNodes()
          .find(n => n.id === nodeId)?.relatedNodes || [];
        relatedNodes.forEach(node => diagramService.removeNode(node.id));
        return JSON.stringify({ success: true, relatedNodes });
      }
    });
  }
} 