export { ToggleNodeTool } from './toggleNodeTool';
export { ExpandNodeTool } from './expandNodeTool';
export { CollapseNodeTool } from './collapseNodeTool';
export { GetVisibleNodesOnDiagramTool } from './getVisibleNodesToolOnDiagram';
export { GetVisibleEdgesOnDiagramTool } from './getVisibleEdgesOnDiagramTool';
export { ClearDiagramTool } from './clearDiagramTool';

import { ToggleNodeTool } from './toggleNodeTool';
import { ExpandNodeTool } from './expandNodeTool';
import { CollapseNodeTool } from './collapseNodeTool';
import { GetVisibleNodesOnDiagramTool } from './getVisibleNodesToolOnDiagram';
import { GetVisibleEdgesOnDiagramTool } from './getVisibleEdgesOnDiagramTool';
import { ClearDiagramTool } from './clearDiagramTool';

export const diagramTools = [
  new ToggleNodeTool(),
  new ExpandNodeTool(),
  new CollapseNodeTool(),
  new GetVisibleNodesOnDiagramTool(),
  new GetVisibleEdgesOnDiagramTool(),
  new ClearDiagramTool()
]; 