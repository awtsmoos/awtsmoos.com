// B"H
const { chromeEval } = require('../../geelooy/apps/tunnel/agent/tools/chrome/actions.js');
(async () => {
  const expression = `(() => {
    const ta = document.querySelector('textarea[placeholder], #prompt-textarea');
    const btn = document.querySelector('button[data-testid="send-button"], button[aria-label*="Send"]');
    const form = ta && ta.closest('form');
    function brief(el){ if(!el) return null; return {tag:el.tagName,id:el.id,cls:el.className,role:el.getAttribute('role'),aria:el.getAttribute('aria-label'),testid:el.getAttribute('data-testid'),type:el.getAttribute('type'),disabled:el.disabled,html:el.outerHTML.slice(0,1200)}; }
    return { textarea: brief(ta), button: brief(btn), form: brief(form), formText: form ? form.innerText.slice(0,1000) : '', active: brief(document.activeElement) };
  })()`;
  const r = await chromeEval({ port: 9223, expression, timeoutMs: 10000 });
  console.log(JSON.stringify(r.result.result.value, null, 2));
  process.exit(0);
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
