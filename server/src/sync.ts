/**
 * Skill Filesystem Sync
 *
 * Syncs published skills from the Nexus Skills Engine to the local
 * filesystem at ~/.claude/skills/, making them available as native
 * slash commands in Claude Code and Cowork.
 *
 * Ported from nexus-skills-mcp/src/index.ts (lines 396-488).
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { NexusClient } from './client.js';

const SKILLS_DIR = join(homedir(), '.claude', 'skills');

// Skills that should never be overwritten by sync (locally managed)
const PROTECTED_SKILLS = new Set([
  'nexus-skill-sync',
  'build-deploy',
  'code-review',
  'commit',
  'web-debug',
  'screenshot-skill',
  'nexus-memory',
  'agent-browser',
  'pr-automation',
  'plugin-maker',
  'marketing-psychology',
  'award-winning-website-design',
  'documentation-sync',
  'hbr-article',
  'patent-creator',
  'patent-creator-skill',
  'pcb-layout-skill',
  'web-validation',
  'website-copy-creator',
  'youtube-video-creation',
  'video-render',
  'research-paper',
  'seo-optimizer',
]);

interface SkillSummary {
  id: string;
  name?: string;
  structuredData?: { name?: string };
}

function normalizeSkillName(skill: SkillSummary): string {
  const raw = skill.name || skill.structuredData?.name || skill.id;
  return raw
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function syncSkillsToFilesystem(
  client: NexusClient,
  force: boolean
): Promise<{
  synced: number;
  skipped: number;
  failed: number;
  total: number;
  details: string[];
}> {
  const details: string[] = [];
  let synced = 0;
  let skipped = 0;
  let failed = 0;

  // Fetch published skills
  const response = (await client.listSkills({
    limit: 100,
    status: 'published',
  })) as {
    data?: { skills?: SkillSummary[] };
    skills?: SkillSummary[];
  };
  const skills: SkillSummary[] =
    response?.data?.skills || (response as { skills?: SkillSummary[] })?.skills || [];
  const total = skills.length;

  for (const skill of skills) {
    const skillName = normalizeSkillName(skill);

    // Skip protected skills
    if (PROTECTED_SKILLS.has(skillName)) {
      skipped++;
      details.push(`SKIP (protected): ${skillName}`);
      continue;
    }

    // Fetch full skill detail for textContent
    let fullSkill: {
      data?: { textContent?: string };
      textContent?: string;
    };
    try {
      fullSkill = (await client.getSkill(skill.id)) as typeof fullSkill;
    } catch (err) {
      failed++;
      details.push(
        `FAIL (fetch): ${skillName} — ${err instanceof Error ? err.message : String(err)}`
      );
      continue;
    }

    const textContent = fullSkill?.data?.textContent || fullSkill?.textContent;
    if (!textContent) {
      failed++;
      details.push(`FAIL (no textContent): ${skillName}`);
      continue;
    }

    // Check if content changed (skip if identical)
    const targetDir = join(SKILLS_DIR, skillName);
    const targetFile = join(targetDir, 'SKILL.md');

    if (!force && existsSync(targetFile)) {
      try {
        const existing = readFileSync(targetFile, 'utf-8');
        if (existing === textContent) {
          skipped++;
          details.push(`SKIP (unchanged): ${skillName}`);
          continue;
        }
      } catch {
        // File exists but can't be read — overwrite
      }
    }

    // Write SKILL.md
    try {
      mkdirSync(targetDir, { recursive: true });
      writeFileSync(targetFile, textContent, 'utf-8');
      synced++;
      details.push(`SYNCED: ${skillName} → ${targetFile}`);
    } catch (err) {
      failed++;
      details.push(
        `FAIL (write): ${skillName} — ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return { synced, skipped, failed, total, details };
}
