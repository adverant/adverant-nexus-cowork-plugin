---
description: Sync all published Nexus skills to your local filesystem as Claude Code slash commands
---

Sync skills from the Adverant Nexus Skills Engine to the local filesystem at ~/.claude/skills/.

1. Call the `nexus_skills` tool with `action: "sync"`.
   - If the user said "--force" or "force", pass `force: true` to overwrite unchanged skills.
   - Otherwise pass `force: false` (default).

2. Report the results clearly:
   - Number of skills synced (new or updated)
   - Number of skills skipped (protected or unchanged)
   - Number of skills that failed
   - Total skills processed

3. If any skills failed, show the failure details so the user can investigate.
