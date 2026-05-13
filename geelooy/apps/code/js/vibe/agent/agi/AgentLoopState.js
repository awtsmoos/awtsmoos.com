
// B"H
/**
 * @file AgentLoopState.js
 * @description
 * Persistent memory for an agentic Vibe loop.
 */

export class AgentLoopState {
    constructor(seed = {}) {
        this.goal = seed.goal || '';
        this.phase = seed.phase || 'planner';
        this.steps = Array.isArray(seed.steps) ? seed.steps : [];
        this.findings = Array.isArray(seed.findings) ? seed.findings : [];
        this.changes = Array.isArray(seed.changes) ? seed.changes : [];
        this.tests = Array.isArray(seed.tests) ? seed.tests : [];
        this.errors = Array.isArray(seed.errors) ? seed.errors : [];
        this.done = Boolean(seed.done);
    }

    record(type, payload) {
        this.steps.push({
            type,
            payload,
            at: Date.now()
        });
    }

    nextPhase(phase) {
        this.phase = phase;
        this.record('phase', phase);
    }

    toJSON() {
        return {
            goal: this.goal,
            phase: this.phase,
            steps: this.steps,
            findings: this.findings,
            changes: this.changes,
            tests: this.tests,
            errors: this.errors,
            done: this.done
        };
    }
}
