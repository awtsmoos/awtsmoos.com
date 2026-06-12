// B"H
const { chromeNavigate, chromeEval } = require('../../geelooy/apps/tunnel/agent/tools/chrome/actions.js');
(async () => {
  await chromeNavigate({ port: 9223, url: 'https://chatgpt.com/', timeoutMs: 30000, snapshot: false });
  const r = await chromeEval({ port: 9223, expression: "location.href + ' | ' + document.title", timeoutMs: 10000 });
  console.log(JSON.stringify(r.result, null, 2));
  process.exit(0);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
