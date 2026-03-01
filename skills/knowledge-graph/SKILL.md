---
description: Manage knowledge graph entities, relationships, and cross-domain queries via Nexus GraphRAG. Use when the user references entities, wants to explore relationships, store structured knowledge, query facts, or search across domains.
---

# Knowledge Graph

## Store an Entity
Use `nexus_entities` with `action: "store"`:
- `domain`: creative_writing, code, medical, legal, research, general
- `entity_type`: novel_chapter, code_function, medical_record, etc.
- `text_content`: Entity text content
- `tags` (optional): Tags for categorization
- `metadata` (optional): Domain-specific metadata

## Query Entities
Use `nexus_entities` with `action: "query"`:
- `domain` (optional): Filter by domain
- `entity_type` (optional): Filter by entity type
- `search_text` (optional): Search within entity content
- `limit` (optional): Max results

## Get Entity Details
Use `nexus_entities` with `action: "get"` and `entity_id`.

## Entity History
Use `nexus_entities` with `action: "history"` and `entity_id` to see how an entity evolved over time.

## Entity Hierarchy
Use `nexus_entities` with `action: "hierarchy"` and `entity_id` to see the complete hierarchy tree.

## Get Facts
Use `nexus_entities` with `action: "facts"` and `subject` to query facts about a subject from the knowledge graph.

## Cross-Domain Query
Use `nexus_entities` with `action: "cross_domain"`:
- `domains`: Array of domains to search across
- `query`: Pattern or concept to find
- `max_results` (optional): Max results per domain
