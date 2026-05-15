
// B"H

import {
  getChromePane,
  findButton,
  getChromeFields,
  ensureOutput,
  ensureDiagnostics,
  ensureManualButton
} from "./dom.js";
import { readChromeForm, writeField } from "./read.js";
import {
  runChromeAction,
  validateChromeAction,
  chromeActionLabel
} from "./actions.js";
import {
  renderChromeBusy,
  renderChromeOutput,
  renderChromeError,
  renderChromeSteps
} from "./output.js";
import { mountManualChromePicker } from "./manualPicker.js";

/**
 * B"H
 * Returns progress steps for each Chrome action.
 *
 * @param {string} action Chrome action name.
 * @returns {string[]} Human steps.
 */
function stepsFor(action) {
  const steps = {
    chromeFind: [
      "Searching common Chrome locations",
      "Asking the local agent for installed browser candidates",
      "Preparing manual fallback if auto-detect fails"
    ],
    chromeLaunch: [
      "Checking Chrome path and debugging port",
      "Launching or connecting to Chrome",
      "Preparing browser control session"
    ],
    chromeStatus: [
      "Checking debugging port",
      "Reading open pages",
      "Reporting browser status"
    ],
    chromeNavigate: [
      "Checking target URL",
      "Sending navigation request",
      "Waiting for browser response"
    ],
    chromeWaitForSelector: [
      "Reading selector",
      "Waiting inside the page",
      "Returning selector status"
    ],
    chromeClick: [
      "Reading selector",
      "Sending click request",
      "Returning click status"
    ],
    chromeType: [
      "Reading selector and text",
      "Typing into the page",
      "Returning type status"
    ],
    chromeEval: [
      "Reading JS expression",
      "Evaluating in page context",
      "Returning expression result"
    ],
    chromeRunScript: [
      "Parsing JSON script",
      "Running browser steps",
      "Returning script result"
    ]
  };

  return steps[action] || ["Running Chrome action"];
}

/**
 * B"H
 * Tries to extract a Chrome path from common response shapes.
 *
 * @param {object} payload Response payload.
 * @returns {string} Chrome path or empty string.
 */
function extractChromePath(payload) {
  const direct =
    payload?.chromePath ||
    payload?.path ||
    payload?.foundPath ||
    payload?.chrome?.path ||
    payload?.data?.chromePath ||
    payload?.data?.path;

  if (direct) return String(direct);

  const candidates =
    payload?.candidates ||
    payload?.paths ||
    payload?.chrome?.candidates ||
    payload?.data?.candidates ||
    [];

  const first = Array.isArray(candidates)
    ? candidates.find(item => typeof item === "string" || item?.path || item?.chromePath)
    : null;

  if (!first) return "";
  return typeof first === "string" ? first : String(first.path || first.chromePath || "");
}

/**
 * B"H
 * Runs one Chrome button action safely.
 *
 * @param {Function} getTunnelName Tunnel name reader.
 * @param {HTMLElement} output Output node.
 * @param {HTMLElement} diagnostics Diagnostics node.
 * @param {object} fields Chrome fields.
 * @param {string} action Action name.
 * @param {HTMLButtonElement} button Source button.
 * @returns {Promise<void>} Resolves after action.
 */
async function handleChromeAction(getTunnelName, output, diagnostics, fields, action, button) {
  const pane = getChromePane();
  if (!pane) return;

  const tunnelName = getTunnelName();
  if (!tunnelName) {
    renderChromeSteps(diagnostics, ["No tunnel is active"]);
    renderChromeError(output, "No tunnel is active yet.");
    return;
  }

  const values = readChromeForm(fields);
  const problem = validateChromeAction(action, values);
  if (problem) {
    renderChromeSteps(diagnostics, ["Fix required input"]);
    renderChromeError(output, problem);
    return;
  }

  const before = button.textContent;
  button.disabled = true;
  button.textContent = "Working...";
  renderChromeSteps(diagnostics, stepsFor(action));
  renderChromeBusy(output, "Running " + chromeActionLabel(action) + "...");

  try {
    const got = await runChromeAction(tunnelName, values, action);

    if (action === "chromeFind") {
      const foundPath = extractChromePath(got);
      if (foundPath) {
        writeField(fields.chromePath, foundPath);
        renderChromeSteps(diagnostics, [
          "Chrome found",
          "Path copied into Chrome path field",
          "Next step: click Launch / Connect"
        ]);
      } else {
        renderChromeSteps(diagnostics, [
          "Auto-detect finished",
          "No clear Chrome path returned",
          "Use Choose Chrome manually"
        ]);
      }
    }

    renderChromeOutput(output, got);
  } catch (e) {
    renderChromeSteps(diagnostics, [
      "Chrome action failed",
      "Read the output below",
      "Use manual picker if Chrome path is missing"
    ]);
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
 * @param {HTMLElement} diagnostics Diagnostics node.
 * @param {object} fields Chrome fields.
 * @param {RegExp} label Button label pattern.
 * @param {string} action Action name.
 * @returns {void}
 */
function wireButton(pane, getTunnelName, output, diagnostics, fields, label, action) {
  const button = findButton(pane, label);
  if (!button || button.dataset.awtBound === "1") return;

  button.dataset.awtBound = "1";
  button.addEventListener("click", event => {
    event.preventDefault();
    handleChromeAction(getTunnelName, output, diagnostics, fields, action, button);
  });
}

/**
 * B"H
 * Adds dashboard classes to the old Chrome markup without requiring HTML surgery.
 *
 * @param {HTMLElement} pane Chrome pane.
 * @returns {void}
 */
function normalizeChromePane(pane) {
  pane.classList.add("awt-chrome-dashboard");

  for (const card of pane.querySelectorAll(".chrome-card, .card, .section")) {
    card.classList.add("awt-chrome-card");
  }

  const labels = Array.from(pane.querySelectorAll("label"));
  for (const label of labels) {
    label.classList.add("field");
  }
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
  if (!pane || pane.dataset.awtChromeMounted === "1") return;

  pane.dataset.awtChromeMounted = "1";
  normalizeChromePane(pane);

  const fields = getChromeFields(pane);
  const output = ensureOutput(pane);
  const diagnostics = ensureDiagnostics(pane, output);
  const manualButton = ensureManualButton(pane);

  mountManualChromePicker(manualButton, fields);

  wireButton(pane, getTunnelName, output, diagnostics, fields, /^Find Chrome$/i, "chromeFind");
  wireButton(pane, getTunnelName, output, diagnostics, fields, /^Launch\s*\/\s*Connect$/i, "chromeLaunch");
  wireButton(pane, getTunnelName, output, diagnostics, fields, /^Status$/i, "chromeStatus");
  wireButton(pane, getTunnelName, output, diagnostics, fields, /^Navigate$/i, "chromeNavigate");
  wireButton(pane, getTunnelName, output, diagnostics, fields, /^Wait$/i, "chromeWaitForSelector");
  wireButton(pane, getTunnelName, output, diagnostics, fields, /^Click$/i, "chromeClick");
  wireButton(pane, getTunnelName, output, diagnostics, fields, /^Type$/i, "chromeType");
  wireButton(pane, getTunnelName, output, diagnostics, fields, /^Evaluate\s*JS$/i, "chromeEval");
  wireButton(pane, getTunnelName, output, diagnostics, fields, /^Run\s*script$/i, "chromeRunScript");

  renderChromeSteps(diagnostics, [
    "Chrome controls mounted",
    "Click Find Chrome for auto-detect",
    "Use Choose Chrome manually if needed"
  ]);
}
