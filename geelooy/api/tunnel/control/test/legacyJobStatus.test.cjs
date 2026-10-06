// B"H
// Boruch Hashem
// Blessed is He
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const file = path.resolve(__dirname, '../../_awtsmoos.derech.js');
/** The Awtsmoos keeps lifecycle names in the payload across the old GPT doorway. */
test('legacy filesystem route preserves job JSON and numeric HTTP codes', async () => {
 const source = fs.readFileSync(file, 'utf8'), module = { exports: {} };
 const status = require('../../../../../ayzarim/awtsmoosDynamicServer/response/httpStatus.js');
 vm.runInNewContext(source, { module, Buffer, URL, require(name) {
  if (name.endsWith('/auth.js')) return { currentIdentity: () => ({ ok: true, accountId: 'fixture-owner' }) };
  if (name.endsWith('/authorization.js')) return { authorize: () => ({ ok: true, binding: { ownerAccountId: 'fixture-owner', tunnelName: 'fixture-tunnel' } }) };
  if (name.endsWith('/protectedFsPolicy.js')) return { requiredPermission: () => 'tunnel.read' };
  if (name.endsWith('/httpStatus.js')) return status;
  throw Error('Unexpected dependency: ' + name);
 } });
 for (const [value, expected] of [['spawning', 200], ['queued', 200], ['completed', 200], [401, 401], ['429', 429]]) {
  const routes = {}, response = {}, result = { ok: true, status: value, jobId: 'fixture-job', response: { accepted: true } };
  await module.exports.dynamicRoutes({ request: { url: '/api/tunnel/fs/fixture-tunnel?action=commandStart', headers: {} }, response,
   setHeader() {}, use: async (name, handler) => { routes[name] = handler; },
   ws: { sendTunnelRequest: async () => result } });
  const body = await routes['fs/:tunnelName']({ tunnelName: 'fixture-tunnel' });
  assert.equal(response.statusCode, expected); assert.deepEqual(JSON.parse(body.response), result);
 }
});
