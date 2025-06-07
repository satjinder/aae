// Architecture tools
import { FindAndShowNodesByTypeTool } from './findAndShowNodesByTypeTool';
import { CreateNodeTool } from './createNodeTool';
import { FindAndShowRelatedNodesByNodeIdTool } from './findAndShowRelatedNodesByNodeIdTool';
import { AnalyzeGapsTool } from './analyzeGapsTool';

// Export all architecture tools
export const architectureTools = [
  new AnalyzeGapsTool(),
  new FindAndShowNodesByTypeTool(),
  new CreateNodeTool(),
  new FindAndShowRelatedNodesByNodeIdTool()
]; 