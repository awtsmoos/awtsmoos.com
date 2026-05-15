
// B"H

/**
 * B"H
 * Renders a response into the Chrome output box.
 *
 * @param {HTMLElement} output Output node.
 * @param {object} payload Response payload.
 * @returns {void}
 */
export function renderChromeOutput(output, payload) {
  output.textContent = JSON.stringify(payload, null, 2);
}

/**
 * B"H
 * Shows a friendly working message.
 *
 * @param {HTMLElement} output Output node.
 * @param {string} text Status text.
 * @returns {void}
 */
export function renderChromeBusy(output, text) {
  output.textContent = text;
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
  output.textContent = JSON.stringify({
    BH: "B\"H",
    ok: false,
    error: "ui_validation",
    message
  }, null, 2);
}
