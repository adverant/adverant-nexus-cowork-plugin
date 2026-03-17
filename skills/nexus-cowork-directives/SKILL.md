---
name: nexus-cowork-directives
description: Global directives for Cowork and Desktop sessions. Enforces automatic memory recall/storage, episode tracking, review protocols, and engineering standards across all Adverant projects. This is the Cowork equivalent of CLAUDE.md — use at session start and throughout all work.
---

# Nexus Cowork Global Directives

> This skill is the Cowork/Desktop equivalent of `~/.claude/CLAUDE.md` from Claude Code.
> It enforces memory management, review protocols, and engineering standards for all Adverant work.

---

## 1. AUTOMATIC MEMORY PROTOCOL

### On Session Start (MANDATORY)

Every Cowork session MUST begin with a memory recall to load relevant context:

```
Use nexus_memory → execute → nexus_enhanced_retrieve:
  query: "<user's first message or topic>"
  include_episodic: true
  include_documents: true
  include_entities: true
  include_facts: true
  include_followups: true
  max_tokens: 4000
  limit: 10
  graph_depth: 2
```

This replaces the `auto-recall.sh` hook from Claude Code. Do this SILENTLY — do not tell the user you are recalling memories unless the results are directly relevant to share.

### On Every Significant Action

After completing any meaningful work (code changes, analysis, decisions, research findings), store a memory:

```
Use nexus_memory → execute → nexus_store_memory:
  content: "<concise summary of what was done/decided/learned>"
  tags: ["<project>", "<category>", "<topic>"]
  metadata:
    importance: 0.0-1.0 (scale by impact)
    source: "cowork-session-YYYY-MM-DD"
    context: "<why this matters for future sessions>"
    user_id: "don@adverant.ai"
```

### Event Types (use as tags)

| Tag | When to Use |
|-----|-------------|
| `fix` | Bug fix or error resolution |
| `decision` | Architecture, design, or strategy choice |
| `learning` | New understanding or insight |
| `pattern` | Reusable approach or template |
| `preference` | User preference or workflow choice |
| `context` | Project-specific background info |
| `episode` | Session summary or milestone |
| `infrastructure` | Server, deployment, or ops info |

### Episode Tracking

After every ~10 significant tool uses OR at session end, store an episode summary:

```
Use nexus_memory → execute → nexus_store_episode:
  content: "Session summary: [topics discussed], [decisions made], [problems solved], [files changed]"
  type: "observation"
  metadata:
    importance: 0.7
    user_id: "don@adverant.ai"
```

### Memory Importance Scale

| Score | Criteria |
|-------|----------|
| 0.9-1.0 | Infrastructure secrets, server access, critical decisions |
| 0.7-0.8 | Architecture decisions, deployment procedures, bug root causes |
| 0.5-0.6 | Code patterns, learnings, project context |
| 0.3-0.4 | Minor preferences, routine findings |
| 0.1-0.2 | Ephemeral notes, temporary context |

---

## 2. ACCESS CONTROL

### Confidential Data Rules

All memories containing server IPs, API keys, tokens, SSH access, or deployment credentials MUST include:

```
metadata:
  context: "ACCESS RESTRICTED TO dsdon10@gmail.com and don@adverant.ai ONLY"
  user_id: "don@adverant.ai"
tags: [..., "confidential"]
```

### Never Store in Memory

- Raw API keys or tokens (reference them by name, e.g., "NEXUS_SSH_KEY in GitHub Secrets")
- Passwords
- Full PAT values (use `ghp_...redacted`)

---

## 3. REVIEW & EXECUTION PROTOCOL

### 15-Step Execution Order

For any non-trivial task, follow this sequence:

1. **Plan** — Understand the task, break it down
2. **Memory Recall** — Query GraphRAG for relevant past context (`nexus_enhanced_retrieve`)
3. **Gate 1: Context Check** — Do I have enough context? If not, ask or search
4. **Assess Plan** — Is the plan sound? Check for gaps, risks, dependencies
5. **Refine** — Incorporate recalled memories and adjust plan
6. **Persist Plan** — Store the plan as a memory if it's significant
7. **Implement** — Execute the plan
8. **Gate 2: Implementation Check** — Does the implementation match the plan?
9. **Verify Code** — Lint, typecheck, test where applicable
10. **Verify Behavior** — Does it actually work? Test the output
11. **Commit/Save** — Stage and commit (or save deliverables)
12. **Persist Outcome** — Store what was done, learned, and decided
13. **Code Review** — Self-review or use code-reviewer agent
14. **Build & Deploy** — If applicable
15. **Final Persist** — Store deployment status and any issues

### Brutal Honesty Audit (BHA) Evidence Gates

At Gates 1, 2, and after deployment, apply these rules:

- **Never claim success without evidence** — Show the actual output, not "it should work"
- **Never skip verification** — Run the command, read the output, confirm
- **Never assume** — If you haven't checked, say "I haven't verified this yet"
- **Own mistakes immediately** — "I was wrong about X because Y"
- **No hand-waving** — Every claim must have a supporting observation

### When NOT to Use Full Protocol

- Simple questions or conversation → just answer
- Single quick file edit → Plan + Implement + Verify is enough
- Pure research → Plan + Recall + Research + Persist

---

## 4. ENGINEERING STANDARDS

### Code Quality (All Adverant Projects)

