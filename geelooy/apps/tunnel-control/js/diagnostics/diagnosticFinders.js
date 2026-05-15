
// B"H

import { many } from "../ui/core/html.js";

/**
 * B"H
 * Finds raw/debug output nodes.
 *
 * @returns {HTMLElement[]} Debug nodes.
 */
export function findDiagnosticNodes() {
  const nodes = new Set();

  for (const selector of [
    "#identityBox",
    "#deviceBox",
    "#configBox",
    "#keyBox",
    "#usageBox",
    "#actionBox",
    "#miniStatus",
    "[id$='Box']",
    "[id$='Out']",
    "pre"
  ]) {
    for (const node of many(selector)) {
      if (node.closest(".awt-diagnostics-drawer")) continue;
      nodes.add(node);
    }
  }

  return Array.from(nodes);
}

/**
 * B"H
 * Finds a small title near a raw output.
 *
 * @param {HTMLElement} node Raw node.
 * @returns {string} Title.
 */
export function diagnosticTitle(node) {
  let current = node.previousElementSibling;

  for (let i = 0; i < 4 && current; i++) {
    const text = (current.textContent || "").trim();
    if (text && text.length < 90) return text;
    current = current.previousElementSibling;
  }

  return node.id || "Raw response";
}
