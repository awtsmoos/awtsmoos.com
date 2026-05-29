// B"H
/**
 * @file pageActions.js
 * @description A small Playwright-like action tongue for simulateRuntime. The
 * Awtsmoos clicks, types, waits, evaluates, and scrolls through CDP so runtime
 * tests exercise a real page, not a sleepy sketch of one.
 */
import { evaluatePage } from "./cdpClient.js";

/** @param {unknown} value Input. @returns {Array} */
export function normalizeActions(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { return JSON.parse(String(value)); } catch (_) { return []; }
}

/** @param {object} cdp CDP client. @param {Array} actions Actions. @returns {Promise<Array>} */
export async function runPageActions(cdp, actions = []) {
  const log = [];
  for (const action of normalizeActions(actions)) {
    const startedAt = new Date().toISOString();
    try {
      const result = await runOneAction(cdp, action);
      log.push({ ok: true, action, result, startedAt, endedAt: new Date().toISOString() });
    } catch (error) {
      log.push({ ok: false, action, error: error.message, stack: error.stack || "", startedAt, endedAt: new Date().toISOString() });
      if (action?.continueOnError !== true) throw error;
    }
  }
  return log;
}

/** @param {object} cdp CDP client. @param {object|string} action Action. @returns {Promise<unknown>} */
async function runOneAction(cdp, action) {
  const name = typeof action === "string" ? action : action.action || action.type || "evaluate";
  if (name === "wait" || name === "waitForTimeout") return wait(Number(action.ms || action.timeout || 250));
  if (name === "waitForSelector") return waitForSelector(cdp, action.selector, Number(action.timeout || 5000));
  if (name === "click") return click(cdp, action.selector);
  if (name === "type" || name === "fill") return typeInto(cdp, action.selector, action.text || action.value || "", name === "fill");
  if (name === "evaluate" || name === "eval") return evaluatePage(cdp, String(action.expression || action.script || "undefined"));
  if (name === "scroll") return evaluatePage(cdp, `window.scrollTo(${Number(action.x || 0)}, ${Number(action.y || 0)}); true`);
  throw new Error(`Unsupported browser action: ${name}`);
}

/** @param {number} ms Milliseconds. */
function wait(ms) { return new Promise(resolve => setTimeout(() => resolve({ waitedMs: ms }), ms)); }

/** @param {object} cdp CDP client. @param {string} selector CSS selector. @param {number} timeout Timeout. */
async function waitForSelector(cdp, selector, timeout) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const exists = await evaluatePage(cdp, `Boolean(document.querySelector(${JSON.stringify(selector)}))`);
    if (exists) return { selector, exists: true };
    await wait(80);
  }
  throw new Error(`waitForSelector timed out: ${selector}`);
}

/** @param {object} cdp CDP client. @param {string} selector CSS selector. */
async function click(cdp, selector) {
  const expression = `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw new Error('missing selector: ${selector}'); el.click(); return true; })()`;
  return evaluatePage(cdp, expression);
}

/** @param {object} cdp CDP client. @param {string} selector Selector. @param {string} text Text. @param {boolean} clear Clear first. */
async function typeInto(cdp, selector, text, clear) {
  const expression = `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw new Error('missing selector: ${selector}'); if (${clear}) el.value = ''; el.focus(); el.value = (el.value || '') + ${JSON.stringify(text)}; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return el.value; })()`;
  return evaluatePage(cdp, expression);
}
