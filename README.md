# Adverant Nexus — Cowork Plugin

Unified MCP plugin that connects Claude to the full Adverant Nexus platform: **Skills Engine**, **GraphRAG memory**, **knowledge graphs**, **document management**, **semantic search**, and **multi-agent orchestration**.

8 gateway tools, 6 skills, 3 commands, 1 agent — all through a single plugin.

## Quick Start

### Option 1: Any MCP Client (Claude Desktop, Cursor, Windsurf, etc.)

1. **Get your API key** at [dashboard.adverant.ai/dashboard/api-keys](https://dashboard.adverant.ai/dashboard/api-keys)
2. **Add to your MCP config:**

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@adverant/nexus-cowork-plugin"],
      "env": {
        "NEXUS_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

**Claude Code** (`.mcp.json` in project root):
```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@adverant/nexus-cowork-plugin"],
      "env": {
        "NEXUS_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@adverant/nexus-cowork-plugin"],
      "env": {
        "NEXUS_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

**Windsurf** (`~/.codeium/windsurf/mcp_config.json`):
```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@adverant/nexus-cowork-plugin"],
      "env": {
        "NEXUS_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

3. **Restart your client** — 8 Nexus tools will be available immediately.

### Option 2: One-Click (Existing Dashboard Users)

1. Go to [dashboard.adverant.ai/dashboard/api-keys](https://dashboard.adverant.ai/dashboard/api-keys)
2. Click **"Connect to Claude"**
3. Select your client (Claude Desktop, Claude Code, Cursor, etc.)
4. Copy the pre-filled config and paste into your config file

### Option 3: Claude Code Plugin

```bash
claude plugin install adverant-nexus
```

Then set your API key:
```bash
export NEXUS_API_KEY="your_key_here"
```

## Tools

| Tool | Description |
|------|-------------|
| `nexus_skills` | Discover, match, invoke, and manage skills from the Skills Engine |
| `nexus_skill_synth` | Synthesize new skills by combining, chaining, or specializing existing ones |
| `nexus_memory` | Store and recall information using GraphRAG-powered persistent memory |
| `nexus_documents` | Store, ingest, and retrieve documents with full-text and semantic search |
| `nexus_entities` | Manage knowledge graph entities, relationships, facts, and hierarchies |
| `nexus_search` | Semantic, graph, and hybrid search across all stored knowledge |
| `nexus_agents` | Multi-agent orchestration — collaborate, compete, analyze, synthesize |
| `nexus_system` | Platform health, model stats, and system management |

## Skills

| Skill | Trigger |
|-------|---------|
| Skill Discovery | "Find a skill for...", "Search skills..." |
| Skill Invocation | "Use skill X", "Run the code review skill" |
| Skill Synthesis | "Combine skills X and Y", "Chain these skills..." |
| Memory Management | "Remember this...", "What do you recall about..." |
| Knowledge Graph | "What entities are related to...", "Show relationships..." |
| Agent Orchestration | "Use multiple agents to...", "Have agents collaborate on..." |

## Commands

| Command | Description |
|---------|-------------|
| `/adverant-nexus:sync-skills` | Sync published skills from Skills Engine to local filesystem |
| `/adverant-nexus:skill-status` | Show skill usage stats and quality scores |
| `/adverant-nexus:health` | Check platform health and connectivity |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXUS_API_KEY` | Yes | — | Your Adverant API key |
| `NEXUS_API_URL` | No | `https://api.adverant.ai` | API endpoint URL |
| `NEXUS_USER_ID` | No | `$USER` | User identifier |
| `NEXUS_TIMEOUT` | No | `30000` | Request timeout in ms |

## Getting an API Key

1. Sign up at [adverant.ai](https://adverant.ai)
2. Go to [Dashboard > API Keys](https://dashboard.adverant.ai/dashboard/api-keys)
3. Click **Create API Key**
4. Copy the key and add it to your MCP config

## Development

```bash
cd server
npm install
npm run build
npm start
```

## License

MIT
