/**
 * 8 Consolidated Gateway Tools
 *
 * Reduces 52 individual tools to 8 gateway tools with action routing.
 * ~85% token reduction in system prompt (2,400 vs 15,600 tokens).
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { NexusClient } from './client.js';
export declare const NEXUS_TOOLS: Tool[];
export declare function handleToolCall(client: NexusClient, toolName: string, args: Record<string, any>): Promise<any>;
//# sourceMappingURL=tools.d.ts.map