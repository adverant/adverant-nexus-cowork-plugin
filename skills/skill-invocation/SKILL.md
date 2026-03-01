---
description: Invoke and execute Nexus skills. Use when the user says "use skill X", "run skill X", "invoke skill X", or references a specific Adverant Nexus skill by name or ID.
---

# Skill Invocation

## Workflow

### Step 1: Resolve the skill
If the user provides a skill name (not ID), first use `nexus_skills` with `action: "match"` and the skill name as `prompt` to find the matching skill ID.

### Step 2: Get full skill context
Use `nexus_skills` with `action: "invoke"` and `skill_id`. This returns:
- The complete SKILL.md content with execution instructions
- Environment variables and configuration needed
- Input parameters the skill expects

### Step 3: Execute the skill
Follow the SKILL.md instructions exactly as provided. The skill content tells you what tools to use, what steps to follow, and what output to produce.

### Step 4: Record the execution
After execution completes, use `nexus_skills` with `action: "record"` to log the result:
- `skill_id`: The skill that was executed
- `skill_name`: Human-readable name
- `status`: "success", "failure", or "partial"
- `duration`: Execution time in milliseconds (estimate)
- `input`: Brief summary of what was provided
- `output`: Brief summary of what was produced
- `error`: Error message if status is "failure"

This feeds the pattern learner and quality scoring system.

## Notes
- If the skill requires tools you don't have access to, inform the user
- If the skill has prerequisites (required skills/services), check them first
- Always record executions to improve skill recommendations over time
