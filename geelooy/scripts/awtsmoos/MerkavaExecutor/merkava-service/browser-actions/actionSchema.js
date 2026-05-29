// B"H

/**
 * B"H
 * Chapter 32: The browser ritual gained more letters, yet one breath remained.
 *
 * These aliases let agents speak Puppeteer, Playwright, or plain tunnel words.
 * Every word is lowered into canonical action names before selectors, keys,
 * assertions, and code enter the custom Merkava browser.
 */
export const ACTION_ALIASES = Object.freeze({
  goto: "goto", navigate: "goto", url: "goto",
  click: "click", tap: "click", dblclick: "doubleClick", doubleClick: "doubleClick",
  hover: "hover", focus: "focus", blur: "blur",
  type: "type", fill: "fill", clear: "clear", press: "press", key: "press",
  check: "check", uncheck: "uncheck", select: "selectOption", selectOption: "selectOption",
  wait: "wait", waitForTimeout: "wait", waitForSelector: "waitForSelector", locator: "waitForSelector", waitForFunction: "waitForFunction",
  assertText: "assertText", expectText: "assertText", assertExists: "assertExists", expectExists: "assertExists",
  assertValue: "assertValue", expectValue: "assertValue", assertChecked: "assertChecked", assertUrl: "assertUrl", assertEval: "assertEval",
  evaluate: "evaluate", eval: "evaluate", script: "evaluate", screenshot: "screenshot", snapshot: "snapshot"
});

/**
 * B"H
 * Normalizes one action into the canonical browser runner shape.
 *
 * @param {object|string} step Raw JSON action.
 * @param {number} index Step index.
 * @returns {object} Canonical action.
 */
export function normalizeBrowserAction(step, index = 0) {
  const raw = typeof step === "string" ? { action: step } : { ...(step || {}) };
  const action = ACTION_ALIASES[raw.action || raw.op || raw.method || raw.type] || raw.action || raw.op;
  return { id: raw.id || `step-${index + 1}`, ...raw, action };
}

/**
 * B"H
 * Accepts arrays, JSON strings, or wrapper objects with actions/steps.
 *
 * @param {unknown} value Raw browser action payload.
 * @returns {object[]} Canonical action list.
 */
export function normalizeBrowserActions(value) {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  const list = Array.isArray(parsed) ? parsed : parsed?.actions || parsed?.steps || [];
  return list.map(normalizeBrowserAction);
}
