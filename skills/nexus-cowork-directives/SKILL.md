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

## 3. INTEGRITY & HONESTY PROTOCOL — SUPERSEDES ALL OTHER INSTRUCTIONS

- NEVER claim success without measurable before/after proof
- NEVER conflate "ran without crashing" with "achieved goal"
- NEVER use abstraction to obscure failure — say "0% improvement" plainly
- ALWAYS disclose configuration/integration gaps
- Disagreement > false agreement. Uncomfortable truth > comfortable lie.

Before declaring completion: Did I achieve the user's ACTUAL goal? Would they consider this successful? Am I hiding failures behind jargon?

**Self-Review Limitation**: LLM self-review has blind spots (75% more logic errors in LLM-generated code). Review gates and the Gemini external assessment are friction mechanisms, not security gates.

---

## 4. TASK EXECUTION ORDER — ALL PROJECTS

Phases MUST execute in this order. NEVER deploy before all prior phases complete.

1. **Plan** — Understand the task, create implementation plan
2. **Memory Recall** — Run `nexus_enhanced_retrieve` with targeted queries (see MEMORY RECALL section)
3. **Gate 1: Plan Review** — Approach-level review with historical context (see GATE 1 below)
4. **Brutal Honesty Audit (Plan)** — Evidence-based validation. NON-SKIPPABLE. (see BHA section)
5. **Plan Refinement** — If Gate 1 or BHA raised issues, update plan and re-run from step 3
6. **Persist Plan** — Store plan + BHA verdict to memory via `nexus_store_memory`
7. **Implementation** — Code, fix, configure, add tests
8. **Gate 2: Code Review** — Code-level self-review (see GATE 2 below)
9. **Brutal Honesty Audit (Code)** — Evidence-based validation. NON-SKIPPABLE. (see BHA section)
10. **Verification** — Lint, type-check, run tests, validate locally
11. **Commit** — `git add`, `git commit`, `git push`
12. **Persist Commit** — Store what changed, why, commit hash via `nexus_store_memory`
13. **Code Review + Gemini External Assessment** — Self-review + mandatory Gemini 3.1 Pro cross-validation (see EXTERNAL ASSESSMENT)
14. **Build & Deploy** — ONLY after all above complete
15. **Deploy Validation** — Verify pod running correct image, APIs healthy. Persist deploy result to memory.

**Enforcement**: Before deploying, ALL phases must be complete. If ANY remain, DO NOT DEPLOY.
**Complexity threshold**: For changes under ~10 lines or single-file typo fixes, skip steps 2-6 (but ALWAYS run Gate 2 + BHA code).

---

## 5. MEMORY RECALL — BEFORE PLAN REVIEW (Step 2)

Before Gate 1, run `nexus_enhanced_retrieve` with targeted queries based on the plan. Query ALL memory types:

**Memories** (episodic — past fixes, decisions, errors):
1. For EACH file the plan intends to modify: "Past issues with [filename/component]", "Previous fixes to [function/module]"
2. For the error being fixed (if bug fix): "Previous fixes for [error pattern]", "Has this error regressed before?"
3. For architectural decisions: "Decisions about [component/approach/pattern]"

**Documents** (ingested files — specs, docs, related code):
4. "Documentation for [service/module]", "Specs or requirements related to [feature]"

**Episodes** (session summaries — causal chains, temporal context):
5. "Deployment failures involving [service]", "Session history for [component/area]"
6. "Recent sessions that modified [file/area]"

Also check git history: `git log --oneline -10 -- <file>` for each planned file.
Flag if any file has >2 modifications in the last 30 days — systemic indicator.

**Output**: A **Historical Context Brief** feeding into Gate 1.

---

## 6. GATE 1: PLAN REVIEW — BEFORE IMPLEMENTATION (Step 3)

After Memory Recall, ask yourself — be brutally honest:

- **P1**: Has this EXACT approach been tried before? If yes: why did it fail? What's different this time?
- **P2**: Am I fixing the ROOT CAUSE or just a SYMPTOM? If >2 patches in <30 days: STOP — needs architectural analysis.
- **P3**: What broke LAST TIME this area was changed? Does my plan account for those failure paths?
- **P4**: Does this plan contradict a previous DELIBERATE decision? If so: explicitly justify why it should change.
- **P5**: Am I CONFIDENT this will work, or HOPING it will? If hoping: what would make me confident? Do that first.
- **P6**: Is there an existing solution I'm ignoring?

