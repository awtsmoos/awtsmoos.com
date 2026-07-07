// B"H
const { chromeEval } = require("../../chrome/actions.js");
const { PROMPT_SELECTORS, SEND_SELECTORS } = require("./selectors.js");
const { optimizeDom } = require("./domOptimizer.js");

/**
 * B"H
 * Chapter 1974: The messenger now returns with proof in his hand.
 * A prompt send is not allowed to fail silently. The compact Chrome envelope is
 * unwrapped from every known shape, submitted is explicit, and every failure
 * carries a named reason instead of an empty shadow.
 */
async function sendPrompt(payload = {}) {
  const port = Number(payload.port || payload.chromePort || 9223);
  const message = String(payload.message || payload.prompt || payload.text || "");
  if (!message) return fail("missing_message", { port });
  const timeoutMs = clamp(payload.timeoutMs, 1000, 5000, 1500);
  const optimizer = payload.optimizeDom === false ? { skipped:true } : await withDeadline(optimizeDom({ ...payload, port }), 700, "optimizer_timeout").catch(error => ({ ok:false, skipped:true, error:error.message }));
  const expression = browserScript(message);
  const got = await withDeadline(chromeEval({ ...payload, port, expression, timeoutMs, maxLogs: 20, maxValueChars: 12000 }), timeoutMs + 750, "send_eval_timeout").catch(error => ({ ok:false, error:error.message }));
  const value = unwrapEvalValue(got);
  const submitted = !!value?.ok;
  const error = submitted ? "" : value?.error || got?.error || unwrapError(got) || "send_no_eval_value";
  return { ok: submitted, submitted, action: "chatgptSendPrompt", port, optimizer, result: value || null, proof: proofOf(got, value), error };
}
function fail(error, extra = {}) { return { ok:false, submitted:false, action:"chatgptSendPrompt", error, ...extra }; }
function unwrapEvalValue(got = {}) {
  return got?.result?.result?.valueSummary?.value || got?.result?.valueSummary?.value || got?.result?.result?.value || got?.result?.value || got?.valueSummary?.value || got?.value || null;
}
function unwrapError(got = {}) {
  return got?.result?.exceptionDetails?.text || got?.result?.exceptionDetails?.exception?.description || got?.exceptionDetails?.text || "";
}
function proofOf(got = {}, value = null) {
  return { chromeOk: got?.ok !== false, hasValue: !!value, valueOk: !!value?.ok, via: value?.via || "", href: value?.href || "", tag: value?.tag || "", valueLength: value?.valueLength || 0 };
}
function withDeadline(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(label + " after " + ms + "ms")), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
function clamp(value, min, max, fallback) {
  const n = Number(value || fallback);
  return Math.max(min, Math.min(Number.isFinite(n) ? Math.floor(n) : fallback, max));
}
function browserScript(message) {
  return `(() => {
    const promptSelectors = ${JSON.stringify(PROMPT_SELECTORS)};
    const sendSelectors = ${JSON.stringify(SEND_SELECTORS)};
    const text = ${JSON.stringify(message)};
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
    const findPrompt = () => promptSelectors.map(s => document.querySelector(s)).find(visible) || promptSelectors.map(s => document.querySelector(s)).find(Boolean);
    const findSend = () => sendSelectors.map(s => document.querySelector(s)).find(visible) || Array.from(document.querySelectorAll('button')).find(b => /send/i.test(b.getAttribute('aria-label') || b.textContent || ''));
    const setNativeValue = (el, value) => {
      if (el.isContentEditable) {
        el.focus(); document.execCommand('selectAll', false, null); document.execCommand('insertText', false, value);
        if ((el.innerText || '').trim() === '') { el.innerHTML = ''; const p = document.createElement('p'); p.textContent = value; el.appendChild(p); }
        return;
      }
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLInputElement ? HTMLInputElement.prototype : null;
      const desc = proto && Object.getOwnPropertyDescriptor(proto, 'value');
      if (desc && desc.set) desc.set.call(el, value); else if ('value' in el) el.value = value; else el.textContent = value;
    };
    const fireTextEvents = el => {
      el.dispatchEvent(new InputEvent('beforeinput', { bubbles:true, cancelable:true, inputType:'insertText', data:text }));
      el.dispatchEvent(new InputEvent('input', { bubbles:true, inputType:'insertText', data:text }));
      el.dispatchEvent(new Event('change', { bubbles:true }));
    };
    const clickLikeHuman = el => { for (const type of ['pointerdown','mousedown','pointerup','mouseup','click']) el.dispatchEvent(new MouseEvent(type, { bubbles:true, cancelable:true, view:window })); };
    return (async () => {
      const prompt = findPrompt();
      if (!prompt) return { ok:false, error:'prompt_not_found', title:document.title, href:location.href, promptSelectorCount:promptSelectors.length };
      prompt.scrollIntoView({ block:'center', inline:'center' }); prompt.focus(); setNativeValue(prompt, text); fireTextEvents(prompt); await sleep(250);
      const valueAfter = prompt.isContentEditable ? prompt.innerText : ('value' in prompt ? prompt.value : prompt.textContent);
      const button = findSend(); const form = prompt.closest('form') || button?.closest('form');
      if (button && !button.disabled && button.getAttribute('aria-disabled') !== 'true') { button.scrollIntoView({ block:'center', inline:'center' }); clickLikeHuman(button); button.click(); return { ok:true, via:'button', tag:prompt.tagName, valueLength:String(valueAfter || '').length, href:location.href }; }
      if (form && typeof form.requestSubmit === 'function') { form.requestSubmit(button || undefined); return { ok:true, via:'requestSubmit', tag:prompt.tagName, valueLength:String(valueAfter || '').length, href:location.href }; }
      prompt.dispatchEvent(new KeyboardEvent('keydown', { key:'Enter', code:'Enter', bubbles:true, cancelable:true })); prompt.dispatchEvent(new KeyboardEvent('keyup', { key:'Enter', code:'Enter', bubbles:true, cancelable:true }));
      return { ok:true, via:'enter', tag:prompt.tagName, valueLength:String(valueAfter || '').length, href:location.href };
    })();
  })()`;
}
module.exports = { sendPrompt, browserScript, unwrapEvalValue, unwrapError, proofOf, withDeadline, clamp };
