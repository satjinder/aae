export * from './architecture';
export * from './diagram';

import { architectureTools } from './architecture';
import { diagramTools } from './diagram';

export const allTools = [
  ...architectureTools,
  ...diagramTools
]; 