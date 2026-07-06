// B"H
const { chromeEval } = require("../../chrome/actions.js");
const { ASSISTANT_SELECTORS, PROMPT_SELECTORS, SEND_SELECTORS } = require("./selectors.js");

async function readIdleState(payload = {}) {
  const port = Number(payload.port || payload.chromePort || 9223);
  const got = await chromeEval({ port, expression: idleScript(), timeoutMs: payload.evalTimeoutMs || 10000, maxLogs: 20, maxValueChars: 16000 });
  return got.result?.result?.value || got.result?.value || idleFallback("empty_eval");
}

async function waitUntilIdle(payload = {}) {
  const timeoutMs = Number(payload.timeoutMs || 180000), settleMs = Number(payload.settleMs || 2500), pollMs = Number(payload.pollMs || 1000);
  const start = Date.now(); let lastText = "", lastChange = Date.now(), last = idleFallback("not_started");
  while (Date.now() - start < timeoutMs) {
    last = await readIdleState(payload).catch(error => idleFallback("eval_error", error.message));
    if (last.text && last.text !== lastText) { lastText = last.text; lastChange = Date.now(); }
    const stableMs = Date.now() - lastChange;
    if (last.idle && lastText && stableMs >= settleMs) return { ok:true, action:"chatgptIdle", idle:true, text:lastText, durationMs:Date.now() - start, stableMs, state:last };
    await new Promise(resolve => setTimeout(resolve, pollMs));
  }
  return { ok:false, action:"chatgptIdle", idle:false, error:"idle_timeout", text:lastText, durationMs:Date.now() - start, state:last };
}

function idleScript() {
  return `(() => {
    const assistantSelectors = ${JSON.stringify(ASSISTANT_SELECTORS)};
    const promptSelectors = ${JSON.stringify(PROMPT_SELECTORS)};
    const sendSelectors = ${JSON.stringify(SEND_SELECTORS)};
    const visible = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
    const nodes = [...new Set(assistantSelectors.flatMap(s => [...document.querySelectorAll(s)]))];
    const texts = nodes.map(n => (n.innerText || n.textContent || '').trim()).filter(Boolean);
    const prompt = promptSelectors.map(s => document.querySelector(s)).find(visible) || null;
    const send = sendSelectors.map(s => document.querySelector(s)).find(visible) || null;
    const stop = document.querySelector('[aria-label*="Stop"], button[data-testid="stop-button"]');
    const busy = !!stop || !!document.querySelector('[aria-busy="true"], [data-testid*="spinner"], [class*="result-streaming"]');
    const sendDisabled = !!send && (send.disabled || send.getAttribute('aria-disabled') === 'true');
    const idle = !busy && !!prompt;
    return { idle, busy, busyReason: busy ? 'generating_or_stop_visible' : '', promptFound: !!prompt, sendFound: !!send, sendDisabled, text: texts[texts.length - 1] || '', assistantCount: texts.length, href: location.href, title: document.title, shells: document.querySelectorAll('.awtsmoos-tunnel-pruned-shell').length, domNodes: document.querySelectorAll('*').length };
  })()`;
}
function idleFallback(reason, error = "") { return { idle:false, busy:true, busyReason:reason, error, text:"", assistantCount:0 }; }

module.exports = { idleScript, readIdleState, waitUntilIdle };
