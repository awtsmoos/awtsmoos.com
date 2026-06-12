// B"H
const { chromeEval } = require('../../geelooy/apps/tunnel/agent/tools/chrome/actions.js');
(async () => {
  const expression = `(() => {
    const interesting = Array.from(document.querySelectorAll('[data-message-author-role], [data-message-id], article, main [role], main div')).map((n,i)=>({i, tag:n.tagName, role:n.getAttribute('role'), author:n.getAttribute('data-message-author-role'), id:n.getAttribute('data-message-id'), cls:String(n.className||'').slice(0,120), text:(n.innerText||n.textContent||'').trim().slice(0,500)})).filter(x=>x.text || x.author || x.id).slice(-80);
    return {href: location.href, title: document.title, mainText: (document.querySelector('main')?.innerText || '').slice(0,5000), interesting};
  })()`;
  const r = await chromeEval({ port: 9223, expression, timeoutMs: 10000 });
  console.log(JSON.stringify(r.result.result.value, null, 2));
  process.exit(0);
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
