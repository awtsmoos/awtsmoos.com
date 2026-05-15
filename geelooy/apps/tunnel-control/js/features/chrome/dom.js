
// B"H

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
 * @returns {HTMLButtonElement|null} Button.
 */
export function findButton(pane, pattern) {
  const buttons = Array.from(pane.querySelectorAll("button"));

  return buttons.find(button => pattern.test((button.textContent || "").trim())) || null;
}

/**
 * B"H
 * Returns a stable map of Chrome fields.
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
    chromePath: byId("chromePath") || nth(0),
    port: byId("chromePort") || nth(1),
    url: byId("chromeUrl") || nth(2),
    selector: byId("chromeSelector") || nth(3),
    text: byId("chromeText") || nth(4),
    waitTimeout: byId("chromeWaitTimeout") || nth(5),
    expression: byId("chromeExpression") || nth(6),
    script: byId("chromeScript") || textareas[textareas.length - 1] || nth(7)
  };
}

/**
 * B"H
 * Finds or creates the dedicated Chrome output box.
 *
 * @param {HTMLElement} pane Chrome pane.
 * @returns {HTMLElement} Output element.
 */
export function ensureOutput(pane) {
  let existing = pane.querySelector("#chromeOut");

  if (existing) {
    existing.classList.add("awt-chrome-output", "awt-feedback-panel");
    existing.textContent = existing.textContent || "Ready.";
    return existing;
  }

  existing = document.createElement("pre");
  existing.id = "chromeOut";
  existing.className = "awt-chrome-output awt-feedback-panel";
  existing.textContent = "Ready. Click Find Chrome to search Chrome, Edge, Brave, and Chromium paths.";

  pane.append(existing);
  return existing;
}
