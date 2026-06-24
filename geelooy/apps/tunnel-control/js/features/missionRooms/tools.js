// B"H

/**
 * B"H
 * Chapter 711: The action names formed tribes around their first letters.
 */
export function normalizeTools(catalog = {}) {
  return (catalog.actions || []).map(name => ({ name, group: groupFor(name), desc: descFor(name) }));
}

export function filterTools(tools, filter = "") {
  const q = filter.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter(tool => [tool.name, tool.group, tool.desc].join(" ").toLowerCase().includes(q));
}

function groupFor(name = "") {
  if (name.startsWith("mission")) return "Mission";
  if (name.startsWith("command")) return "Command";
  if (name.startsWith("chrome") || name.startsWith("browser")) return "Browser";
  if (["read", "write", "bulk", "list", "tree", "find", "rg", "grep"].some(x => name.startsWith(x))) return "Files";
  if (name.startsWith("ai") || name.startsWith("agent")) return "Agents";
  if (name.startsWith("preview")) return "Preview";
  if (name.startsWith("runtime")) return "Runtime";
  if (name.startsWith("git")) return "Git";
  if (name.startsWith("test") || name.includes("Test")) return "Tests";
  return "Tunnel";
}

function descFor(name = "") {
  return name.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").trim() || "Tunnel action";
}
