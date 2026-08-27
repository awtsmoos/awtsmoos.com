// B"H

/** B"H: Room templates turn the lobby into a launchpad. */
export const ROOM_TEMPLATES = [
  { key: "bug", title: "Bug Fix", goal: "Fix this bug, reproduce it, patch it, test it, and report exactly what changed." },
  { key: "feature", title: "Feature", goal: "Build this feature end-to-end with tests, UI polish, and a final verification report." },
  { key: "refactor", title: "Refactor", goal: "Refactor safely, reduce complexity, preserve behavior, and verify every affected path." },
  { key: "docs", title: "Docs", goal: "Write or improve documentation with examples, architecture notes, and handoff details." },
  { key: "research", title: "Research", goal: "Investigate the codebase, compare options, cite evidence from files, and propose an implementation plan." },
  { key: "release", title: "Release", goal: "Prepare release notes, checks, smoke tests, and deployment readiness." },
  { key: "security", title: "Security Audit", goal: "Audit for security risks, secrets, unsafe permissions, injection, auth, and data exposure." }
];

export function templateGoal(key) {
  return ROOM_TEMPLATES.find(t => t.key === key)?.goal || "";
}
