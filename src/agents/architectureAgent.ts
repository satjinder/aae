import { HumanMessage, AIMessage, BaseMessage, MessageType } from "@langchain/core/messages";
import type { Node } from "../services/architectureService";
import { reactChain } from "./chains/reactChain";
import { toolRegistry } from "./tools/toolRegistry";
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

export interface ChatMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
}

export type MessageCallback = (messages: ChatMessage[]) => void;

export class ArchitectureAgent {
  private static instance: ArchitectureAgent;
  private chain = reactChain;
  private messageCallback?: MessageCallback;
  private messageHistory: Array<BaseMessage> = [];
  private readonly MAX_ITERATIONS = 5;

  private constructor() {}

  public static getInstance(): ArchitectureAgent {
    if (!ArchitectureAgent.instance) {
      ArchitectureAgent.instance = new ArchitectureAgent();
    }
    return ArchitectureAgent.instance;
  }

  public setMessageCallback(callback: MessageCallback) {
    this.messageCallback = callback;
    // Immediately notify with current history
    this.notifyMessageCallback();
  }

  private notifyMessageCallback() {
    if (this.messageCallback) {
      this.messageCallback(this.getMessageHistory());
    }
  }

  public getMessageHistory(): ChatMessage[] {
    return this.messageHistory.map(msg => ({
      role: msg instanceof HumanMessage ? 'user' 
        : msg instanceof ToolResultMessage ? 'tool'
        : 'assistant',
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      timestamp: new Date()
    }));
  }

  public clearHistory() {
    this.messageHistory = [];
    this.notifyMessageCallback();
  }

  private addMessage(message: BaseMessage) {
    this.messageHistory.push(message);
    this.notifyMessageCallback();
  }

  private extractField(lines: string[], prefix: string): string {
    const startIndex = lines.findIndex((l: string) => l.trim().startsWith(prefix));
    if (startIndex === -1) {
      console.log(`Field "${prefix}" not found in response`);
      return '';
    }
    
    const nextPrefixIndex = lines.findIndex((l: string, i) => 
      i > startIndex && 
      (l.trim().startsWith('Thought:') || 
       l.trim().startsWith('Action:') || 
       l.trim().startsWith('Action Input:') || 
       l.trim().startsWith('Observation:') || 
       l.trim().startsWith('Final Answer:'))
    );
    
    const endIndex = nextPrefixIndex === -1 ? lines.length : nextPrefixIndex;
    const fieldLines = lines.slice(startIndex, endIndex);
    
    return fieldLines
      .map((line, i) => i === 0 ? line.replace(prefix, '').trim() : line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();
  }

  private async processIteration(
    currentMessages: Array<BaseMessage>,
    iteration: number
  ): Promise<{
    thought: string;
    action: string;
    actionInput: string;
    observation: string;
    answer: string;
    shouldContinue: boolean;
  }> {
    const chainInput = {
      messages: currentMessages,
      tools: toolRegistry.getAllTools(),
    };

    const response = await this.chain.invoke(chainInput);
    console.log('Raw chain response:', response);
    
    // Debug: Log the response format
    console.log('Response type:', typeof response);
    console.log('Response structure:', JSON.stringify(response, null, 2));
    
    // Handle both string and object responses
    let responseText: string;
    if (typeof response === 'string') {
      responseText = response;
    } else if (response && typeof response === 'object') {
      // If it's an object, try to extract the content
      const responseObj = response as { content?: string; text?: string };
      responseText = responseObj.content || responseObj.text || JSON.stringify(response);
    } else {
      console.error('Unexpected response format:', response);
      responseText = '';
    }
    
    // Check if this is a conversational response (no structured fields)
    if (!responseText.includes('Thought:') && 
        !responseText.includes('Action:') && 
        !responseText.includes('Action Input:') && 
        !responseText.includes('Observation:') && 
        !responseText.includes('Final Answer:')) {
      // This is a conversational response, treat it as the final answer
      this.addMessage(new AIMessage(responseText));
      return {
        thought: '',
        action: '',
        actionInput: '',
        observation: '',
        answer: responseText,
        shouldContinue: false
      };
    }
    
    // Split response into lines and clean up
    const lines = responseText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    console.log('Cleaned lines:', lines);
    
    const thought = this.extractField(lines, 'Thought:');
    const action = this.extractField(lines, 'Action:');
    const actionInput = this.extractField(lines, 'Action Input:');
    const observation = this.extractField(lines, 'Observation:');
    const answer = this.extractField(lines, 'Final Answer:');

    console.log('Extracted fields:', {
      thought,
      action,
      actionInput,
      observation,
      answer
    });

    // If no action is suggested, we're done
    if (!action) {
      if (answer) {
        this.addMessage(new AIMessage(answer));
      }
      return {
        thought,
        action,
        actionInput,
        observation,
        answer,
        shouldContinue: false
      };
    }

    // Execute the tool
    const toolResult = await toolRegistry.executeTool(action, actionInput);

    // Add the tool result to the message history for context
    const toolMessage = new ToolResultMessage(`Tool ${action} result: ${toolResult}`);
    this.addMessage(toolMessage);

    // Add the final answer if available
    if (answer) {
      this.addMessage(new AIMessage(answer));
    }

    return {
      thought,
      action,
      actionInput,
      observation: toolResult,
      answer,
      shouldContinue: iteration < this.MAX_ITERATIONS - 1
    };
  }

  async invoke(input: string): Promise<AgentResponse> {
    // Create and add user message to history
    const userMessage = new HumanMessage(input);
    this.addMessage(userMessage);

    let currentMessages = [userMessage, ...this.messageHistory];
    let finalThought = '';
    let finalAction = '';
    let finalActionInput = '';
    let finalObservation = '';
    let finalAnswer = '';

    let iteration = 0;
    let shouldContinue = true;

    while (iteration < this.MAX_ITERATIONS && shouldContinue) {
      iteration++;
      
      const result = await this.processIteration(currentMessages, iteration);
      
      finalThought = result.thought;
      finalAction = result.action;
      finalActionInput = result.actionInput;
      finalObservation = result.observation;
      finalAnswer = result.answer;
      shouldContinue = result.shouldContinue;

      currentMessages = [userMessage, ...this.messageHistory];
    }

    // If we hit the max iterations, set the final answer
    if (iteration >= this.MAX_ITERATIONS) {
      finalAnswer = finalAnswer || 'Maximum iterations reached. Would you like to continue?';
    }

    // Send the final answer if we haven't already
    if (finalAnswer && !this.messageHistory.some(msg => msg.content === finalAnswer)) {
      this.addMessage(new AIMessage(finalAnswer));
    }

    return {
      thought: finalThought,
      action: finalAction,
      actionInput: finalActionInput,
      observation: finalObservation,
      finalAnswer: finalAnswer || finalThought
    };
  }
}

// Export a singleton instance
export const architectureAgent = ArchitectureAgent.getInstance(); 