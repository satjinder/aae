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
  needsConfirmation?: boolean;
  currentAction?: {
    type: 'show' | 'search' | 'analyze' | 'getRelations';
    node?: Node;
  };
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
    let needsConfirmation = false;
    let currentAction: AgentResponse['currentAction'] = undefined;

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
      
      // Helper function to safely extract field values
      const extractField = (prefix: string): string => {
        const line = lines.find((l: string) => l.startsWith(prefix));
        if (!line) return '';
        return line.replace(prefix, '').trim();
      };

      const thought = extractField('Thought:');
      const action = extractField('Action:');
      const actionInput = extractField('Action Input:');
      const observation = extractField('Observation:');
      const answer = extractField('Final Answer:');
      const userMessage = extractField('User Message:');
      const confirmationMessage = extractField('Confirmation Message:');
      const currentActionStr = extractField('Current Action:');

      // If no action is suggested, we're done
      if (!action) {
        finalAnswer = answer || finalAnswer;
        if (userMessage) {
          this.sendMessage(userMessage);
        }
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
      needsConfirmation = parsedResult.needsConfirmation;
      
      // Parse current action if present
      if (currentActionStr) {
        try {
          // Handle the simplified format that only includes the action type
          const actionType = currentActionStr.trim();
          if (['show', 'search', 'analyze', 'getRelations'].includes(actionType)) {
            currentAction = { 
              type: actionType as 'show' | 'search' | 'analyze' | 'getRelations',
              node: undefined // Make node optional
            };
          } else {
            console.error('Invalid action type:', actionType);
          }
        } catch (e) {
          console.error('Failed to parse current action:', e);
        }
      }

      // Add the interaction to messages for context
      currentMessages = [
        ...currentMessages,
        new AIMessage(response),
        new ToolResultMessage(`Tool ${action} result: ${JSON.stringify(JSON.parse(toolResult), null, 2)}`)
      ];

      // Send user-friendly message if provided
      if (userMessage) {
        this.sendMessage(userMessage);
      }

      // If we need user confirmation, send the confirmation message
      if (needsConfirmation && currentAction) {
        if (confirmationMessage) {
          this.sendMessage(confirmationMessage);
        }
        finalAnswer = answer;
        break;
      }

      // If this is the last iteration, ask if user wants to continue
      if (iteration === MAX_ITERATIONS - 1) {
        finalAnswer = answer;
        needsConfirmation = true;
        this.sendMessage("I've reached the maximum number of steps. Would you like me to continue?");
        break;
      }
    }

    // If we hit the max iterations, add a note to the final answer
    if (iteration >= MAX_ITERATIONS) {
      finalAnswer = finalAnswer || 'Maximum iterations reached. Would you like to continue?';
      needsConfirmation = true;
      this.sendMessage(finalAnswer);
    }

    return {
      thought: finalThought,
      action: finalAction,
      actionInput: finalActionInput,
      observation: finalObservation,
      finalAnswer,
      needsConfirmation,
      currentAction
    };
  }
}

// Export a singleton instance
export const architectureAgent = ArchitectureAgent.getInstance(); 