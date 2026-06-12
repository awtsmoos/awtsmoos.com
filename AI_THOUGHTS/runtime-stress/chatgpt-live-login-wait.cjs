// B"H
const { chatgptLogin } = require('../../geelooy/apps/tunnel/agent/tools/chatgpt/actions/login.js');
(async () => {
  const result = await chatgptLogin({ profile: 'default', port: 9223, wait: true, timeoutMs: 600000, pollMs: 1500 });
  console.log(JSON.stringify({ ok: result.ok, action: result.action, port: result.port, needsManualLogin: result.needsManualLogin, session: result.session, profile: result.profile && { name: result.profile.name, userDataDir: result.profile.userDataDir } }, null, 2));
  process.exit(result.session && result.session.authenticated ? 0 : 2);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
