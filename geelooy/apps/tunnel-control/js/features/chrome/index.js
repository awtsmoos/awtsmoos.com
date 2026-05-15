
// B"H

import { getChromePane, findButton, getChromeFields, ensureOutput } from "./dom.js";
import { readChromeForm } from "./read.js";
import { runChromeAction, validateChromeAction } from "./actions.js";
import {
  renderChromeBusy,
  renderChromeOutput,
  renderChromeError
} from "./output.js";

/**
 * B"H
 * Runs one Chrome button action safely.
 *
 * @param {Function} getTunnelName Tunnel name reader.
 * @param {HTMLElement} output Output node.
 * @param {string} action Action name.
 * @param {HTMLButtonElement} button Source button.
 * @returns {Promise<void>} Resolves after action.
 */
async function handleChromeAction(getTunnelName, output, action, button) {
  const pane = getChromePane();
  if (!pane) return;

  const tunnelName = getTunnelName();

  if (!tunnelName) {
    renderChromeError(output, "No tunnel is active yet.");
    return;
  }

  const values = readChromeForm(getChromeFields(pane));
  const problem = validateChromeAction(action, values);

  if (problem) {
    renderChromeError(output, problem);
    return;
  }

  const before = button.textContent;

  button.disabled = true;
  button.textContent = "Running...";
  renderChromeBusy(output, "Running " + action + "...");

  try {
    const got = await runChromeAction(tunnelName, values, action);
    renderChromeOutput(output, got);
  } catch (e) {
    renderChromeError(output, e.message || String(e));
  } finally {
    button.disabled = false;
    button.textContent = before;
  }
}

/**
 * B"H
 * Wires one button if present.
 *
 * @param {HTMLElement} pane Chrome pane.
 * @param {Function} getTunnelName Tunnel reader.
 * @param {HTMLElement} output Output node.
 * @param {RegExp} label Button label pattern.
 * @param {string} action Action name.
 * @returns {void}
 */
function wireButton(pane, getTunnelName, output, label, action) {
  const button = findButton(pane, label);

  if (!button || button.dataset.awtChromeBound === action) return;

  button.dataset.awtChromeBound = action;

  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    handleChromeAction(getTunnelName, output, action, button);
  });
}

/**
 * B"H
 * Mounts the Chrome feature controls.
 *
 * @param {Function} getTunnelName Tunnel name reader.
 * @returns {void}
 */
export function mountChrome(getTunnelName) {
  const pane = getChromePane();
  if (!pane) return;

  const output = ensureOutput(pane);

  wireButton(pane, getTunnelName, output, /^Find Chrome$/i, "chromeFind");
  wireButton(pane, getTunnelName, output, /^Launch\s*\/\s*Connect$/i, "chromeLaunch");
  wireButton(pane, getTunnelName, output, /^Status$/i, "chromeStatus");
  wireButton(pane, getTunnelName, output, /^Navigate$/i, "chromeNavigate");
  wireButton(pane, getTunnelName, output, /^Wait$/i, "chromeWaitForSelector");
  wireButton(pane, getTunnelName, output, /^Click$/i, "chromeClick");
  wireButton(pane, getTunnelName, output, /^Type$/i, "chromeType");
  wireButton(pane, getTunnelName, output, /^Evaluate\s*JS$/i, "chromeEval");
  wireButton(pane, getTunnelName, output, /^Run\s*script$/i, "chromeRunScript");

  pane.dataset.awtChromeMounted = "1";
}
