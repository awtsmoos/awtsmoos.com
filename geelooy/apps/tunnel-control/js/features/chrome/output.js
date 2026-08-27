
// B"H

/**
 * B"H
 * Formats a JSON payload.
 *
 * @param {unknown} payload Response payload.
 * @returns {string} Pretty text.
 */
function pretty(payload) {
  try {
    return JSON.stringify(payload, null, 2);
  } catch (e) {
    return String(payload);
  }
}

/**
 * B"H
 * Renders step chips into the diagnostics host.
 *
 * @param {HTMLElement|null} diagnostics Diagnostics host.
 * @param {string[]} steps Step labels.
 * @returns {void}
 */
export function renderChromeSteps(diagnostics, steps) {
  if (!diagnostics) return;
  diagnostics.replaceChildren();

  for (const step of steps) {
    const row = document.createElement("div");
    row.className = "awt-chrome-step";
    row.textContent = step;
    diagnostics.append(row);
  }
}

/**
 * B"H
 * Renders a response into the Chrome output box.
 *
 * @param {HTMLElement} output Output node.
 * @param {object} payload Response payload.
 * @returns {void}
 */
export function renderChromeOutput(output, payload) {
  output.textContent = pretty(payload);
}

/**
 * B"H
 * Shows a friendly working message.
 *
 * @param {HTMLElement} output Output node.
 * @param {string} message Status text.
 * @returns {void}
 */
export function renderChromeBusy(output, message) {
  output.textContent = pretty({
    BH: "B\"H",
    ok: true,
    status: "working",
    message
  });
}

/**
 * B"H
 * Shows a friendly local validation error.
 *
 * @param {HTMLElement} output Output node.
 * @param {string} message Error message.
 * @returns {void}
 */
export function renderChromeError(output, message) {
  output.textContent = pretty({
    BH: "B\"H",
    ok: false,
    error: "ui_validation",
    message
  });
}
