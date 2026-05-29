// B"H
import { normalizeBrowserActions } from "./actionSchema.js";

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

/**
 * B"H
 * Chapter 35: The checkbox finally thundered with change.
 *
 * Real browsers fire more than click when form state changes. The Merkava page
 * now emits input/change for check, uncheck, clear, fill, and select so scripts
 * observing form state receive the same lightning they expected.
 */
export class VirtualPage {
  constructor(runtime) { this.runtime = runtime; this.window = runtime?.window; this.document = this.window?.document; }
  element(selector) { const el = this.document?.querySelector(selector); if (!el) throw new Error(`Missing selector: ${selector}`); return el; }
  async goto(url) { this.window.location = new URL(url, this.window.location?.href || "http://127.0.0.1/"); return this.window.location.href; }
  async click(selector) { return this.window.interactions.click(selector); }
  async doubleClick(selector) { await this.click(selector); await this.click(selector); return true; }
  async hover(selector) { return this.window.mouse.moveTo(selector); }
  async focus(selector) { this.element(selector).focus?.(); return true; }
  async blur(selector) { this.element(selector).blur?.(); return true; }
  async clear(selector) { const el = this.element(selector); el.value = ""; this.emitInput(el, ""); return el.value; }
  async fill(selector, text) { await this.clear(selector); return this.type(selector, text); }
  async type(selector, text) { return this.window.interactions.type(selector, String(text ?? "")); }
  async press(selector, key) { return this.window.interactions.key(selector, String(key ?? "")); }
  async check(selector) { const el = this.element(selector); if (!el.checked) { el.click(); this.emitInput(el, true); } return el.checked; }
  async uncheck(selector) { const el = this.element(selector); if (el.checked) { el.click(); this.emitInput(el, false); } return el.checked; }
  async selectOption(selector, value) { const el = this.element(selector); el.value = String(value ?? ""); this.emitInput(el, el.value); return el.value; }
  async wait(ms = 0) { await new Promise(resolve => setTimeout(resolve, Number(ms || 0))); return true; }

  async waitForSelector(selector, timeoutMs = 0) {
    const end = Date.now() + Number(timeoutMs || 0);
    do { if (this.document?.querySelector(selector)) return true; await this.wait(10); } while (Date.now() < end);
    throw new Error(`Timeout waiting for selector: ${selector}`);
  }

  async waitForFunction(source, timeoutMs = 0) {
    const end = Date.now() + Number(timeoutMs || 0);
    do { if (await this.evaluate(source)) return true; await this.wait(10); } while (Date.now() < end);
    throw new Error(`Timeout waiting for function: ${source}`);
  }

  async assertText(selector, expected) { return this.window.interactions.assertText(selector, expected); }
  async assertExists(selector) { return this.window.interactions.assertExists(selector); }
  async assertValue(selector, expected) { const got = this.element(selector).value; if (String(got) !== String(expected)) throw new Error(`Value mismatch: ${got}`); return true; }
  async assertChecked(selector, expected = true) { const got = !!this.element(selector).checked; if (got !== Boolean(expected)) throw new Error(`Checked mismatch: ${got}`); return true; }
  async assertUrl(expected) { const got = this.window.location.href; if (!String(got).includes(String(expected))) throw new Error(`URL mismatch: ${got}`); return true; }
  async assertEval(source, expected = true) { const got = await this.evaluate(source); if (String(got) !== String(expected)) throw new Error(`Eval mismatch: ${got}`); return true; }

  async evaluate(source, args = {}) {
    const fn = AsyncFunction("window", "document", "args", `with(window){ return (${source}); }`);
    return await fn(this.window, this.document, args);
  }

  async screenshot() { return this.snapshot(); }
  snapshot() { return this.runtime?.snapshot?.() || null; }
  emitInput(el, data) { el.dispatchEvent(new this.window.InputEvent("input", { bubbles: true, data: String(data ?? "") })); el.dispatchEvent(new this.window.Event("change", { bubbles: true })); }
  async run(rawActions = []) { const log = []; for (const step of normalizeBrowserActions(rawActions)) log.push(await this.runOne(step)); return log; }

  async runOne(step) {
    const startedAt = Date.now();
    try { return { id: step.id, action: step.action, ok: true, value: await this.dispatch(step), durationMs: Date.now() - startedAt }; }
    catch (error) { return { id: step.id, action: step.action, ok: false, error: error.message, stack: error.stack || "", durationMs: Date.now() - startedAt }; }
  }

  async dispatch(step) {
    const args = step.args || [], method = this[step.action];
    if (typeof method !== "function") throw new Error(`Unsupported browser action: ${step.action}`);
    if (step.action === "goto") return await method.call(this, step.url || step.href || args[0]);
    if (step.action === "wait") return await method.call(this, step.ms || step.timeoutMs || args[0]);
    if (step.action === "assertUrl") return await method.call(this, step.expected ?? step.url ?? args[0]);
    if (step.action === "waitForSelector") return await method.call(this, step.selector || args[0], step.timeoutMs || args[1]);
    if (step.action === "waitForFunction") return await method.call(this, step.source || step.expression || step.code, step.timeoutMs || args[1]);
    if (step.action === "evaluate") return await method.call(this, step.source || step.expression || step.code, step.args || step.arg || {});
    if (step.action === "assertEval") return await method.call(this, step.source || step.expression || step.code, step.expected ?? args[1]);
    return await method.call(this, step.selector || args[0], step.text ?? step.value ?? step.key ?? step.expected ?? args[1]);
  }
}