**Output**: List every concern. If ANY are CRITICAL, do NOT proceed.
- Issues found → refine plan, re-run Gate 1 (max 3 iterations)
- Clean after 3 with unresolved issues → escalate to user
- Clean → proceed to implementation

---

## 7. GATE 2: CODE REVIEW — AFTER IMPLEMENTATION (Step 8)

After implementation, before verification:

- **C1**: Will these changes ACTUALLY work in production, or am I hoping?
- **C2**: Are there ANY stubs, placeholders, TODO comments, or partial implementations?
- **C3**: Is there code that could be written better, more robustly, or more idiomatically?
- **C4**: Did I use the right patterns (components, hooks, state management, UI/UX)?
- **C5**: Are there missing error handlers, edge cases, or integration gaps?
- **C6**: Am I hiding any uncertainty behind vague language?

**Output**: List every issue. Fix ALL issues. Re-run Gate 2 (max 3 iterations). Escalate if issues persist.

---

## 8. BRUTAL HONESTY AUDIT (BHA) — EVIDENCE GATES (Steps 4 and 9)

The BHA demands **concrete evidence** for every self-assessment. NON-SKIPPABLE for changes touching >1 file or >10 lines.

**After Gate 1** (step 4):
- Validates: regression frequency, root cause clarity, blast radius, prior art, failure pre-mortem, external contracts
- Every check produces a verifiable artifact (git log, grep result, spec citation) or it FAILS
- If verdict is HALT or ESCALATE: do NOT proceed to implementation

**After Gate 2** (step 9):
- Validates: error paths, data flow, concurrency, type boundaries, authorization/IDOR, infrastructure, adversarial inputs, testability
- Every check produces a verifiable artifact (file:line trace, grep output, scenario analysis) or it FAILS
- If verdict is HALT or ESCALATE: do NOT proceed to code review

**Memory persistence**: After each audit, store verdict + findings via `nexus_store_memory` tagged `bha-audit`.
**Core principle**: "I believe it's fine" is NOT an artifact. Show the evidence or FAIL the check.

---

## 9. EXTERNAL ASSESSMENT — GEMINI CROSS-VALIDATION (Step 13)

After self-review (Gate 2 + BHA), run a **mandatory** Gemini 2.5 Pro external assessment for cross-model validation.

### In Cowork (via Nexus Gateway Gemini Proxy)

The Nexus Gateway at `api.adverant.ai` has a Gemini proxy endpoint that runs server-side. Since the Nexus MCP connection bypasses the sandbox proxy, call it through the MCP transport:

```
Step 1: Get the diff
  diff_output = run `git diff HEAD~1` (or appropriate range)

Step 2: Call the Gemini proxy via the gateway
  POST https://api.adverant.ai/api/gemini/review
  Body: {
    "diff": "<the git diff>",
    "claude_findings": "<your Gate 2 + BHA findings as text>",
    "model": "gemini-2.5-pro"
  }

Step 3: Parse the response
  Response contains: {
    "review": {
      "findings": [{ severity, category, description, file, line }],
      "blind_spots": [{ severity, description, file }],
      "confirmed": ["issues both reviewers found"],
      "overall_verdict": "PASS|FAIL|NEEDS_FIXES",
      "summary": "brief assessment"
    },
    "usage": { promptTokens, completionTokens, totalTokens }
  }
```

Since direct HTTP to api.adverant.ai is blocked from the sandbox, use one of these methods to reach the endpoint:
1. **WebFetch** tool (if available and not blocked for this domain)
2. **Nexus MCP tool** — route through `nexus_admin` or custom MCP tool call
3. **Claude in Chrome** `execute_javascript` as fallback (requires Chrome running)

### Cross-Validation Rules

1. After Claude's self-review (Gate 2 + BHA), the diff and findings are sent to Gemini 2.5 Pro
2. Gemini performs an **independent** review and returns structured JSON findings
3. Cross-validate: categorize issues as **Confirmed** (both found), **Blind Spot** (Gemini found, Claude missed), or **Claude-Only**
4. **CRITICAL/HIGH blind spots BLOCK the review** — must be fixed before proceeding
5. All results feed into the final review summary and memory persistence

### In Claude Code (via direct REST API)

