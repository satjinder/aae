// Architecture tools
import { FindAndShowNodesByTypeTool } from './findAndShowNodesByTypeTool';
import { CreateNodeTool } from './createNodeTool';
import { FindAndShowRelatedNodesByNodeIdTool } from './findAndShowRelatedNodesByNodeIdTool';

// Export all architecture tools
export const architectureTools = [
  new FindAndShowNodesByTypeTool(),
  new CreateNodeTool(),
  new FindAndShowRelatedNodesByNodeIdTool()
]; 