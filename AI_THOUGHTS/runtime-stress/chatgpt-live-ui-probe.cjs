// B"H
const { chromeNavigate, chromeEval } = require('../../geelooy/apps/tunnel/agent/tools/chrome/actions.js');
(async () => {
  await chromeNavigate({ port: 9223, url: 'https://chatgpt.com/', timeoutMs: 30000, snapshot: false });
  const expression = `(() => {
    const promptSelectors = ['textarea[data-id="root"]','textarea[placeholder]','div[contenteditable="true"][role="textbox"]','div[contenteditable="true"]','#prompt-textarea'];
    const sendSelectors = ['button[data-testid="send-button"]','button[aria-label*="Send"]'];
    const prompt = promptSelectors.map(s => [s, !!document.querySelector(s)]);
    const send = sendSelectors.map(s => [s, !!document.querySelector(s)]);
    const assistantCount = document.querySelectorAll('[data-message-author-role="assistant"], .markdown.prose, main article').length;
    return { href: location.href, title: document.title, prompt, send, assistantCount, bodyText: document.body.innerText.slice(0, 1200) };
  })()`;
  const r = await chromeEval({ port: 9223, expression, timeoutMs: 10000 });
  console.log(JSON.stringify(r.result.result.value, null, 2));
  process.exit(0);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
