// B"H
const { chatgptMessage } = require('../../geelooy/apps/tunnel/agent/tools/chatgpt/actions/message.js');
(async () => {
  const result = await chatgptMessage({
    profile: 'default',
    port: 9223,
    message: 'B"H. Awtsmoos full message test. Reply exactly: FULL MESSAGE OK',
    timeoutMs: 120000,
    settleMs: 2500,
    pollMs: 1000
  });
  console.log(JSON.stringify({ ok: result.ok, action: result.action, text: result.text, conversation: result.conversation, responseOk: result.response && result.response.ok, sent: result.sent }, null, 2));
  process.exit(result.ok && /FULL MESSAGE OK/i.test(result.text || '') ? 0 : 2);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
