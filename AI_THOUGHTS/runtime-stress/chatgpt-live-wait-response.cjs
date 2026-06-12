// B"H
const { waitForResponse } = require('../../geelooy/apps/tunnel/agent/tools/chatgpt/runtime/waitForResponse.js');
(async () => {
  const result = await waitForResponse({ port: 9223, timeoutMs: 120000, settleMs: 2500, pollMs: 1000 });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok && /SEND ONLY OK/i.test(result.text || '') ? 0 : 2);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
