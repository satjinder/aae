import { BaseArchitectureTool } from './baseTool';
import { architectureTools } from './architecture';
import { diagramTools } from './diagram';

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, BaseArchitectureTool> = new Map();

  private constructor() {
    this.registerTools([...architectureTools, ...diagramTools]);
  }

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  private registerTools(tools: BaseArchitectureTool[]) {
    for (const tool of tools) {
      if (this.tools.has(tool.name)) {
        console.warn(`Tool ${tool.name} is already registered. Overwriting...`);
      }
      this.tools.set(tool.name, tool);
    }
  }

  public getTool(name: string): BaseArchitectureTool | undefined {
    return this.tools.get(name);
  }

  public getAllTools(): BaseArchitectureTool[] {
    return Array.from(this.tools.values());
  }

  public getToolDescriptions(): string {
    return this.getAllTools()
      .map(tool => `${tool.name}: ${tool.fullDescription}`)
      .join('\n\n');
  }

  public getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  public async executeTool(name: string, input: string): Promise<string> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    try {
      return await tool.execute(input);
    } catch (error) {
      console.error(`Error executing tool ${name}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return JSON.stringify({ 
        error: true, 
        message: `Failed to execute ${name}: ${errorMessage}` 
      });
    }
  }
}

export const toolRegistry = ToolRegistry.getInstance(); 