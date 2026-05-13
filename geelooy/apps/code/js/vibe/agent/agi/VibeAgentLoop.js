
// B"H
/**
 * @file VibeAgentLoop.js
 * @description
 * Agentic scaffold for planner-architect-builder-tester-debugger-reviewer-committer loops.
 */

import { AgentLoopState } from './AgentLoopState.js';
import { AGENT_ROLES } from './AgentRoles.js';
import { GitSyncPolicy } from '../git/GitSyncPolicy.js';
import { SecretGuard } from '../git/SecretGuard.js';
import { GlobalProjectIntelligence } from './ProjectIntelligence.js';

export class VibeAgentLoop {
    constructor(seed = {}) {
        this.state = new AgentLoopState(seed);
        this.roles = AGENT_ROLES;
        this.project = GlobalProjectIntelligence;
    }

    plan(goal) {
        this.state.goal = goal || this.state.goal;
        this.state.nextPhase('planner');
        this.state.findings.push('Plan: inspect relevant files, preserve existing systems, patch modularly, test visually.');
        return this.state;
    }

    architect() {
        this.state.nextPhase('architect');
        this.state.findings.push('Architecture law: if browser, terminal, commander, editor, or git already exists, create host adapters instead of clones.');
        return this.state;
    }

    registerChanges(changes = []) {
        this.state.changes.push(...changes);
        for (const change of changes) {
            this.project.rememberFile(change.file || change.path || 'unknown', { change });
        }
        return this.state;
    }

    reviewSafety() {
        this.state.nextPhase('reviewer');
        const scan = SecretGuard.scanChanges(this.state.changes);
        this.state.findings.push(scan.ok ? 'SecretGuard passed.' : 'SecretGuard blocked risky paths.');
        if (!scan.ok) this.state.errors.push({ type: 'secret-guard', blocked: scan.blocked });
        return scan;
    }

    decideGitSync() {
        this.state.nextPhase('committer');
        const mode = GitSyncPolicy.getMode();
        this.state.findings.push(`Git sync policy: ${mode}`);
        return {
            mode,
            afterEachWrite: GitSyncPolicy.shouldSyncAfterEachWrite(),
            afterBatch: GitSyncPolicy.shouldSyncAfterBatch(),
            ask: GitSyncPolicy.shouldAsk()
        };
    }

    markDone() {
        this.state.done = true;
        this.state.record('done', true);
        return this.state;
    }
}