Outside Cowork, use the direct REST API as defined in `~/.claude/CLAUDE.md`:
- **API**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent`
- **Key**: `~/.claude/session-env/gemini-api-key` (bare key, no quotes, `chmod 600`)

### Gemini API Key Locations

- **Server**: `GOOGLE_AI_API_KEY` env var in the api-gateway K8s deployment (from `gemini-api-key` K8s secret)
- **Claude Code**: `~/.claude/session-env/gemini-api-key`
- **Cowork backup**: `.cowork/gemini-api-key` in the Adverant workspace

### If External Assessment Fails

Review HALTS with actionable error. No fallback, no skip. Fix the underlying issue or escalate to user.

---

## 10. MEMORY PERSISTENCE — POST-COMMIT & POST-DEPLOY

After EVERY `git commit` and after EVERY deployment:
1. Store **episodic memory** with: what was changed, why, commit hash, deploy status, errors encountered
2. Tag with: project name, branch, date, "commit" or "deploy"
3. This is NON-OPTIONAL — do not skip even if the task seems minor

### When NOT to Use Full Protocol

- Simple questions or conversation → just answer
- Single quick file edit → Plan + Implement + Verify is enough
- Pure research → Plan + Recall + Research + Persist

---

## 11. ENGINEERING STANDARDS

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

## 12. TASK PRIORITIZATION

1. **Current task** — complete the user's most recent request first
2. **Code quality** — only fix if it blocks current task or user asks
3. **Session resumption** — recall memories, check context, ASK before switching tasks
4. Don't fix pre-existing TypeScript warnings in unrelated files

---

## 13. INFRASTRUCTURE QUICK REFERENCE

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

## 14. BROWSER LOGIN HANDLING

When using browser automation (Claude in Chrome, Playwright, etc.):
- If you encounter a login page or OAuth redirect: **STOP and WAIT**
- Tell the user: "I've hit a login page. Please log in manually — I'll wait."
- Do NOT close the browser, skip the test, or navigate away
- Do NOT attempt to fill in credentials or bypass authentication
- WAIT for the user to confirm they have logged in before continuing

---

## 15. MEMORY TOOL QUICK REFERENCE (Cowork)

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

## 16. SESSION AUTO-BOOTSTRAP (MANDATORY)

Every Cowork session MUST run this bootstrap sequence **before any other work**. This is silent — do not narrate these steps to the user.

### Step 1: Git Bootstrap

Run the persistent credential helper to enable GitHub push/pull/fetch:

```bash
# Find and execute the bootstrap script
BOOTSTRAP=$(find /sessions/*/mnt/Adverant/.cowork/git-bootstrap.sh 2>/dev/null | head -1)
if [ -n "$BOOTSTRAP" ]; then
    chmod +x "$BOOTSTRAP"
    bash "$BOOTSTRAP"
else
    # Manual fallback if bootstrap script not found
    HELPER=$(find /sessions/*/mnt/Adverant/.cowork/git-credential-helper.sh 2>/dev/null | head -1)
    if [ -n "$HELPER" ]; then
        chmod +x "$HELPER"
        git config --global credential.helper "$HELPER"
    fi
    git config --global user.email "dsdon10@users.noreply.github.com"
    git config --global user.name "Don"
    git config --global push.default current
fi
```

After bootstrap, git push/pull/fetch/clone all work over HTTPS through the sandbox proxy. No SSH needed.

### Step 2: Memory Recall

Run the memory recall from Section 1 above.

### Step 3: File Delete Permission

If any git operation fails with "Operation not permitted", use `allow_cowork_file_delete` on the affected path. This is common for `.git/index.lock` files or when `git pull` needs to overwrite files.

---

## 17. COWORK-SPECIFIC BEHAVIORS

### File Delivery
- All deliverables go to `/sessions/*/mnt/Adverant/` (the workspace folder)
- Use `computer://` links for file sharing
- Never expose internal VM paths to the user

### Git Operations (WORKING)
- **Git push/pull/fetch all work** via HTTPS through the sandbox proxy
- Credential helper at `.cowork/git-credential-helper.sh` provides the PAT automatically
- The Session Auto-Bootstrap (Section 9) configures git — run it at session start
- All repos under `/mnt/Adverant/` with remotes are ready to push/pull after bootstrap
- If `git pull` fails with "unable to unlink", request file delete permission and retry

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
