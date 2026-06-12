// B"H
const { sendPrompt } = require('../../geelooy/apps/tunnel/agent/tools/chatgpt/runtime/sendPrompt.js');
(async () => {
  const result = await sendPrompt({ port: 9223, message: 'B"H. Visible editor send test. Reply exactly: VISIBLE SEND OK', timeoutMs: 30000 });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 2);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
