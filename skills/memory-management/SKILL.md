---
description: Store and recall memories using Nexus GraphRAG. Use when the user wants to remember something across sessions, recall past information, save context for later, or manage their persistent memory store.
---

# Memory Management

## Store a Memory
Use `nexus_memory` with `action: "store"`:
- `content` (required): The information to remember
- `tags` (optional): Array of tags for categorization
- `metadata` (optional): Additional structured data

## Recall Memories
Use `nexus_memory` with `action: "recall"`:
- `query` (required): What to search for (semantic matching)
- `limit` (optional): Max results (default: 10)
- `score_threshold` (optional): Minimum similarity score 0-1

## Store an Episode
Use `nexus_memory` with `action: "store_episode"`:
- `content` (required): The episode content
- `type` (optional): user_query, system_response, event, observation, insight
- `metadata` (optional): Episode metadata

Episodes include temporal tracking and graph relationships for tracking sequences of events.

## Recall Episodes
Use `nexus_memory` with `action: "recall_episodes"`:
- `query` (required): Search query
- `limit` (optional): Max results

## Tips
- Use memories for persistent facts, decisions, and preferences
- Use episodes for temporal sequences and event tracking
- Tags help with organization: use project names, topics, or categories
- Memories are searchable via vector similarity — natural language queries work best
