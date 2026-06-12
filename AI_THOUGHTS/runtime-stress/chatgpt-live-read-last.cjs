// B"H
const { chromeEval } = require('../../geelooy/apps/tunnel/agent/tools/chrome/actions.js');
(async () => {
  const expression = `(() => {
    const sel = '[data-message-author-role="assistant"], .markdown.prose, main article';
    const nodes = Array.from(document.querySelectorAll(sel));
    const texts = nodes.map(n => (n.innerText || n.textContent || '').trim()).filter(Boolean);
    return { href: location.href, title: document.title, count: texts.length, last: texts[texts.length - 1] || '', all: texts.slice(-5), busy: !!document.querySelector('[aria-label*="Stop"], button[data-testid="stop-button"]'), body: document.body.innerText.slice(-3000) };
  })()`;
  const r = await chromeEval({ port: 9223, expression, timeoutMs: 10000 });
  console.log(JSON.stringify(r.result.result.value, null, 2));
  process.exit(0);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
