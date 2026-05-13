
// B"H
/**
 * @file AgentRoles.js
 * @description
 * Role definitions for the Vibe agentic loop.
 */

export const AGENT_ROLES = [
    {
        id: 'planner',
        title: 'Planner',
        mission: 'Understand the request, map relevant files, and design the exact path of repair.'
    },
    {
        id: 'architect',
        title: 'Architect',
        mission: 'Detect existing systems and choose host adapters instead of duplicate clones.'
    },
    {
        id: 'builder',
        title: 'Builder',
        mission: 'Write modular code with no placeholders and no giant files.'
    },
    {
        id: 'tester',
        title: 'Tester',
        mission: 'Run smoke checks, import checks, DOM checks, and browser checks.'
    },
    {
        id: 'debugger',
        title: 'Debugger',
        mission: 'Read failures, trace stack paths, and issue focused fixes.'
    },
    {
        id: 'reviewer',
        title: 'Reviewer',
        mission: 'Check architecture, file sizes, imports, CSS policy, and safety.'
    },
    {
        id: 'committer',
        title: 'Committer',
        mission: 'Commit and push if Git policy allows and safety checks pass.'
    }
];
