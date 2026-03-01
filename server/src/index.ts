#!/usr/bin/env node
/**
 * Adverant Nexus — Unified Cowork Plugin MCP Server
 *
 * Entry point for the MCP server that provides 8 consolidated gateway
 * tools covering the entire Nexus platform:
 *   - Skills Engine (discover, invoke, synthesize, sync)
 *   - GraphRAG Memory (store, recall, episodes)
 *   - Documents (store, ingest, retrieve)
 *   - Knowledge Graph (entities, facts, cross-domain)
 *   - Search & Retrieval (semantic, graph, hybrid)
 *   - Agent Orchestration (MageAgent)
 *   - System Health & Model Management
 *
 * Authentication: Requires NEXUS_API_KEY environment variable.
 * Transport: STDIO (default for Claude Desktop/Cowork plugins).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { NexusClient } from './client.js';
import { NEXUS_TOOLS, handleToolCall } from './tools.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const config = {
  apiUrl: process.env.NEXUS_API_URL || 'https://api.adverant.ai',
  apiKey: process.env.NEXUS_API_KEY || '',
  userId: process.env.NEXUS_USER_ID || process.env.USER || 'anonymous',
  timeout: parseInt(process.env.NEXUS_TIMEOUT || '30000', 10),
};

// ---------------------------------------------------------------------------
// Validate
// ---------------------------------------------------------------------------

if (!config.apiKey) {
  console.error('ERROR: NEXUS_API_KEY environment variable is required.');
  console.error('');
  console.error('To get an API key:');
  console.error('  1. Go to https://dashboard.adverant.ai');
  console.error('  2. Navigate to Settings > API Keys');
  console.error('  3. Create a new API key');
  console.error('  4. Set NEXUS_API_KEY in your environment or Claude Desktop config');
  console.error('');
  console.error('Example (shell profile):');
  console.error('  export NEXUS_API_KEY="your_key_here"');
  console.error('');
  console.error('Example (Claude Desktop claude_desktop_config.json):');
  console.error('  { "mcpServers": { "nexus": { "env": { "NEXUS_API_KEY": "your_key" } } } }');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Initialize
// ---------------------------------------------------------------------------

const nexusClient = new NexusClient(config);

const server = new Server(
  {
    name: 'adverant-nexus',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: NEXUS_TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await handleToolCall(
      nexusClient,
      name,
      (args as Record<string, any>) || {}
    );
    return {
      content: [
        {
          type: 'text' as const,
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ success: false, error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`Adverant Nexus MCP server started`);
  console.error(`  API: ${config.apiUrl}`);
  console.error(`  Tools: ${NEXUS_TOOLS.length}`);
  console.error(`  User: ${config.userId}`);
}

main().catch((err) => {
  console.error('Fatal error starting Nexus MCP server:', err);
  process.exit(1);
});
