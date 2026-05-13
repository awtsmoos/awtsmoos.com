// B"H
/**
 * @file AgentRolePrompter.js
 * @brief Role-specific instruction addendum appended to the system prompt.
 */

import { AgentRoles } from '../state/AgentRoleRegistry.js';

function normalizeRole(role) {
    const r = String(role || '').toLowerCase().trim();
    return Object.values(AgentRoles).includes(r) ? r : AgentRoles.auto;
}

const ROLE_PROMPTS = Object.freeze({
    [AgentRoles.auto]: '',
    [AgentRoles.planner]: `
ROLE: PLANNER
- Primary output: a short, testable plan.
- Prefer reading structure over editing files.
- Only call tools when a plan depends on specific facts.`,
    [AgentRoles.builder]: `
ROLE: BUILDER
- Primary output: concrete changes (tools, code, patches).
- Prefer small modular files over giant rewrites.
- When uncertain, run quick validations and iterate.`,
    [AgentRoles.tester]: `
ROLE: TESTER
- Primary output: validation results + failures grouped by root cause.
- Prefer running 'run_ui_test' (or other tests) early and often.
- When a test fails, produce the minimal patch to make it pass.`,
    [AgentRoles.reviewer]: `
ROLE: REVIEWER
- Primary output: safety + correctness review and final polish.
- Look for edge cases, regressions, and missing wiring.
- If something is risky, request a smaller patch plan first.`
});

export const AgentRolePrompter = {
    /**
     * @param {string} role
     * @returns {string}
     */
    build(role) {
        return ROLE_PROMPTS[normalizeRole(role)] || '';
    }
};

