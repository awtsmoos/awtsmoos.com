
// B"H

/**
 * B"H
 * Builds the Custom GPT setup prompt from current page fields.
 *
 * @param {string} tunnelName Name registered by local tunnel client.
 * @param {string} projectPath Folder path selected by user.
 * @returns {string} Prompt text for Custom GPT.
 */
export function buildGptText(tunnelName, projectPath) {
  return [
    "B\"H",
    "",
    "Use my Awtsmoos tunnel.",
    "",
    "tunnelName: " + tunnelName,
    "project path: " + projectPath,
    "",
    "Start by listing the project folder.",
    "Then inspect package.json, README files, and the main entry files.",
    "Do not read node_modules, .git, dist, build, .next, coverage, or private secret files.",
    "If you need to edit, explain the file changes first."
  ].join("\n");
}

/**
 * B"H
 * Copies text from an element into the clipboard.
 *
 * @param {HTMLElement} element Source element.
 * @returns {Promise<void>} Resolves after copy.
 */
export async function copyElementText(element) {
  const text = "value" in element ? element.value : element.textContent;
  await navigator.clipboard.writeText(text || "");
}
