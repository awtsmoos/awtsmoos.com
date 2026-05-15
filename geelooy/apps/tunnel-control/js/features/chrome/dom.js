
// B"H

import { el } from "../../lib/dom.js";

/**
 * B"H
 * Finds the Chrome pane.
 *
 * @returns {HTMLElement|null} Pane node.
 */
export function getChromePane() {
  return document.querySelector('[data-pane="chrome"]');
}

/**
 * B"H
 * Finds a button inside the Chrome pane by visible text.
 *
 * @param {HTMLElement} pane Chrome pane.
 * @param {RegExp} pattern Text pattern.
 * @returns {HTMLButtonElement|null} Matching button.
 */
export function findButton(pane, pattern) {
  const buttons = Array.from(pane.querySelectorAll("button"));
  return buttons.find(button => pattern.test((button.textContent || "").trim())) || null;
}

/**
 * B"H
 * Returns the first field whose label contains a phrase.
 *
 * @param {HTMLElement} pane Chrome pane.
 * @param {RegExp} labelPattern Label text pattern.
 * @returns {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null} Field.
 */
function fieldByLabel(pane, labelPattern) {
  const labels = Array.from(pane.querySelectorAll("label"));
  for (const label of labels) {
    if (!labelPattern.test((label.textContent || "").trim())) continue;
    const control = label.querySelector("input, textarea, select");
    if (control) return control;
    if (label.htmlFor) {
      const byFor = pane.querySelector("#" + CSS.escape(label.htmlFor));
      if (byFor) return byFor;
    }
  }
  return null;
}

/**
 * B"H
 * Returns a stable map of Chrome fields.
 *
 * This supports ids, label lookup, and old order-based markup.
 *
 * @param {HTMLElement} pane Chrome pane.
 * @returns {object} Fields map.
 */
export function getChromeFields(pane) {
  const inputs = Array.from(
    pane.querySelectorAll('input:not([type="hidden"]), textarea, select')
  );
  const textareas = Array.from(pane.querySelectorAll("textarea"));
  const byId = id => pane.querySelector("#" + id);
  const nth = index => inputs[index] || null;

  return {
    chromePath:
      byId("chromePath") ||
      fieldByLabel(pane, /chrome\s*path/i) ||
      nth(0),
    port:
      byId("chromePort") ||
      fieldByLabel(pane, /^port$/i) ||
      nth(1),
    url:
      byId("chromeUrl") ||
      fieldByLabel(pane, /^url$/i) ||
      nth(2),
    selector:
      byId("chromeSelector") ||
      fieldByLabel(pane, /selector/i) ||
      nth(3),
    text:
      byId("chromeText") ||
      fieldByLabel(pane, /^text$/i) ||
      nth(4),
    waitTimeout:
      byId("chromeWaitTimeout") ||
      fieldByLabel(pane, /wait\s*timeout/i) ||
      nth(5),
    expression:
      byId("chromeExpression") ||
      fieldByLabel(pane, /js\s*expression/i) ||
      nth(6),
    script:
      byId("chromeScript") ||
      fieldByLabel(pane, /script/i) ||
      textareas[textareas.length - 1] ||
      nth(7)
  };
}

/**
 * B"H
 * Finds or creates the Chrome output box.
 *
 * @param {HTMLElement} pane Chrome pane.
 * @returns {HTMLElement} Output element.
 */
export function ensureOutput(pane) {
  const existing =
    pane.querySelector("#chromeOut") ||
    pane.querySelector(".awt-chrome-output") ||
    pane.querySelector("pre");

  if (existing) {
    existing.classList.add("awt-chrome-output");
    return existing;
  }

  const pre = el("pre", {
    id: "chromeOut",
    className: "awt-chrome-output",
    text: "Ready."
  });

  pane.append(pre);
  return pre;
}

/**
 * B"H
 * Finds or creates the Chrome diagnostics host.
 *
 * @param {HTMLElement} pane Chrome pane.
 * @param {HTMLElement} output Output node.
 * @returns {HTMLElement} Diagnostics host.
 */
export function ensureDiagnostics(pane, output) {
  let host = pane.querySelector(".awt-chrome-diagnostics");
  if (host) return host;

  host = el("div", {
    className: "awt-chrome-diagnostics",
    attrs: { "aria-live": "polite" }
  });

  output.before(host);
  return host;
}

/**
 * B"H
 * Adds a manually generated Chrome button beside Find Chrome.
 *
 * @param {HTMLElement} pane Chrome pane.
 * @returns {HTMLButtonElement} Manual chooser button.
 */
export function ensureManualButton(pane) {
  const existing = pane.querySelector("#chromeManualBtn");
  if (existing) return existing;

  const find = findButton(pane, /^Find Chrome$/i);
  const button = el("button", {
    id: "chromeManualBtn",
    type: "button",
    className: "btn-sm",
    text: "Choose Chrome manually"
  });

  if (find) {
    find.insertAdjacentElement("afterend", button);
  } else {
    pane.prepend(button);
  }

  return button;
}
