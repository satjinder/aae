//export { FindAndShowNodesTool } from './findAndShowNodesTool';
export { FindAndShowNodesWithRelationsTool } from './findAndShowNodesWithRelationsTool';
export { AnalyzeGapsTool } from './analyzeGapsTool';
//export { SearchNodesTool } from './searchNodesTool';
export { FindAndShowNodesByTypeTool } from './findAndShowNodesByTypeTool';
import { CreateNodeTool } from './createNodeTool';

//import { FindAndShowNodesTool } from './findAndShowNodesTool';
import { FindAndShowNodesWithRelationsTool } from './findAndShowNodesWithRelationsTool';
import { AnalyzeGapsTool } from './analyzeGapsTool';
//import { SearchNodesTool } from './searchNodesTool';
import { FindAndShowNodesByTypeTool } from './findAndShowNodesByTypeTool';

export const architectureTools = [
  //new FindAndShowNodesTool(),
  new FindAndShowNodesWithRelationsTool(),
  new AnalyzeGapsTool(),
  //new SearchNodesTool(),
  new FindAndShowNodesByTypeTool(),
  new CreateNodeTool()
]; 