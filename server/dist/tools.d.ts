/**
 * 9 Consolidated Gateway Tools
 *
 * Reduces 52+ individual tools to 9 gateway tools with action routing.
 * ~85% token reduction in system prompt. Plugin tools are collapsed behind
 * the nexus_plugin dispatcher (O(1) context cost instead of O(N*M)).
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { NexusClient } from './client.js';
export declare const NEXUS_TOOLS: Tool[];
export declare function handleToolCall(client: NexusClient, toolName: string, args: Record<string, any>): Promise<any>;
//# sourceMappingURL=tools.d.ts.map