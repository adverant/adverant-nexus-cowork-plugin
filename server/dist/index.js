#!/usr/bin/env node
/**
 * Adverant Nexus — Unified Cowork Plugin MCP Server
 *
 * Entry point for the MCP server that provides consolidated gateway tools
 * covering the entire Nexus platform. Tools are discovered dynamically
 * based on the user's subscription tier and installed marketplace plugins.
 *
 * Core tools (always available):
 *   - Skills Engine (discover, invoke, synthesize, sync)
 *   - GraphRAG Memory (store, recall, episodes)
 *   - Documents (store, ingest, retrieve)
 *   - Knowledge Graph (entities, facts, cross-domain)
 *   - Search & Retrieval (semantic, graph, hybrid)
 *   - Agent Orchestration (MageAgent)
 *   - System Health & Model Management
 *
 * Dynamic tools (tier + plugin dependent):
 *   - Validation, K8s, codebase, infrastructure tools (higher tiers)
 *   - Marketplace plugin tools (per installed plugins)
 *
 * Authentication: Requires NEXUS_API_KEY environment variable.
 * Transport: STDIO (default for Claude Desktop/Cowork plugins).
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
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
// Names of the 8 consolidated tools (used to avoid duplicates during discovery)
const consolidatedToolNames = new Set(NEXUS_TOOLS.map(t => t.name));
// Dynamic tools with TTL cache (refreshed per-request, max once per minute)
let toolCache = null;
const TOOL_CACHE_TTL = 60_000; // 1 minute
async function getDiscoveredTools() {
    if (toolCache && Date.now() < toolCache.expiresAt) {
        return toolCache.tools;
    }
    const tools = await discoverTools();
    toolCache = { tools, expiresAt: Date.now() + TOOL_CACHE_TTL };
    return tools;
}
const server = new Server({
    name: 'adverant-nexus',
    version: '1.0.8',
}, {
    capabilities: {
        tools: {},
    },
});
// ---------------------------------------------------------------------------
// Dynamic Tool Discovery
// ---------------------------------------------------------------------------
/**
 * Discover additional tools from the gateway based on user's tier + plugins.
 * This is additive — the 8 consolidated tools are always available regardless.
 * If discovery fails, the plugin works exactly as before with just the 8 tools.
 */
async function discoverTools() {
    try {
        const inventory = await nexusClient.getToolInventory();
        // Platform tools not already covered by the 8 consolidated tools
        const extraPlatformTools = (inventory.platformTools || [])
            .filter((t) => !consolidatedToolNames.has(t.name))
            .map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema || { type: 'object', properties: {} },
        }));
        // Marketplace plugin tools
        const pluginTools = (inventory.pluginTools || []).map((pt) => ({
            name: pt.name,
            description: `[${pt.pluginName}] ${pt.description}`,
            inputSchema: pt.inputSchema || { type: 'object', properties: {} },
        }));
        const tools = [...extraPlatformTools, ...pluginTools];
        console.error(`  Dynamic tools: ${tools.length} discovered (${extraPlatformTools.length} platform, ${pluginTools.length} plugin)`);
        console.error(`  Tier: ${inventory.userTier}`);
        if (inventory.activePlugins?.length > 0) {
            console.error(`  Plugins: ${inventory.activePlugins.map((p) => p.pluginSlug).join(', ')}`);
        }
        return tools;
    }
    catch (err) {
        // Discovery failure is non-fatal — plugin works with core 8 tools
        console.error(`  Dynamic discovery unavailable: ${err instanceof Error ? err.message : String(err)}`);
        return [];
    }
}
// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------
// List tools — core 8 + any discovered dynamic tools (refreshed via TTL cache)
server.setRequestHandler(ListToolsRequestSchema, async () => {
    const dynamicTools = await getDiscoveredTools();
    return { tools: [...NEXUS_TOOLS, ...dynamicTools] };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        // Core consolidated tools use the optimized local handler
        if (consolidatedToolNames.has(name)) {
            result = await handleToolCall(nexusClient, name, args || {});
        }
        else {
            // Dynamic tool — proxy through gateway's /api/tools/execute
            const response = await nexusClient.executeTool(name, args || {});
            result = response.result ?? response;
        }
        return {
            content: [
                {
                    type: 'text',
                    text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
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
async function main() {
    // Pre-warm the tool cache before connecting (non-blocking on failure)
    toolCache = { tools: await discoverTools(), expiresAt: Date.now() + TOOL_CACHE_TTL };
    const transport = new StdioServerTransport();
    await server.connect(transport);
    const dynamicCount = toolCache?.tools.length || 0;
    const totalTools = NEXUS_TOOLS.length + dynamicCount;
    console.error(`Adverant Nexus MCP server started`);
    console.error(`  API: ${config.apiUrl}`);
    console.error(`  Tools: ${totalTools} (${NEXUS_TOOLS.length} core + ${dynamicCount} dynamic)`);
    console.error(`  User: ${config.userId}`);
}
main().catch((err) => {
    console.error('Fatal error starting Nexus MCP server:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map