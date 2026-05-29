// B"H
import { normalizeBrowserActions } from './actionSchema.js';

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

/**
 * B"H
 * VirtualPage is the Puppeteer-facing chariot. Every public action returns
 * concrete evidence: values, handles, screenshots/snapshots, or exact errors.
 * No Chromium is invoked; all behavior rides Merkava's synthetic DOM runtime.
 */
export class VirtualPage {
  constructor(runtime) {
    this.runtime = runtime;
    this.window = runtime?.window;
    this.document = this.window?.document;
    this.keyboard = this.window?.keyboard;
    this.mouse = this.window?.mouse;
  }

  element(selector) { const el = this.document?.querySelector(selector); if (!el) throw new Error(`Missing selector: ${selector}`); return el; }
  handle(el, selector = null) { return el ? { kind: 'ElementHandle', selector, nodeId: el.__nodeId, tagName: el.tagName, id: el.id, className: el.className, textContent: el.textContent, value: el.value, checked: !!el.checked, attributes: { ...el.attributes } } : null; }
  async $(selector) { return this.handle(this.document?.querySelector(selector), selector); }
  async $$(selector) { return Array.from(this.document?.querySelectorAll(selector) || []).map(el => this.handle(el, selector)); }
  locator(selector) { return { kind: 'Locator', selector, element: this.handle(this.document?.querySelector(selector), selector) }; }
  async goto(url) { this.window.location = new URL(url, this.window.location?.href || 'http://127.0.0.1/'); return this.window.location.href; }
  async reload() { return this.window.location.href; }
  async url() { return this.window.location.href; }
  async title() { return this.document.title || this.document.querySelector('title')?.textContent || ''; }
  async content() { return '<!DOCTYPE html>' + this.document.documentElement.outerHTML; }
  async setContent(html = '') { this.document.body.innerHTML = String(html || ''); const title = String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i); if (title) this.document.title = title[1]; return await this.content(); }
  async click(selector) { return this.window.interactions.click(selector); }
  async doubleClick(selector) { await this.click(selector); await this.click(selector); return true; }
  async hover(selector) { return this.window.mouse.moveTo(selector); }
  async focus(selector) { this.element(selector).focus?.(); return true; }
  async blur(selector) { this.element(selector).blur?.(); return true; }
  async clear(selector) { const el = this.element(selector); el.value = ''; this.emitInput(el, ''); return el.value; }
  async fill(selector, text) { await this.clear(selector); return this.type(selector, text); }
  async type(selector, text) { return this.window.interactions.type(selector, String(text ?? '')); }
  async press(selector, key) { return this.window.interactions.key(selector, String(key ?? '')); }
  async check(selector) { const el = this.element(selector); if (!el.checked) { el.click(); this.emitInput(el, true); } return el.checked; }
  async uncheck(selector) { const el = this.element(selector); if (el.checked) { el.click(); this.emitInput(el, false); } return el.checked; }
  async selectOption(selector, value) { const el = this.element(selector); el.value = String(value ?? ''); for (const option of el.querySelectorAll('option')) option.selected = option.value === el.value || option.getAttribute('value') === el.value; this.emitInput(el, el.value); return el.value; }
  async wait(ms = 0) { await new Promise(resolve => setTimeout(resolve, Number(ms || 0))); return true; }

  async keyboardAction(step = {}) {
    const op = step.keyboardAction || step.subaction || step.method || step.keyAction || (step.text != null ? 'type' : 'press');
    if (op === 'type') { this.keyboard.type(String(step.text ?? step.value ?? '')); return this.window.keyboard.toJSON(); }
    if (op === 'down') { this.keyboard.down(String(step.key ?? step.value ?? '')); return this.window.keyboard.toJSON(); }
    if (op === 'up') { this.keyboard.up(String(step.key ?? step.value ?? '')); return this.window.keyboard.toJSON(); }
    this.keyboard.press(String(step.key ?? step.value ?? step.text ?? ''));
    return this.window.keyboard.toJSON();
  }

  async mouseAction(step = {}) {
    const op = step.mouseAction || step.subaction || step.method || (step.selector ? 'click' : 'move');
    if (op === 'move') { this.mouse.move(Number(step.x || 0), Number(step.y || 0)); return this.window.mouse.toJSON(); }
    if (op === 'down') { this.mouse.down(); return this.window.mouse.toJSON(); }
    if (op === 'up') { this.mouse.up(); return this.window.mouse.toJSON(); }
    if (op === 'hover') { this.mouse.moveTo(step.selector); return this.window.mouse.toJSON(); }
    this.mouse.click(step.selector); return this.window.mouse.toJSON();
  }

  async waitForSelector(selector, timeoutMs = 0) {
    const end = Date.now() + Number(timeoutMs || 0);
    do { if (this.document?.querySelector(selector)) return this.handle(this.document.querySelector(selector), selector); await this.wait(10); } while (Date.now() < end);
    throw new Error(`Timeout waiting for selector: ${selector}`);
  }
  async waitForFunction(source, timeoutMs = 0) {
    const end = Date.now() + Number(timeoutMs || 0);
    do { if (await this.evaluate(source)) return true; await this.wait(10); } while (Date.now() < end);
    throw new Error(`Timeout waiting for function: ${source}`);
  }

  async assertText(selector, expected) { const got = this.element(selector).textContent; if (!String(got).includes(String(expected))) throw new Error(`Text mismatch: ${got}`); return { got, expected }; }
  async assertExists(selector) { return this.handle(this.element(selector), selector); }
  async assertValue(selector, expected) { const got = this.element(selector).value; if (String(got) !== String(expected)) throw new Error(`Value mismatch: ${got}`); return { got, expected }; }
  async assertChecked(selector, expected = true) { const got = !!this.element(selector).checked; if (got !== Boolean(expected)) throw new Error(`Checked mismatch: ${got}`); return { got, expected: Boolean(expected) }; }
  async assertUrl(expected) { const got = this.window.location.href; if (!String(got).includes(String(expected))) throw new Error(`URL mismatch: ${got}`); return { got, expected }; }
  async assertEval(source, expected = true) { const got = await this.evaluate(source); if (String(got) !== String(expected)) throw new Error(`Eval mismatch: ${got}`); return { got, expected }; }
  async evaluate(source, args = {}) { const fn = AsyncFunction('window', 'document', 'args', `with(window){ return (${source}); }`); return await fn(this.window, this.document, args); }
  async screenshot() { return this.snapshot(); }
  snapshot() { return this.runtime?.snapshot?.() || null; }
  emitInput(el, data) { el.dispatchEvent(new this.window.InputEvent('input', { bubbles: true, data: String(data ?? '') })); el.dispatchEvent(new this.window.Event('change', { bubbles: true })); }

  async run(rawActions = []) { const log = []; for (const step of normalizeBrowserActions(rawActions)) log.push(await this.runOne(step)); return log; }
  async runOne(step) { const startedAt = Date.now(); try { return { id: step.id, action: step.action, ok: true, continueOnError: step.continueOnError === true, value: await this.dispatch(step), durationMs: Date.now() - startedAt }; } catch (error) { return { id: step.id, action: step.action, ok: false, continueOnError: step.continueOnError === true, error: error.message, stack: error.stack || '', durationMs: Date.now() - startedAt }; } }

  async dispatch(step) {
    const args = step.args || [];
    if (['content', 'title', 'url', 'reload', 'screenshot', 'snapshot'].includes(step.action)) return await this[step.action]();
    if (step.action === 'keyboard') return await this.keyboardAction(step);
    if (step.action === 'mouse') return await this.mouseAction(step);
    const method = this[step.action];
    if (typeof method !== 'function') throw new Error(`Unsupported browser action: ${step.action}`);
    if (step.action === 'goto') return await method.call(this, step.url || step.href || args[0]);
    if (step.action === 'setContent') return await method.call(this, step.html ?? step.content ?? args[0]);
    if (step.action === 'wait') return await method.call(this, step.ms || step.timeoutMs || args[0]);
    if (step.action === 'assertUrl') return await method.call(this, step.expected ?? step.url ?? args[0]);
    if (step.action === 'waitForSelector') return await method.call(this, step.selector || args[0], step.timeoutMs || args[1]);
    if (step.action === 'waitForFunction') return await method.call(this, step.source || step.expression || step.code, step.timeoutMs || args[1]);
    if (step.action === 'evaluate') return await method.call(this, step.source || step.expression || step.code, step.args || step.arg || {});
    if (step.action === 'assertEval') return await method.call(this, step.source || step.expression || step.code, step.expected ?? args[1]);
    if (step.action === '$' || step.action === '$$' || step.action === 'locator') return await method.call(this, step.selector || args[0]);
    return await method.call(this, step.selector || args[0], step.text ?? step.value ?? step.key ?? step.expected ?? args[1]);
  }
}
