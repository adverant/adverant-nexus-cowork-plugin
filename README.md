<p align="center">
  <img src="https://adverant.ai/nexus-logo.png" alt="Adverant Nexus" width="120" />
</p>

<h1 align="center">Adverant Nexus for Claude</h1>

<p align="center">
  <strong>Give Claude persistent memory, a skills marketplace, and multi-agent superpowers.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@adverant/nexus-cowork-plugin"><img src="https://img.shields.io/npm/v/@adverant/nexus-cowork-plugin?color=blue&label=npm" alt="npm" /></a>
  <a href="https://github.com/adverant/adverant-nexus-cowork-plugin/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" /></a>
  <a href="https://adverant.ai"><img src="https://img.shields.io/badge/platform-Adverant%20Nexus-purple" alt="Adverant Nexus" /></a>
</p>

---

## The Problem

Every time you start a new conversation with Claude, it forgets everything. Your preferences, your project context, the skills you taught it, the documents you shared — gone. You start over. Every. Single. Time.

You've built workflows, refined prompts, curated knowledge — but none of it persists. Claude is powerful, but without memory, it's like hiring a brilliant contractor who shows up with amnesia every morning.

**What if Claude could remember everything, access a marketplace of reusable skills, and coordinate multiple agents — all from a single plugin?**

---

## Install in 30 Seconds

Open Claude Desktop and paste the GitHub repo URL into Browse Plugins:

```
adverant/adverant-nexus-cowork-plugin
```

**That's it.** Three steps, thirty seconds:

1. Open Claude Desktop → **Cowork** tab
2. Click **Browse Plugins** → **"+"** → **Add marketplace from GitHub**
3. Enter `adverant/adverant-nexus-cowork-plugin` → **Sync** → **Install**

No config files. No terminal commands. No API keys to manage.

---

## What You Get

```
                        ┌─────────────────────────┐
                        │   Adverant Nexus Plugin  │
                        │                          │
                        │   8 Tools  ·  6 Skills   │
                        │   3 Commands · 1 Agent   │
                        └────────────┬────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
    ┌─────────▼─────────┐  ┌────────▼────────┐  ┌─────────▼─────────┐
    │  Persistent Memory │  │ Skills Engine   │  │  Multi-Agent      │
    │                    │  │                 │  │  Orchestration    │
    │  • GraphRAG store  │  │  • 50+ skills   │  │                   │
    │  • Knowledge graph │  │  • Discover     │  │  • Collaborate    │
    │  • Entity tracking │  │  • Invoke       │  │  • Compete        │
    │  • Semantic search │  │  • Synthesize   │  │  • Analyze        │
    │  • Document mgmt   │  │  • Auto-sync    │  │  • Synthesize     │
    └───────────────────┘  └─────────────────┘  └───────────────────┘
```

### Persistent Memory That Never Forgets

Claude normally loses all context between conversations. With Nexus, everything you tell it persists in a GraphRAG knowledge graph — relationships, facts, preferences, project context. Ask Claude to "remember that our API uses JWT auth" and it's stored permanently. Next week, next month — it still knows.

```
You:    "Remember that our production database is on us-east-1
         and we use Prisma as our ORM."

Claude: Stored in your knowledge graph.

--- Two weeks later, new conversation ---

You:    "What ORM do we use?"

Claude: You use Prisma as your ORM, with your production
        database hosted on us-east-1.
```

### A Skills Marketplace for Claude

Stop rebuilding the same workflows from scratch. The Skills Engine gives Claude access to 50+ reusable, tested skills — from code review to patent creation to SEO optimization. Discover skills by describing what you need, invoke them instantly, or synthesize entirely new skills by combining existing ones.

```
You:    "Find me a skill for code review"

Claude: Found 3 matching skills:
        1. code-review (quality: 94%) — Multi-perspective security,
           logic, and integration analysis
        2. sp-requesting-code-review — Verify work meets requirements
        3. sp-receiving-code-review — Technical rigor for feedback

You:    "Combine code-review with the security analysis skill"

Claude: Synthesized new skill: secure-code-review
        Strategy: chain (code-review → security-analysis)
        Quality score: 96%
```

### Multi-Agent Orchestration

Some tasks are too complex for a single pass. Nexus lets Claude coordinate multiple AI agents that can collaborate, compete, or specialize — then synthesize the best result.

```
You:    "Have 3 agents analyze this architecture proposal —
         one for security, one for performance, one for cost."

Claude: Orchestrating 3 specialized agents...

        Security Agent:  Found 2 critical vulnerabilities
        Performance Agent: Identified 3 bottlenecks
        Cost Agent: Projected 40% savings with suggested changes

        Synthesized recommendation: [combined analysis]
```

---

## Complete Tool Reference

| Tool | What It Does | Example |
|------|-------------|---------|
| **nexus_skills** | Discover, match, and invoke skills from the marketplace | *"Find a skill for writing patents"* |
| **nexus_skill_synth** | Combine, chain, or specialize skills into new ones | *"Chain code-review and security-analysis"* |
| **nexus_memory** | Store and recall information across all conversations | *"Remember our API uses GraphQL"* |
| **nexus_documents** | Store, ingest, and search documents semantically | *"Search my docs for authentication flow"* |
| **nexus_entities** | Manage knowledge graph entities and relationships | *"What entities are related to our billing system?"* |
| **nexus_search** | Semantic, graph, and hybrid search across all knowledge | *"Find everything related to deployment"* |
| **nexus_agents** | Orchestrate multiple AI agents for complex tasks | *"Have agents collaborate on this analysis"* |
| **nexus_system** | Platform health, model stats, and diagnostics | *"Check system health"* |

