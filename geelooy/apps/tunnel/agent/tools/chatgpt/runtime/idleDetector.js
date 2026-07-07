// B"H
const { chromeEval } = require("../../chrome/actions.js");
const { ASSISTANT_SELECTORS, PROMPT_SELECTORS, SEND_SELECTORS } = require("./selectors.js");

/**
 * B"H
 * Chapter 1972: The watcher returned to the living palace.
 * Separate child CDP connections can fail to attach to the already-controlled
 * ChatGPT tab. Inside the native agent, the shared Chrome channel is fast;
 * it is still guarded by a real deadline so it cannot imprison the hourLoop.
 */
async function readIdleState(payload = {}) {
  const port = Number(payload.port || payload.chromePort || 9223);
  const hardMs = Math.max(1000, Math.min(Number(payload.evalTimeoutMs || 10000), 30000));
  const work = chromeEval({ port, expression: idleScript(), timeoutMs: hardMs, maxLogs: 5, maxValueChars: 16000 });
  const got = await withDeadline(work, hardMs + 500, "idle_eval_hard_timeout");
  if (got?.ok === false) return idleFallback("chrome_eval_failed", got.error || "unknown");
  return got.result?.result?.value || got.result?.value || idleFallback("empty_eval");
}
async function waitUntilIdle(payload = {}) {
  const timeoutMs = Number(payload.timeoutMs || 180000), settleMs = Number(payload.settleMs || 2500), pollMs = Number(payload.pollMs || 1000);
  const start = Date.now(); let lastText = "", lastChange = Date.now(), last = idleFallback("not_started");
  while (Date.now() - start < timeoutMs) {
    last = await readIdleState(payload).catch(error => idleFallback("eval_error", error.message));
    if (last.text && last.text !== lastText) { lastText = last.text; lastChange = Date.now(); }
    const stableMs = Date.now() - lastChange;
    if (last.idle && stableMs >= settleMs) return { ok:true, action:"chatgptIdle", idle:true, text:lastText, durationMs:Date.now() - start, stableMs, state:last };
    await new Promise(resolve => setTimeout(resolve, pollMs));
  }
  return { ok:false, action:"chatgptIdle", idle:false, error:"idle_timeout", text:lastText, durationMs:Date.now() - start, state:last };
}
function withDeadline(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(label + " after " + ms + "ms")), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
function idleScript() {
  return `(() => {
    const assistantSelectors = ${JSON.stringify(ASSISTANT_SELECTORS)};
    const promptSelectors = ${JSON.stringify(PROMPT_SELECTORS)};
    const sendSelectors = ${JSON.stringify(SEND_SELECTORS)};
    const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
    const label = el => String(el?.innerText || el?.getAttribute('aria-label') || el?.getAttribute('data-testid') || '').trim();
    const active = el => visible(el) && !el.disabled && el.getAttribute('aria-disabled') !== 'true';
    const nodes = [...new Set(assistantSelectors.flatMap(s => [...document.querySelectorAll(s)]))];
    const texts = nodes.map(n => (n.innerText || n.textContent || '').trim()).filter(Boolean);
    const prompt = promptSelectors.map(s => document.querySelector(s)).find(visible) || null;
    const send = sendSelectors.map(s => document.querySelector(s)).find(visible) || null;
    const buttons = [...document.querySelectorAll('button')].filter(active);
    const stop = buttons.find(b => /^(stop|stop generating|interrupt)$/i.test(label(b)) || /^stop-button$/i.test(b.getAttribute('data-testid') || '')) || null;
    const streaming = [...document.querySelectorAll('[aria-busy="true"], [data-testid*="spinner"], [class*="result-streaming"]')].some(visible);
    const busy = !!stop || streaming;
    const sendDisabled = !!send && (send.disabled || send.getAttribute('aria-disabled') === 'true');
    const idle = !busy && !!prompt;
    return { idle, busy, busyReason: busy ? (stop ? 'active_stop_button' : 'streaming_indicator') : '', promptFound: !!prompt, sendFound: !!send, sendDisabled, stopLabel: stop ? label(stop) : '', text: texts[texts.length - 1] || '', assistantCount: texts.length, href: location.href, title: document.title, shells: document.querySelectorAll('.awtsmoos-tunnel-pruned-shell').length, domNodes: document.querySelectorAll('*').length };
  })()`;
}
function idleFallback(reason, error = "") { return { idle:false, busy:true, busyReason:reason, error, text:"", assistantCount:0 }; }
module.exports = { idleScript, readIdleState, waitUntilIdle, withDeadline };
