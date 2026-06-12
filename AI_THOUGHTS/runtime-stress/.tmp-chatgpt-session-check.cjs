// B"H
const { sessionCheck } = require('../../geelooy/apps/tunnel/agent/tools/chatgpt/auth/sessionCheck.js');
(async () => {
  const r = await sessionCheck({ port: 9223, timeoutMs: 30000 });
  console.log(JSON.stringify(r, null, 2));
  process.exit(0);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
