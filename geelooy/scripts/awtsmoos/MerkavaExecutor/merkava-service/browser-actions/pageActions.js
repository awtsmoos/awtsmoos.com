// B"H
/**
 * @file pageActions.js
 * @description A small Playwright-like action tongue for simulateRuntime. The
 * Awtsmoos clicks, types, waits, evaluates, and scrolls through CDP so runtime
 * tests exercise a real page, not a sleepy sketch of one.
 */
import { evaluatePage, dispatchKeyEvent, dispatchMouseEvent, elementCenter } from "./cdpClient.js";

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
  if (name === "click") return action.x != null && action.y != null ? mouse(cdp, { ...action, mouseAction: "click" }, "click") : click(cdp, action.selector);
  if (name === "keyboard" || name === "keydown" || name === "keyDown" || name === "keyup" || name === "keyUp" || name === "keypress") return keyboard(cdp, action, name);
  if (name === "mouse" || name === "hover" || name === "wheel") return mouse(cdp, action, name);
  if (name === "type" || name === "fill") return typeInto(cdp, action.selector, action.text || action.value || "", name === "fill");
  if (name === "evaluate" || name === "eval") return evaluatePage(cdp, String(action.expression || action.script || "undefined"));
  if (name === "scroll") return scrollPage(cdp, action);
  throw new Error(`Unsupported browser action: ${name}`);
}

function subOf(step, verb) {
  const explicit = step.keyboardAction || step.mouseAction || step.subaction || step.method || step.keyAction;
  if (explicit) return String(explicit).toLowerCase();
  const lower = String(verb || "").toLowerCase();
  if (lower === "keydown" || lower === "keyup" || lower === "keypress") return lower;
  if (lower === "hover" || lower === "wheel") return lower === "wheel" ? "scroll" : lower;
  return null;
}

function keyParams(step = {}) {
  return {
    key: String(step.key ?? step.value ?? step.text ?? ""),
    code: String(step.code ?? ""),
    text: step.text ?? "",
    modifiers: step.modifiers ?? step.modifier ?? 0
  };
}

/** @param {object} cdp CDP client. @param {object} step Action step. @param {string} verb Original verb. */
async function keyboard(cdp, step = {}, verb = "keyboard") {
  const sub = subOf(step, verb) || (step.text != null && step.key == null ? "type" : "press");
  const { key, code, text, modifiers } = keyParams(step);
  if (step.selector) await evaluatePage(cdp, `(() => { const el = document.querySelector(${JSON.stringify(step.selector)}); if (el && el.focus) el.focus(); return true; })()`);
  if (sub === "keydown" || sub === "down") {
    const printable = text || (key.length === 1 ? key : "");
    return dispatchKeyEvent(cdp, { type: "keyDown", key, code, text: printable, modifiers });
  }
  if (sub === "keyup" || sub === "up") return dispatchKeyEvent(cdp, { type: "keyUp", key, code, modifiers });
  if (sub === "keypress") return dispatchKeyEvent(cdp, { type: "char", key, code, text: text || key, modifiers });
  if (sub === "type") {
    const str = String(step.text ?? step.value ?? key);
    const out = [];
    for (const ch of str) {
      await dispatchKeyEvent(cdp, { type: "keyDown", key: ch, code: "Key" + ch.toUpperCase(), text: ch, modifiers });
      await dispatchKeyEvent(cdp, { type: "keyUp", key: ch, code: "Key" + ch.toUpperCase(), modifiers });
      out.push(ch);
    }
    return { typed: out.join("") };
  }
  // press: full keyDown (+keypress for printable) + keyUp
  const printable = text || (key.length === 1 ? key : "");
  await dispatchKeyEvent(cdp, { type: "keyDown", key, code, text: printable, modifiers });
  return dispatchKeyEvent(cdp, { type: "keyUp", key, code, modifiers });
}

/** @param {object} cdp CDP client. @param {object} step Action step. @param {string} verb Original verb. */
async function mouse(cdp, step = {}, verb = "mouse") {
  const sub = subOf(step, verb) || (step.selector && (step.x == null && step.y == null) ? "click" : "move");
  const button = step.button || "left";
  const modifiers = step.modifiers ?? step.modifier ?? 0;
  const point = async () => {
    if (step.x != null && step.y != null) return { x: Number(step.x), y: Number(step.y) };
    return elementCenter(cdp, step.selector);
  };
  if (sub === "move" || sub === "hover") {
    const { x, y } = await point();
    return dispatchMouseEvent(cdp, { type: "mouseMoved", x, y, modifiers });
  }
  if (sub === "down") {
    const { x, y } = await point();
    return dispatchMouseEvent(cdp, { type: "mousePressed", x, y, button, clickCount: 1, modifiers });
  }
  if (sub === "up") {
    const { x, y } = await point();
    return dispatchMouseEvent(cdp, { type: "mouseReleased", x, y, button, clickCount: 1, modifiers });
  }
  if (sub === "scroll") {
    const x = Number(step.x || 0), y = Number(step.y || 0);
    return dispatchMouseEvent(cdp, { type: "mouseWheel", x, y, deltaX: Number(step.deltaX || 0), deltaY: Number(step.deltaY || 0), modifiers });
  }
  if (sub === "doubleclick" || sub === "dblclick") {
    const { x, y } = await point();
    await dispatchMouseEvent(cdp, { type: "mousePressed", x, y, button, clickCount: 1, modifiers });
    await dispatchMouseEvent(cdp, { type: "mouseReleased", x, y, button, clickCount: 1, modifiers });
    await dispatchMouseEvent(cdp, { type: "mousePressed", x, y, button, clickCount: 2, modifiers });
    return dispatchMouseEvent(cdp, { type: "mouseReleased", x, y, button, clickCount: 2, modifiers });
  }
  // click: mousePressed + mouseReleased produces mousedown/mouseup/click
  const { x, y } = await point();
  await dispatchMouseEvent(cdp, { type: "mousePressed", x, y, button, clickCount: 1, modifiers });
  return dispatchMouseEvent(cdp, { type: "mouseReleased", x, y, button, clickCount: 1, modifiers });
}

/** @param {object} cdp CDP client. @param {object} step Action step. */
async function scrollPage(cdp, step = {}) {
  if (step.deltaX != null || step.deltaY != null) {
    return dispatchMouseEvent(cdp, { type: "mouseWheel", x: Number(step.x || 0), y: Number(step.y || 0), deltaX: Number(step.deltaX || 0), deltaY: Number(step.deltaY || 0), modifiers: step.modifiers ?? 0 });
  }
  return evaluatePage(cdp, `window.scrollTo(${Number(step.x || 0)}, ${Number(step.y || 0)}); true`);
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
