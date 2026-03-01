---
description: Find and recommend Nexus skills for any task. Use when the user asks about finding skills, wants recommendations, or says things like "find a skill for...", "is there a skill that...", "what skills can help with...", "search Adverant for...", or "show me top skills".
---

# Skill Discovery

When the user wants to find a skill on Adverant Nexus:

## Quick Match (user describes a task)
Use `nexus_skills` with `action: "match"` and pass the user's description as `prompt`.
Returns ranked matches with confidence scores.

## Semantic Search (user searches by keyword/concept)
Use `nexus_skills` with `action: "discover"` and pass the search term as `query`.
Supports optional `categories` filter and `min_relevance` threshold (0-1).

## Browse Top Skills
Use `nexus_skills` with `action: "top"` and optional `limit` (default: 20).
Returns skills ranked by quality score (reliability, performance, usage, recency).

## Browse All Skills
Use `nexus_skills` with `action: "list"` with optional filters: `search`, `status`, `category`, `limit`, `offset`.

## Get Full Details
Use `nexus_skills` with `action: "get"` and `skill_id` to fetch the complete SKILL.md content, capabilities, quality score, and metadata.

## Find Related Skills
Use `nexus_skills` with `action: "related"` and `skill_id` to find complementary or similar skills.

## Presentation
When presenting results:
1. Show skill name, description, and relevance/quality score
2. Highlight key capabilities
3. Offer to show full details or invoke the skill
4. If no good match, suggest skill synthesis or generation
