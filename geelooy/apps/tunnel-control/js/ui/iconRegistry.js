// B"H

import { h } from "./core/html.js";

const paths = Object.freeze({
  dashboard: "M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z",
  actions: "M13 2 4 14h7l-1 8 10-13h-7l1-7Z",
  explorer: "M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z",
  mesh: "M12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-7 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm14 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM9.6 10.2 6.6 15m7.8-4.8 3 4.8M8 17h8",
  automation: "M8 7V4h8v3m-9 0h10a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Zm2 4h.01M15 11h.01M10 15h4",
  live: "M3 13h4l2-7 4 14 3-9 2 2h3",
  agents: "M7 11a4 4 0 1 1 8 0M3 21a7 7 0 0 1 14 0m2-12a3 3 0 1 1 0 6m.5 6a5.5 5.5 0 0 0-3-4.9",
  keys: "M14 10a5 5 0 1 0-4 4l-5 5v2h3v-2h2v-2h2l2-2a5 5 0 0 0 0-5Zm2-2h.01",
  virtual: "M4 5h16v11H4V5Zm5 16h6m-3-5v5",
  commands: "M4 5h16v14H4V5Zm4 5 3 3-3 3m5 0h4",
  browser: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-8 9h16M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3m9-9h-3M6 12H3m15.4-6.4-2.1 2.1M7.7 16.3l-2.1 2.1m12.8 0-2.1-2.1M7.7 7.7 5.6 5.6",
  account: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-8 10a8 8 0 0 1 16 0",
  docs: "M6 3h9l3 3v15H6V3Zm8 0v4h4M9 11h6M9 15h6M9 19h3",
  install: "M12 3v12m0 0 5-5m-5 5-5-5M4 21h16",
  setup: "M4 17l6-6m4-4 3-3 3 3-3 3m-7 1 3 3-5 5H5v-3l5-5Z",
  terminal: "M4 5h16v14H4V5Zm4 5 3 3-3 3m5 0h4",
  chrome: "M12 3a9 9 0 0 1 7.8 4.5H12a4.5 4.5 0 0 0-3.9 2.25L4.2 7.5A9 9 0 0 1 12 3Zm0 18a9 9 0 0 1-7.8-4.5L8.1 9.75A4.5 4.5 0 0 0 12 16.5h7.8A9 9 0 0 1 12 21Zm0-4.5A4.5 4.5 0 1 0 12 7.5a4.5 4.5 0 0 0 0 9Z"
});

const aliases = Object.freeze({
  apiKeys: "keys",
  aiAgents: "agents",
  usage: "actions",
  mesh: "mesh",
  live: "live",
  explorer: "explorer",
  install: "install",
  docs: "docs"
});

const emojiFallback = Object.freeze({
  setup: "🛠️",
  live: "🟢",
  apiKeys: "🔐",
  explorer: "📁",
  terminal: "⌁",
  chrome: "🌐",
  docs: "📜",
  usage: "📊",
  aiAgents: "🧠",
  account: "👤",
  install: "⚡",
  mesh: "🕸️"
});

/**
 * B"H
 * Chapter 24: The sign became a stroke of light.
 *
 * Emoji sparks are still welcomed as fallbacks, but the primary dashboard icons
 * become real SVG paths with currentColor, so CSS can tune them into the exact
 * blue, green, purple, amber, and rose lights of the picture.
 *
 * @param {string} name Icon key or emoji.
 * @param {string} group Color group.
 * @returns {HTMLElement} Icon node.
 */
export function createIcon(name, group = "core") {
  const key = aliases[name] || name;
  if (!paths[key]) return h("span", { classes: ["awt-icon-emoji", `is-${group}`], text: emojiFallback[name] || name || "✦" });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", `awt-svg-icon is-${group}`);
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", paths[key]);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.9");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.append(path);
  return svg;
}
