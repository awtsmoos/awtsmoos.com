// B"H
const { chromeLaunch, chromeStatus, chromeNavigate, chromeEval, chromeClick, chromeType, chromeWaitForSelector, chromeSnapshot } = require("../chrome/actions.js");

/**
 * B"H
 * Chapter 385: Chrome became the first runtime garment.
 * In auto mode, the agent tries real headless Chrome through DevTools. If the
 * browser is absent or disabled, the caller receives a clean failure and the
 * runtime engine may continue to node-dom and Merkava.
 */
function htmlDataUrl(html = "") {
  return "data:text/html;charset=utf-8," + encodeURIComponent(String(html || ""));
}

function actionList(options = {}) {
  const raw = options.browserActions || options.pageActions || options.interactions || [];
  return Array.isArray(raw) ? raw : [];
}

async function ensureChrome(options = {}) {
  const status = await chromeStatus({ port: options.port, maxLogs: 20 });
  if (status.connected) return { status, launched: false };
  const launch = await chromeLaunch({ port: options.port || 9222, headless: options.headless !== false, url: "about:blank", startupWaitMs: options.startupWaitMs || 1200, maxLogs: 50 });
  if (launch.ok === false) throw new Error(launch.error || launch.message || "chrome_launch_failed");
  return { status: await chromeStatus({ port: launch.port, maxLogs: 20 }), launched: true, launch };
}

async function runChromeAction(step = {}) {
  const type = String(step.action || step.type || step.method || "");
  if (["wait", "waitForSelector"].includes(type) && step.selector) return await chromeWaitForSelector(step);
  if (["click", "tap"].includes(type)) return await chromeClick(step);
  if (["fill", "type", "setValue"].includes(type)) return await chromeType({ ...step, text: step.text ?? step.value ?? "" });
  if (["evaluate", "eval"].includes(type)) return await chromeEval({ ...step, expression: step.expression || step.source || step.script || "undefined" });
  if (["assertText", "toHaveText"].includes(type)) return await assertText(step);
  if (["assertValue", "toHaveValue"].includes(type)) return await assertValue(step);
  if (["snapshot", "screenshot"].includes(type)) return await chromeSnapshot(step);
  if (["waitForTimeout"].includes(type)) return await sleep(Number(step.ms || step.waitMs || 0));
  return { ok: false, action: type, error: "unsupported_chrome_runtime_action" };
}

async function assertText(step = {}) {
  const selector = step.selector;
  const expected = String(step.expected ?? step.text ?? step.value ?? "");
  const expression = `(() => { const el = document.querySelector(${JSON.stringify(selector)}); return el ? String(el.textContent || '') : null; })()`;
  const got = await chromeEval({ ...step, expression });
  const text = got.result?.result?.value ?? got.result?.value ?? got.result?.result?.description ?? "";
  return { ok: String(text).includes(expected), action: "assertText", selector, expected, actual: text };
}

async function assertValue(step = {}) {
  const selector = step.selector;
  const expected = String(step.expected ?? step.value ?? "");
  const expression = `(() => { const el = document.querySelector(${JSON.stringify(selector)}); return el ? String(el.value || '') : null; })()`;
  const got = await chromeEval({ ...step, expression });
  const value = got.result?.result?.value ?? got.result?.value ?? "";
  return { ok: String(value) === expected, action: "assertValue", selector, expected, actual: value };
}

async function readReturnValues(values = []) {
  const out = {};
  for (const expr of Array.isArray(values) ? values : []) {
    const got = await chromeEval({ expression: String(expr) });
    out[String(expr)] = got.result?.result?.value ?? got.result?.value ?? got.result?.result?.description ?? null;
  }
  return out;
}

async function simulateChromeRuntime(options = {}) {
  await ensureChrome(options);
  const url = options.url && !/^https:\/\/awtsmoos\.com\/?$/.test(options.url) ? options.url : htmlDataUrl(options.files?.[options.entry] || options.html || "");
  const nav = await chromeNavigate({ url, waitMs: options.waitMs || 0, timeoutMs: options.timeoutMs || 30000, snapshot: false, headless: options.headless !== false });
  if (nav.ok === false) throw new Error(nav.error || "chrome_navigation_failed");
  const interactionLog = [];
  const errors = [];
  for (const step of actionList(options)) {
    const result = await runChromeAction(step);
    interactionLog.push(result);
    if (result.ok === false) errors.push(result);
  }
  if (options.waitMs) await sleep(Number(options.waitMs));
  const values = await readReturnValues(options.returnValues || options.values || []);
  const snapshot = await chromeSnapshot({ maxLogs: 100 }).catch(error => ({ ok: false, error: error.message }));
  return { ok: errors.length === 0, action: "simulateRuntime", engine: "chrome", score: errors.length ? 50 : 100, url, navigation: nav, interactionLog, errors, values, snapshot };
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, Math.max(0, ms))); }

module.exports = { simulateChromeRuntime, ensureChrome, runChromeAction, htmlDataUrl };
