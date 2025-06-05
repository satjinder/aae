import { BaseArchitectureTool } from '../baseTool';
import { architectureService } from '../../../services/architectureService';

export class AnalyzeGapsTool extends BaseArchitectureTool {
  constructor() {
    super({
      name: "analyzeGaps",
      description: "Analyze the architecture for potential gaps or improvements",
      func: async () => {
        const gaps = architectureService.analyzeGaps();
        return JSON.stringify(gaps);
      }
    });
  }
} 