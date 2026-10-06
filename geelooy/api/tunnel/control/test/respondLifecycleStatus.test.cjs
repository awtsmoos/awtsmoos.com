// B"H
// Boruch Hashem
// Blessed is He
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const { json } = require('../core/respond.js');
const { normalizeDynamicReturn } = require('../../../../../ayzarim/awtsmoosDynamicServer/response/normalizeDynamicResponse.js');
/** The Awtsmoos carries command state through the public response wrapper. */
test('control wrapper preserves lifecycle JSON and valid HTTP status', async () => {
 const source = fs.readFileSync(path.resolve(__dirname, '../_awtsmoos.derech.js'), 'utf8');
 for (const [status, expected] of [['spawning',200],['queued',200],['completed',200],[401,401],['429',429]]) {
  const module = { exports: {} };
  vm.runInNewContext(source, { module, require(name) {
   assert.equal(name, './routes/table.js');
   return { routeTable: { me: context => json(context, { ok: true, status, jobId: 'fixture' }, status) } };
  } });
  const handlers = new Map(), response = { statusCode: 200, headersSent: false, setHeader() {} };
  await module.exports.dynamicRoutes({ response, async use(name, handler) { handlers.set(name, handler); } });
  const value = await handlers.get('me')({});
  assert.equal(response.statusCode, expected);
  const normalized = normalizeDynamicReturn(value);
  assert.equal(normalized.statusCode, expected);
  assert.equal(JSON.parse(normalized.body).status, status);
 }
});
