import { HumanMessage, AIMessage, BaseMessage, MessageType } from "@langchain/core/messages";
import type { Node } from "../services/architectureService";
import { reactChain } from "./chains/reactChain";
import { architectureTools } from "./tools/architecture";
import { diagramTools } from "./tools/diagram";
import type { ArchitectureTool } from "./chains/reactChain";

// Custom message type for tool results
class ToolResultMessage extends BaseMessage {
  type = 'tool_result' as MessageType;

  constructor(content: string) {
    super(content);
  }

  _getType(): MessageType {
    return 'tool_result' as MessageType;
  }
}

export interface AgentResponse {
  thought: string;
  action: string;
  actionInput: string;
  observation: string;
  finalAnswer: string;
}

export type MessageCallback = (message: { role: 'assistant', content: string }) => void;

// Helper function to execute tools
async function executeTool(toolName: string, toolInput: string): Promise<string> {
  const allTools: ArchitectureTool[] = [...architectureTools, ...diagramTools];
  const tool = allTools.find((t: ArchitectureTool) => t.name === toolName);
  
  if (!tool) {
    throw new Error(`Tool ${toolName} not found`);
  }

  try {
    return await tool.execute(toolInput);
  } catch (error: unknown) {
    console.error(`Error executing tool ${toolName}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({ 
      error: true, 
      message: `Failed to execute ${toolName}: ${errorMessage}` 
    });
  }
}

export class ArchitectureAgent {
  private static instance: ArchitectureAgent;
  private chain = reactChain;
  private messageCallback?: MessageCallback;

  private constructor() {}

  public static getInstance(): ArchitectureAgent {
    if (!ArchitectureAgent.instance) {
      ArchitectureAgent.instance = new ArchitectureAgent();
    }
    return ArchitectureAgent.instance;
  }

  public setMessageCallback(callback: MessageCallback) {
    this.messageCallback = callback;
  }

  private sendMessage(content: string) {
    if (this.messageCallback) {
      this.messageCallback({ role: 'assistant', content });
    }
  }

  private extractField(lines: string[], prefix: string): string {
    const line = lines.find((l: string) => l.startsWith(prefix));
    if (!line) return '';
    return line.replace(prefix, '').trim();
  }

  async invoke(input: string, chatHistory: Array<BaseMessage> = []): Promise<AgentResponse> {
    let currentMessages = [
      new HumanMessage(input),
      ...chatHistory
    ];
    let finalThought = '';
    let finalAction = '';
    let finalActionInput = '';
    let finalObservation = '';
    let finalAnswer = '';

    const MAX_ITERATIONS = 5;
    let iteration = 0;

    while (iteration < MAX_ITERATIONS) {
      iteration++;
      const chainInput = {
        messages: currentMessages,
        tools: [...architectureTools, ...diagramTools],
      };

      const response = await this.chain.invoke(chainInput);
      const lines = response.split('\n');
      
      const thought = this.extractField(lines, 'Thought:');
      const userMessage = this.extractField(lines, 'User Message:');
      const action = this.extractField(lines, 'Action:');
      const actionInput = this.extractField(lines, 'Action Input:');
      const observation = this.extractField(lines, 'Observation:');
      const answer = this.extractField(lines, 'Final Answer:');

      // Send user-friendly message if available
      if (userMessage) {
        this.sendMessage(userMessage);
      }

      // If no action is suggested, we're done
      if (!action) {
        finalAnswer = answer || finalAnswer;
        break;
      }

      // Execute the tool
      const toolResult = await executeTool(action, actionInput);
      const parsedResult = JSON.parse(toolResult);

      // Update final values
      finalThought = thought;
      finalAction = action;
      finalActionInput = actionInput;
      finalObservation = toolResult;
      finalAnswer = answer;

      // Add the interaction to messages for context
      currentMessages = [
        ...currentMessages,
        new AIMessage(response),
        new ToolResultMessage(`Tool ${action} result: ${JSON.stringify(JSON.parse(toolResult), null, 2)}`)
      ];

      // If this is the last iteration, break
      if (iteration === MAX_ITERATIONS - 1) {
        finalAnswer = answer;
        break;
      }
    }

    // If we hit the max iterations, set the final answer
    if (iteration >= MAX_ITERATIONS) {
      finalAnswer = finalAnswer || 'Maximum iterations reached. Would you like to continue?';
    }

    // Send the final answer
    if (finalAnswer) {
      this.sendMessage(finalAnswer);
    }

    return {
      thought: finalThought,
      action: finalAction,
      actionInput: finalActionInput,
      observation: finalObservation,
      finalAnswer
    };
  }
}

// Export a singleton instance
export const architectureAgent = ArchitectureAgent.getInstance(); 