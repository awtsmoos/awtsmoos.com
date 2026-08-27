
// B"H

import { callFs } from "../../api/tunnel.js";
import { parseScript } from "./read.js";

/**
 * B"H
 * Builds the shared Chrome request base.
 *
 * @param {object} values Chrome form values.
 * @param {string} action Action name.
 * @returns {object} Base request.
 */
function base(values, action) {
  return {
    action,
    port: values.port,
    chromePath: values.chromePath || undefined
  };
}

/**
 * B"H
 * Runs chromeFind.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {object} values Chrome form values.
 * @returns {Promise<object>} Response payload.
 */
async function chromeFind(tunnelName, values) {
  return await callFs(tunnelName, { action: "chromeFind" });
}

/**
 * B"H
 * Runs chromeLaunch.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {object} values Chrome form values.
 * @returns {Promise<object>} Response payload.
 */
async function chromeLaunch(tunnelName, values) {
  return await callFs(tunnelName, {
    ...base(values, "chromeLaunch"),
    url: values.url || undefined
  });
}

/**
 * B"H
 * Runs chromeStatus.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {object} values Chrome form values.
 * @returns {Promise<object>} Response payload.
 */
async function chromeStatus(tunnelName, values) {
  return await callFs(tunnelName, base(values, "chromeStatus"));
}

/**
 * B"H
 * Runs chromeNavigate.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {object} values Chrome form values.
 * @returns {Promise<object>} Response payload.
 */
async function chromeNavigate(tunnelName, values) {
  return await callFs(tunnelName, {
    ...base(values, "chromeNavigate"),
    url: values.url
  });
}

/**
 * B"H
 * Runs chromeWaitForSelector.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {object} values Chrome form values.
 * @returns {Promise<object>} Response payload.
 */
async function chromeWaitForSelector(tunnelName, values) {
  return await callFs(tunnelName, {
    ...base(values, "chromeWaitForSelector"),
    selector: values.selector,
    timeoutMs: values.waitTimeout
  });
}

/**
 * B"H
 * Runs chromeClick.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {object} values Chrome form values.
 * @returns {Promise<object>} Response payload.
 */
async function chromeClick(tunnelName, values) {
  return await callFs(tunnelName, {
    ...base(values, "chromeClick"),
    selector: values.selector
  });
}

/**
 * B"H
 * Runs chromeType.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {object} values Chrome form values.
 * @returns {Promise<object>} Response payload.
 */
async function chromeType(tunnelName, values) {
  return await callFs(tunnelName, {
    ...base(values, "chromeType"),
    selector: values.selector,
    text: values.text
  });
}

/**
 * B"H
 * Runs chromeEval.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {object} values Chrome form values.
 * @returns {Promise<object>} Response payload.
 */
async function chromeEval(tunnelName, values) {
  return await callFs(tunnelName, {
    ...base(values, "chromeEval"),
    expression: values.expression
  });
}

/**
 * B"H
 * Runs chromeRunScript.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {object} values Chrome form values.
 * @returns {Promise<object>} Response payload.
 */
async function chromeRunScript(tunnelName, values) {
  const parsed = parseScript(values.scriptText);
  if (!parsed.ok) {
    return {
      BH: "B\"H",
      ok: false,
      error: "invalid_script_json",
      message: parsed.error
    };
  }

  return await callFs(tunnelName, {
    ...base(values, "chromeRunScript"),
    script: parsed.script
  });
}

const ACTIONS = {
  chromeFind,
  chromeLaunch,
  chromeStatus,
  chromeNavigate,
  chromeWaitForSelector,
  chromeClick,
  chromeType,
  chromeEval,
  chromeRunScript
};

const REQUIRED = {
  chromeNavigate: [["url", "URL is required for Navigate."]],
  chromeWaitForSelector: [["selector", "Selector is required for Wait."]],
  chromeClick: [["selector", "Selector is required for Click."]],
  chromeType: [
    ["selector", "Selector is required for Type."],
    ["text", "Text is required for Type."]
  ],
  chromeEval: [["expression", "JS expression is required for Evaluate JS."]]
};

/**
 * B"H
 * Launches a Chrome-related tunnel action.
 *
 * @param {string} tunnelName Tunnel name.
 * @param {object} values Chrome form values.
 * @param {string} action Action name.
 * @returns {Promise<object>} Response.
 */
export async function runChromeAction(tunnelName, values, action) {
  const runner = ACTIONS[action];
  if (!runner) {
    return {
      BH: "B\"H",
      ok: false,
      error: "unknown_action",
      message: "Unknown Chrome action: " + action
    };
  }

  return await runner(tunnelName, values);
}

/**
 * B"H
 * Small validator for actions that need specific inputs.
 *
 * @param {string} action Action name.
 * @param {object} values Chrome form values.
 * @returns {string} Validation error or empty string.
 */
export function validateChromeAction(action, values) {
  if (!values.port) return "Port is required.";

  for (const [field, message] of REQUIRED[action] || []) {
    if (!values[field]) return message;
  }

  return "";
}

/**
 * B"H
 * Gives the user a plain-English action label.
 *
 * @param {string} action Action name.
 * @returns {string} Friendly label.
 */
export function chromeActionLabel(action) {
  const labels = {
    chromeFind: "Find Chrome",
    chromeLaunch: "Launch / Connect",
    chromeStatus: "Status",
    chromeNavigate: "Navigate",
    chromeWaitForSelector: "Wait",
    chromeClick: "Click",
    chromeType: "Type",
    chromeEval: "Evaluate JS",
    chromeRunScript: "Run script"
  };

  return labels[action] || action;
}
