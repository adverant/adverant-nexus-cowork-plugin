---
description: Check the health status of all Nexus services (GraphRAG, MageAgent, Skills Engine)
---

Check the health of the Adverant Nexus platform:

1. Call `nexus_system` with `action: "health"` and `detailed: true`.

2. Present the results as a status dashboard showing:
   - Overall system status
   - Individual service health (GraphRAG, MageAgent, Skills Engine, etc.)
   - Any warnings or errors
   - Model availability and stats (if available via `action: "model_stats"`)
