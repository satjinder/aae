import { BaseArchitectureTool } from '../baseTool';
import { diagramService } from '../../../services/diagramService';

export class ClearDiagramTool extends BaseArchitectureTool {
  constructor() {
    super({
      name: "clearDiagram",
      description: "Clear all nodes from the diagram",
      func: async () => {
        diagramService.clear();
        return JSON.stringify({ success: true, message: 'Diagram cleared successfully' });
      }
    });
  }
} 