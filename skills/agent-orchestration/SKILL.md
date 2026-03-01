---
description: Coordinate multiple AI agents for complex tasks via Nexus MageAgent. Use when the user needs multi-agent collaboration, competitive problem-solving, deep analysis, or information synthesis from multiple sources.
---

# Agent Orchestration (MageAgent)

## Orchestrate a Task
Use `nexus_agents` with `action: "orchestrate"`:
- `task` (required): The task or objective to accomplish
- `max_agents` (optional): Maximum agents to spawn
- `timeout` (optional): Timeout in milliseconds

Spawns research, coding, review, and synthesis agents as needed.

## Collaborative Problem-Solving
Use `nexus_agents` with `action: "collaborate"`:
- `objective` (required): The collaboration objective
- `agents` (optional): Agent configuration array with role and focus
- `iterations` (optional): Number of collaboration iterations (1-5)

Agents share context and build on each other's work iteratively.

## Competitive Problem-Solving
Use `nexus_agents` with `action: "compete"`:
- `challenge` (required): The challenge for agents to solve
- `competitor_count` (optional): Number of competing agents (2-10)
- `evaluation_criteria` (optional): Array of criteria for ranking

Multiple agents solve independently, results are ranked.

## Deep Analysis
Use `nexus_agents` with `action: "analyze"`:
- `topic` (required): Topic to analyze
- `depth` (optional): quick, standard, or deep
- `include_memory` (optional): Include memory context from GraphRAG

## Synthesize Information
Use `nexus_agents` with `action: "synthesize"`:
- `sources` (required): Array of information sources
- `objective` (optional): Synthesis focus
- `format` (optional): summary, report, analysis, or recommendations

## Check Task Status
Use `nexus_agents` with `action: "task_status"` and `task_id` to check on running tasks.

## List Active Agents
Use `nexus_agents` with `action: "list"` to see all active agents and their status.