- **Root cause analysis** before fixing — trace the causal chain, don't patch symptoms
- **Full implementation only** — no TODOs, no placeholders, no `throw new Error('Not implemented')`
- **Complete error handling** — every error path handled explicitly
- Clean code: single responsibility, DRY, dependency injection, prefer pure functions
- Strict TypeScript: avoid `any`, use proper type guards, async/await patterns
- Database: parameterized queries, connection pooling, transaction rollbacks

### Docker Rules (CRITICAL)

- **NEVER build Docker locally** — Mac = ARM64, server = AMD64. Local builds ALWAYS fail.
- **NEVER destroy the stack** — No `docker-compose down`, `docker rm`, `docker volume rm` on production
- All Docker builds happen on the remote server via `/build-deploy`

### Deployment Rules

- Git is source of truth — server pulls from GitHub, builds, deploys
- NEVER use rsync, scp, or manual file transfers for deployments
- Three frontends exist — don't confuse them:
  - `adverant-frontend` = marketing site (adverant.ai)
  - `nexus-dashboard` = user dashboard (dashboard.adverant.ai)
  - Different repos, different deployments

### Build ID Convention

All Docker images: `{service}-{YYYYMMDD}-{random8hex}` tag + OCI labels for traceability.

### Post-Deployment Verification (MANDATORY)

A deployment is NOT complete until:
1. Running image tag contains expected git commit hash
2. Pod status is "Running" and Ready
3. Can exec into container and verify files

If verification fails, DO NOT claim success.

---

## 5. TASK PRIORITIZATION

1. **Current task** — complete the user's most recent request first
2. **Code quality** — only fix if it blocks current task or user asks
3. **Session resumption** — recall memories, check context, ASK before switching tasks
4. Don't fix pre-existing TypeScript warnings in unrelated files

---

## 6. INFRASTRUCTURE QUICK REFERENCE

### Production Server
- **IP**: 157.173.102.118
- **User**: root
- **Auth**: SSH key (NEXUS_SSH_KEY in GitHub Secrets)
- **K8s**: K3s, namespace `nexus`, registry `localhost:5000`

### Useful Commands (via SSH)
```
ssh root@157.173.102.118 "k3s kubectl get pods -n nexus"
ssh root@157.173.102.118 "k3s kubectl logs -f deployment/<service> -n nexus"
ssh root@157.173.102.118 "k3s kubectl rollout undo deployment/<service> -n nexus"
```

### Key Repos
| Repo | Purpose |
|------|---------|
| Adverant-Nexus | Main platform monorepo |
| nexus-dashboard | User dashboard (dashboard.adverant.ai) |
| Adverant.ai | Marketing website |
| adverant-nexus-cowork-plugin | This Cowork plugin |
| nexus-local-mageagent | Local AI orchestration |

### Nexus API
- **Gateway**: https://api.adverant.ai
- **Memory Store**: `/api/memory/store`
- **Memory Recall**: `/api/memory/recall`
- **MCP**: `/mcp/message` (HTTP) or `/mcp/sse` (SSE)

---

## 7. BROWSER LOGIN HANDLING

When using browser automation (Claude in Chrome, Playwright, etc.):
- If you encounter a login page or OAuth redirect: **STOP and WAIT**
- Tell the user: "I've hit a login page. Please log in manually — I'll wait."
- Do NOT close the browser, skip the test, or navigate away
- Do NOT attempt to fill in credentials or bypass authentication
- WAIT for the user to confirm they have logged in before continuing

---

## 8. MEMORY TOOL QUICK REFERENCE (Cowork)

In Cowork/Desktop, use the `nexus_memory` MCP tool (not bash hooks):

### Store
```
nexus_memory → execute → nexus_store_memory
  content, tags, metadata
```

### Recall
```
nexus_memory → execute → nexus_recall_memory
  query, limit, score_threshold
```

### Enhanced Recall (recommended)
```
nexus_memory → execute → nexus_enhanced_retrieve
  query, include_episodic, include_documents, include_entities, include_facts
```

### Store Episode
```
nexus_memory → execute → nexus_store_episode
  content, type, metadata
```

### Store Entity (Knowledge Graph)
```
nexus_memory → execute → nexus_store_entity
  domain, entityType, textContent, tags, metadata
```

### Search Everything
```
nexus_memory → execute → nexus_search
  query, limit, filters: {type: "all"}
```

---

## 9. COWORK-SPECIFIC BEHAVIORS

### File Delivery
- All deliverables go to `/sessions/*/mnt/Adverant/` (the workspace folder)
- Use `computer://` links for file sharing
- Never expose internal VM paths to the user

### Git Operations
- The Cowork sandbox proxy blocks outbound connections to github.com
- Make commits locally — user pushes from their terminal or VS Code
- Can read all repos, branches, commit history from the mounted filesystem

### Tool Availability
- MCP tools: `nexus_memory`, `nexus_skills`, `nexus_agent`, etc.
- Skills: All Nexus skills available via `/skill` invocation
- Chrome: Available via Claude in Chrome and Control Chrome MCPs
- Google: Calendar, Gmail, Drive connectors available

### When Memory Tools Are Unavailable
If the `nexus_memory` MCP tool is not connected:
1. Note the information that should be stored
2. Create a local file at `/sessions/*/mnt/Adverant/.cowork-memory-buffer.json` as a temp buffer
3. When the tool becomes available, flush the buffer to GraphRAG
