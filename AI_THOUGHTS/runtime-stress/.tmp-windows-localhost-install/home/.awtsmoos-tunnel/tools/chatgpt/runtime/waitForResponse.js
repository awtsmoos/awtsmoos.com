// B"H
const { chromeEval } = require("../../chrome/actions.js");
const { ASSISTANT_SELECTORS } = require("./selectors.js");

/**
 * B"H
 * Waits until assistant text stops changing. The stream is a river; this module
 * waits for the water to settle and then carries the last answer back.
 */
async function waitForResponse(payload = {}) {
  const port = Number(payload.port || payload.chromePort || 9223);
  const timeoutMs = Number(payload.timeoutMs || 180000);
  const settleMs = Number(payload.settleMs || 2500);
  const start = Date.now();
  let lastText = "";
  let lastChange = Date.now();
  while (Date.now() - start < timeoutMs) {
    const state = await readAssistantState(port, payload);
    if (state.text && state.text !== lastText) {
      lastText = state.text;
      lastChange = Date.now();
    }
    if (lastText && Date.now() - lastChange >= settleMs && !state.busy) {
      return { ok: true, action: "chatgptWaitForResponse", text: lastText, durationMs: Date.now() - start, state };
    }
    await new Promise(resolve => setTimeout(resolve, Number(payload.pollMs || 1000)));
  }
  return { ok: false, action: "chatgptWaitForResponse", error: "response_timeout", text: lastText, durationMs: Date.now() - start };
}

async function readAssistantState(port, payload = {}) {
  const expression = browserScript();
  const got = await chromeEval({ port, expression, timeoutMs: payload.evalTimeoutMs || 10000, maxLogs: 20 });
  return got.result?.result?.value || got.result?.value || { text: "", count: 0, busy: false };
}

function browserScript() {
  return `(() => {
    const selectors = ${JSON.stringify(ASSISTANT_SELECTORS)};
    const nodes = selectors.flatMap(s => Array.from(document.querySelectorAll(s)));
    const unique = Array.from(new Set(nodes));
    const texts = unique.map(n => (n.innerText || n.textContent || '').trim()).filter(Boolean);
    const busy = Boolean(document.querySelector('[aria-label*="Stop"], button[data-testid="stop-button"'));
    return { count: texts.length, text: texts[texts.length - 1] || '', busy, href: location.href, title: document.title };
  })()`;
}

module.exports = { waitForResponse, readAssistantState, browserScript };
