
// B"H

export function buildPrompt({ tunnelName, projectPath, mode }) {
  const lines = [
    'B"H',
    "",
    "Use my Awtsmoos tunnel.",
    "",
    "tunnelName: " + tunnelName,
    "project path: " + projectPath,
    "",
    "Available raw dev API pattern:",
    "https://awtsmoos.com/api/tunnel/fs/" + tunnelName + "?action=list&p=.",
    "",
    "Start by listing the project folder.",
    "Then inspect package.json, README files, and the main entry files.",
    "Do not read node_modules, .git, dist, build, .next, coverage, or private secret files.",
    "Tree commands should use depth 2 or 3 and a limit.",
    "Use bulk read when reading multiple files.",
    "If editing, explain the intended changes first, then use write or bulkWrite."
  ];

  if (mode === "review") lines.push("", "Mode: read-only reviewer. Do not write files.");
  if (mode === "fixer") lines.push("", "Mode: bug fixer. Trace the issue, identify responsible files, then make minimal targeted edits.");
  if (mode === "vibe") lines.push("", "Mode: vibe coder. Improve UI, CSS, structure, usability, and developer experience aggressively but safely.");

  return lines.join("\n");
}
