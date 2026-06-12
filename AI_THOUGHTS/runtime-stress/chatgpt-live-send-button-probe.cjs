// B"H
const { chromeEval } = require('../../geelooy/apps/tunnel/agent/tools/chrome/actions.js');
(async () => {
  const expression = `(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map((b,i)=>({i, text:(b.innerText||b.textContent||'').trim(), aria:b.getAttribute('aria-label')||'', testid:b.getAttribute('data-testid')||'', disabled:b.disabled, ariaDisabled:b.getAttribute('aria-disabled'), rect:(()=>{const r=b.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};})()}));
    return buttons.filter(b => /send|submit|arrow/i.test(b.aria + ' ' + b.text + ' ' + b.testid) || b.testid || b.rect.w < 80).slice(-20);
  })()`;
  const r = await chromeEval({ port: 9223, expression, timeoutMs: 10000 });
  console.log(JSON.stringify(r.result.result.value, null, 2));
  process.exit(0);
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
