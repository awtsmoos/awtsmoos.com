//B"H
/**
 * @file desktopShellData.js
 * @brief Data vessels for the embedded desktop AI shell.
 *
 * Chapter 9: The Awtsmoos arranged the widened chamber into three rivers. The
 * left remembers the project, the center speaks, and the right interprets the
 * sparks that fly from every file. This file is pure data: no DOM mutation, no
 * side effects, only named vessels awaiting revelation.
 */

export const DESKTOP_SHELL = Object.freeze({
  nav: [
    ["AI Chat", "◌"],
    ["Files", "▢"],
    ["Search", "⌕"],
    ["Terminal", "⌘"],
    ["Tools", "✣"],
    ["Settings", "⚙"]
  ],
  project: ["awtsmoos.com", "geelooy", "apps", "code", "ai", "js", "css"],
  tools: ["Code Interpreter", "File Analyzer", "Image Generation", "Tunnel Relay"],
  activity: ["Message sent", "Relay checked", "Provider ready", "Context indexed"]
});

/**
 * B"H. Creates a compact list schema.
 * @param {string} title Section title.
 * @param {string[]} rows Plain row labels.
 * @returns {object} JSON DOM schema.
 */
export function sectionSchema(title, rows) {
  return {
    className: "desktop-shell-card",
    children: [
      { tag: "h3", text: title },
      { tag: "ul", children: rows.map(text => ({ tag: "li", text })) }
    ]
  };
}
