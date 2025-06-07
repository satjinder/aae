import { z } from 'zod';

export interface ToolMetadata {
  name: string;
  description: string;
  inputSchema?: z.ZodType<any>;
  outputSchema?: z.ZodType<any>;
  examples?: Array<{
    input: string;
    output: string;
    description: string;
  }>;
  usageGuidelines?: string[];
}

export abstract class BaseArchitectureTool {
  protected metadata: ToolMetadata;

  constructor(metadata: ToolMetadata) {
    this.metadata = metadata;
  }

  get name(): string {
    return this.metadata.name;
  }

  get description(): string {
    return this.metadata.description;
  }

  get fullDescription(): string {
    let desc = this.metadata.description;
    
    if (this.metadata.usageGuidelines?.length) {
      desc += '\n\nUsage Guidelines:\n' + 
        this.metadata.usageGuidelines.map(g => `- ${g}`).join('\n');
    }

    if (this.metadata.examples?.length) {
      desc += '\n\nExamples:\n' + 
        this.metadata.examples.map(e => 
          `Input: ${e.input}\nOutput: ${e.output}\nDescription: ${e.description}`
        ).join('\n\n');
    }

    return desc;
  }

  abstract execute(input: string): Promise<string>;

  protected validateInput(input: string): any {
    if (this.metadata.inputSchema) {
      return this.metadata.inputSchema.parse(input);
    }
    return input;
  }

  protected validateOutput(output: any): string {
    if (this.metadata.outputSchema) {
      const validated = this.metadata.outputSchema.parse(output);
      return JSON.stringify(validated);
    }
    return typeof output === 'string' ? output : JSON.stringify(output);
  }
} 