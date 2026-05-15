
// B"H

import { callFs } from "../../api/tunnel.js";
import { parseScript } from "./read.js";

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
  const base = {
    action,
    port: values.port,
    chromePath: values.chromePath || undefined
  };

  switch (action) {
    case "chromeFind":
      return await callFs(tunnelName, { action });

    case "chromeLaunch":
      return await callFs(tunnelName, {
        ...base,
        url: values.url || undefined
      });

    case "chromeStatus":
      return await callFs(tunnelName, base);

    case "chromeNavigate":
      return await callFs(tunnelName, {
        ...base,
        url: values.url
      });

    case "chromeWaitForSelector":
      return await callFs(tunnelName, {
        ...base,
        selector: values.selector,
        timeoutMs: values.waitTimeout
      });

    case "chromeClick":
      return await callFs(tunnelName, {
        ...base,
        selector: values.selector
      });

    case "chromeType":
      return await callFs(tunnelName, {
        ...base,
        selector: values.selector,
        text: values.text
      });

    case "chromeEval":
      return await callFs(tunnelName, {
        ...base,
        expression: values.expression
      });

    case "chromeRunScript": {
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
        ...base,
        script: parsed.script
      });
    }

    default:
      return {
        BH: "B\"H",
        ok: false,
        error: "unknown_action",
        message: "Unknown Chrome action: " + action
      };
  }
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

  if (action === "chromeNavigate" && !values.url) {
    return "URL is required for Navigate.";
  }

  if (
    (action === "chromeWaitForSelector" ||
      action === "chromeClick" ||
      action === "chromeType") &&
    !values.selector
  ) {
    return "Selector is required for this action.";
  }

  if (action === "chromeType" && !values.text) {
    return "Text is required for Type.";
  }

  if (action === "chromeEval" && !values.expression) {
    return "JS expression is required for Evaluate JS.";
  }

  return "";
}
