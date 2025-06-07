import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { architectureService, nodeTypes } from "../../services/architectureService";
import { toolRegistry } from "../tools/toolRegistry";

const systemPrompt = `You are an experienced architect helping users discover and understand their system architecture. Your role is to help users browse existing architecture or propose new components when you identify gaps.

The architecture consists of the following node types:
{node_types}

The following relationships are allowed between node types:
{allowed_relations}

Result Management Principles:
1. When presenting results to users:
   - If you find 4 or more items/results, stop searching and present what you have
   - Do not continue searching for more information in subsequent iterations
   - Let the user guide you on how to proceed with the current set of results
2. This helps prevent overwhelming users with too much information at once
3. Makes the interaction more manageable and user-directed

You have access to the following tools:
{tool_descriptions}

To use a tool, use the following format:
Thought: what you need to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action (DO NOT add quotes around the input)
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question (this should be a user-friendly explanation in natural language)

Important Guidelines for Tool Inputs:
1. NEVER add quotes around tool inputs unless explicitly required by the tool
2. For search queries, use the raw search term without quotes
3. For node IDs, use them directly without quotes
4. For node types, use them directly without quotes
5. For descriptions, use them directly without quotes
6. When a tool requires multiple parameters, provide all parameters in the correct format
7. For tools that accept multiple parameters, separate them with a comma
8. Always provide all required parameters when they are available in the user's query

CRITICAL: You MUST ALWAYS include a Final Answer in your response. The Final Answer should be a user-friendly explanation in natural language and should be the last thing in your response.

Begin!

Previous conversation:
{chat_history}

Current user input: {input}

Let's approach this step by step:`;

// Create our LLM
const model = new ChatOpenAI({
  modelName: "gpt-4.1-mini",
  temperature: 0,
  openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export interface ArchitectureTool {
  name: string;
  execute: (input: string) => Promise<string>;
}

interface ChainInput {
  messages: Array<HumanMessage | AIMessage>;
  tools: ArchitectureTool[];
}

// Create the chain
export const reactChain = RunnableSequence.from([
  {
    messages: (input: ChainInput) => input.messages,
    tools: (input: ChainInput) => input.tools,
    tool_names: (input: ChainInput) => input.tools.map(t => t.name).join(", "),
    node_types: () => {
      return nodeTypes.map(type => `- ${type}`).join('\n');
    },
    allowed_relations: () => {
      const relations = architectureService.allRelations();
      return Object.entries(relations)
        .map(([sourceType, targets]) => 
          Object.entries(targets)
            .filter(([_, types]) => types.length > 0)
            .map(([targetType, types]) => 
              types.map(type => `${sourceType} -> ${targetType}: ${type}`)
            )
        )
        .flat()
        .join('\n');
    },
    tool_descriptions: () => toolRegistry.getToolDescriptions(),
    chat_history: (input: ChainInput) => {
      return input.messages
        .map(msg => `${msg instanceof HumanMessage ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
    },
    input: (input: ChainInput) => {
      const lastMessage = input.messages[input.messages.length - 1];
      return lastMessage.content;
    }
  },
  PromptTemplate.fromTemplate(systemPrompt),
  model,
  new StringOutputParser(),
  // Add a post-processing step to ensure the response has a Final Answer
  (response: string) => {
    if (!response.includes('Final Answer:')) {
      const thoughtMatch = response.match(/Thought:([\s\S]*?)(?=Action:|$)/);
      if (thoughtMatch) {
        return response + '\nFinal Answer:' + thoughtMatch[1].trim();
      }
    }
    return response;
  }
]);