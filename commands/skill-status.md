---
description: Show the current status of the Nexus Skills Engine -- top skills, recent activity, quality scores
---

Show the user a status dashboard for the Nexus Skills Engine:

1. Call `nexus_skills` with `action: "top"` and `limit: 10` to get the top-ranked skills.

2. Call `nexus_system` with `action: "health"` to check service connectivity.

3. Present a summary:
   - Service status (healthy/unhealthy)
   - Total skill count
   - Top 10 skills with quality scores
   - Categories breakdown if available
