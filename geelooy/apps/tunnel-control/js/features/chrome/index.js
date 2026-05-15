
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
 * Humanizes Chrome finder response.
 *
 * @param {object} got Response.
 * @returns {object} Decorated response.
 */
function humanChromeResult(got) {
  if (!got || got.ok === false) return got;

  if (got.action !== "chromeFind" && got.action !== "chromeStatus") return got;

  if (got.chromePath) {
    return {
      ...got,
      nextStep: "Browser path was found. Click Launch / Connect next."
    };
  }

  return {
    ...got,
    nextStep:
      "No browser path was found automatically. Paste the full path to chrome.exe, msedge.exe, brave.exe, or chromium into the Chrome path field. On Windows, try right-clicking Chrome/Edge/Brave shortcut → Open file location → copy the .exe path."
  };
}

/**
 * B"H
 * Applies Chrome finder result to the path field.
 *
 * @param {HTMLElement} pane Chrome pane.
 * @param {object} result Finder result.
 * @returns {void}
 */
function applyFinderResult(pane, result) {
  if (!result) return;

  const fields = getChromeFields(pane);

  if (result.chromePath && fields.chromePath) {
    fields.chromePath.value = result.chromePath;
  }
}

/**
 * B"H
 * Runs one Chrome action.
 *
 * @param {Function} getTunnelName Tunnel name reader.
 * @param {HTMLElement} output Output node.
 * @param {string} action Action name.
 * @param {HTMLButtonElement} button Source button.
 * @returns {Promise<void>} Done.
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
  button.classList.add("working");
  button.textContent = "Running...";
  renderChromeBusy(output, "Running " + action + "...");

  try {
    const got = humanChromeResult(await runChromeAction(tunnelName, values, action));
    applyFinderResult(pane, got);
    renderChromeOutput(output, got);
  } catch (e) {
    renderChromeError(output, e.message || String(e));
  } finally {
    button.disabled = false;
    button.classList.remove("working");
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
 * @param {RegExp} label Button label.
 * @param {string} action Action.
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
 * Mounts Chrome controls.
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
