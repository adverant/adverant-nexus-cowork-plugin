---
description: Combine, chain, specialize, or adapt existing Nexus skills into new ones. Use when the user wants to "combine skills", "merge skills", "chain skills into a workflow", "specialize a skill", "adapt a skill for a different domain", or "create a new skill from existing ones".
---

# Skill Synthesis

## Available Strategies

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **combine** | Merge capabilities from 2+ skills into one | "Combine code-review and documentation skills" |
| **chain** | Create sequential workflow with data flow | "Chain research -> analysis -> report skills" |
| **specialize** | Focus a broad skill on a specific subset | "Specialize the testing skill for React components" |
| **generalize** | Abstract common patterns from specific skills | "Generalize these project-specific skills" |
| **adapt** | Port a skill to a different domain | "Adapt the code review skill for infrastructure configs" |

## Workflow

### Step 1: Identify Source Skills
Help the user find the skills to synthesize from. Use `nexus_skills` with `action: "discover"` or `action: "match"` if they don't have specific skill IDs.

### Step 2: Clarify Strategy
Discuss which strategy fits their goal. If unclear, recommend based on their description.

### Step 3: Execute Synthesis
Call `nexus_skill_synth` with:
- `source_skill_ids`: Array of skill IDs to synthesize from
- `strategy`: One of combine, chain, specialize, generalize, adapt
- `target_name`: Name for the new skill
- `prompt`: Additional guidance (optional but recommended)
- `focus_areas`: Specific areas to focus on (for specialize/adapt)
- `visibility`: private, team, or public (default: private)

### Step 4: Review Result
The synthesis returns a confidence score. If confidence < 0.7, warn the user about potential issues and discuss before publishing.

### Step 5: Validate
Optionally invoke the synthesized skill to verify it works as expected.