## Skills

| Skill | Triggers Automatically When You Say... |
|-------|---------------------------------------|
| **Skill Discovery** | "Find a skill for...", "Search skills...", "What skills are available?" |
| **Skill Invocation** | "Use the code review skill", "Run skill X on this code" |
| **Skill Synthesis** | "Combine skills X and Y", "Chain these skills together" |
| **Memory Management** | "Remember this...", "What do you recall about...?" |
| **Knowledge Graph** | "What entities are related to...", "Show relationships for..." |
| **Agent Orchestration** | "Have multiple agents...", "Use agents to collaborate on..." |

## Commands

| Command | What It Does |
|---------|-------------|
| `/health` | Check Nexus platform connectivity and status |
| `/skill-status` | View skill usage stats and quality scores |
| `/sync-skills` | Sync latest skills from the marketplace to your local environment |

---

## How It Works

```
┌──────────────────────────────────────────────────────────────────┐
│                        Claude Desktop                            │
│                                                                  │
│   You: "Remember our API uses JWT auth with RS256 signing"       │
│                          │                                       │
│                          ▼                                       │
│   ┌──────────────────────────────────────┐                       │
│   │     Adverant Nexus Plugin            │                       │
│   │     (Remote MCP via HTTP)            │                       │
│   │                                      │                       │
│   │  Skills ─ Commands ─ Agent ─ Tools   │                       │
│   └──────────────────┬───────────────────┘                       │
│                      │ HTTPS + OAuth 2.1                         │
└──────────────────────┼───────────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │    Adverant Nexus Platform  │
         │    api.adverant.ai          │
         │                             │
         │  ┌─────────┐ ┌───────────┐ │
         │  │ GraphRAG│ │  Skills   │ │
         │  │ Memory  │ │  Engine   │ │
         │  └─────────┘ └───────────┘ │
         │  ┌─────────┐ ┌───────────┐ │
         │  │Knowledge│ │ MageAgent │ │
         │  │  Graph  │ │(Multi-AI) │ │
         │  └─────────┘ └───────────┘ │
         └─────────────────────────────┘
```

The plugin connects to the Adverant Nexus cloud platform via a remote HTTP MCP server — no local installation required. Your data is stored securely in your personal tenant — isolated, encrypted, and accessible only through your authenticated session.

---

## Who Uses This

Nexus is built for people who use Claude as a daily tool, not a toy:

- **Developers** who want Claude to remember their codebase, architecture decisions, and team conventions across every conversation
- **Knowledge workers** who need Claude to recall meeting notes, project context, and research — without re-uploading everything each time
- **AI power users** who want to build, share, and invoke reusable skills instead of writing the same prompts over and over
- **Teams** who need Claude to maintain shared context across members — everyone's Claude knows what the team knows

---

## Getting Started After Install

Once installed, just talk to Claude naturally:

**Store a memory:**
> "Remember that our frontend uses Next.js 14 with App Router and Tailwind CSS"

**Recall later:**
> "What tech stack does our frontend use?"

**Find a skill:**
> "Find me a skill for creating research papers"

**Run a command:**
> Type `/health` to verify the connection

**Search your knowledge:**
> "Search my documents for anything about database migrations"

---

## Also Works With Claude Code, Cursor, Windsurf & More

The plugin uses a remote HTTP MCP server, so it works with any MCP-compatible client.

**Claude Code** (`.mcp.json` in project root):
```json
{
  "mcpServers": {
    "nexus": {
      "type": "http",
      "url": "https://api.adverant.ai/mcp/message"
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "nexus": {
      "type": "http",
      "url": "https://api.adverant.ai/mcp/message"
    }
  }
}
```

Or use the **AI Connections** page on [dashboard.adverant.ai/dashboard/settings/ai-connections](https://dashboard.adverant.ai/dashboard/settings/ai-connections) to generate config for any client with one click.

---

## Updating

The plugin auto-updates when you click **Sync** in Browse Plugins.

To manually sync the latest skills:
> Type `/sync-skills` in any Cowork conversation

---

## FAQ

**Do I need an API key?**
For **Cowork** (Claude Desktop): No. The plugin authenticates via OAuth when you install it — no API key needed.
For **Claude Code / Cursor / other clients**: You can use either OAuth or an API key. Get a free key at [Dashboard > API Keys](https://dashboard.adverant.ai/dashboard/api-keys), or configure OAuth via [Dashboard > Settings > AI Connections](https://dashboard.adverant.ai/dashboard/settings/ai-connections).

**Is my data private?**
Yes. Each user gets an isolated tenant. Your memories, documents, and knowledge graph are encrypted and accessible only through your authenticated session.

**Does it work offline?**
No. The plugin connects to the Adverant Nexus cloud platform. Claude itself continues working normally if the connection is lost — you just won't have access to memories/skills until restored. Type `/health` to check status.

**What happens if the Nexus API is down?**
Claude continues working normally — you just won't have access to memories/skills until the connection is restored. Type `/health` to check status.

---

## Contributing

```bash
git clone https://github.com/adverant/adverant-nexus-cowork-plugin.git
cd adverant-nexus-cowork-plugin/server
npm install
npm run build
npm start
```

---

<p align="center">
  Built by <a href="https://adverant.ai">Adverant</a> · <a href="https://dashboard.adverant.ai">Dashboard</a> · <a href="https://github.com/adverant/adverant-nexus-cowork-plugin/issues">Report Issues</a>
</p>
