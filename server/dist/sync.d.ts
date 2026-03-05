/**
 * Skill Filesystem Sync
 *
 * Syncs published skills from the Nexus Skills Engine to the local
 * filesystem at ~/.claude/skills/, making them available as native
 * slash commands in Claude Code and Cowork.
 *
 * Ported from nexus-skills-mcp/src/index.ts (lines 396-488).
 */
import { NexusClient } from './client.js';
export declare function syncSkillsToFilesystem(client: NexusClient, force: boolean): Promise<{
    synced: number;
    skipped: number;
    failed: number;
    total: number;
    details: string[];
}>;
//# sourceMappingURL=sync.d.ts.map