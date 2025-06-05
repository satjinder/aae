export interface ToolConfig {
  name: string;
  description: string;
  func: (...args: any[]) => Promise<string>;
}

export abstract class BaseArchitectureTool {
  name: string;
  description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  abstract execute(input: string): Promise<string>;
} 