// B"H
const { fill } = require("./fill.js");
const { click } = require("./click.js");
const { typeText } = require("./type.js");
const { assertText } = require("./assertText.js");
const { assertValue } = require("./assertValue.js");
const { evaluate } = require("./evaluate.js");
const { waitAction } = require("./wait.js");
const { snapshotAction } = require("./snapshotAction.js");

/** B"H: runs a small but Playwright/Puppeteer-shaped browser action grammar. */
async function runBrowserActions({ window, context, actions = [], errors = [] }) {
  const list = Array.isArray(actions) ? actions : [];
  const log = [];
  for (const action of list) {
    try {
      const type = String(action.action || action.type || action.method || "");
      const value = await dispatch(type, action, window, context);
      log.push({ ok: true, action: type, selector: action.selector || null, value });
    } catch (error) {
      const entry = { ok: false, action: action.action || action.type, selector: action.selector || null, error: error.message };
      log.push(entry); errors.push({ message: error.message, stack: error.stack, phase: "browserAction" });
      break;
    }
  }
  return log;
}

function dispatch(type, action, window, context) {
  if (["fill", "setValue"].includes(type)) return fill(window, action);
  if (["click", "tap"].includes(type)) return click(window, action);
  if (["type", "pressSequentially"].includes(type)) return typeText(window, action);
  if (["assertText", "toHaveText"].includes(type)) return assertText(window, action);
  if (["assertValue", "toHaveValue"].includes(type)) return assertValue(window, action);
  if (["evaluate", "eval"].includes(type)) return evaluate(context, action);
  if (["wait", "waitForTimeout", "waitForSelector"].includes(type)) return waitAction(window, action);
  if (["snapshot", "screenshot"].includes(type)) return snapshotAction(window);
  throw new Error("Unsupported node-dom browser action: " + type);
}

module.exports = { runBrowserActions, dispatch };
