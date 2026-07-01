// B"H
const assert = require('assert');
const http = require('http');
const { buildPreviewActions } = require('../actionGroups/previewActions.js');
(async () => {
  const server = http.createServer((req, res) => res.end('<title>Local Test App</title><h1>B"H</h1>'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const payload = { action:'previewExposeLocalServer', port, timeoutMs:1000, tunnelName:'test-tunnel' };
  const out = await buildPreviewActions({ payload }).previewExposeLocalServer();
  server.close();
  assert.equal(out.ok, true);
  assert.equal(out.preview.policy.aiLocalServerPreviewAllowed, true);
  assert.equal(out.preview.localServerPreviewDefaultOn, true);
  assert.equal(out.selectedServer.port, port);
  assert.match(out.proxyUrl, /url64=/);
  assert.match(out.agentGuidance.plainEnglish, /local server/i);
  console.log(JSON.stringify({ ok:true, suite:'preview-local-server-default-on', port }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
