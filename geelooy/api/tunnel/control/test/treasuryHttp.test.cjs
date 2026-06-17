// B"H
const assert = require("assert");
const { provider } = require("../routes/provider.js");
const { refund } = require("../routes/refund.js");
const { resourceAccounting } = require("../routes/resourceAccounting.js");
const { treasuryTest } = require("../routes/treasuryTest.js");

/** B"H: Route smoke tests pass through the same response helpers as live HTTP. */
async function run() {
  const got = [];
  got.push(await call(provider, { action: "preview", pack: "spark" }));
  got.push(await call(provider, { action: "capture", pack: "spark" }));
  got.push(await call(refund, { action: "history" }));
  got.push(await call(resourceAccounting, { action: "record", cpuMs: "50", bytes: "1000" }));
  got.push(await call(treasuryTest, {}));
  for (const row of got) assert.strictEqual(row.ok, true, row.name);
  assert.strictEqual(got[1].result.status, "captured");
  assert(got[3].entry.charges.compute > 0);
  assert(got[4].ledger > 0);
  return { ok: true, calls: got.length };
}
async function call(handler, query) {
  const headers = {};
  const $i = {
    paramKinds: { GET: query },
    request: { headers: {}, user: { info: { userId: "treasury_http_user" } } },
    response: { statusCode: 200, setHeader(name, value) { headers[name] = value; } }
  };
  const body = await handler($i);
  assert.strictEqual(headers["Content-Type"], "application/json; charset=utf-8");
  return JSON.parse(body);
}
module.exports = { run };
if (require.main === module) run().then(x => console.log(JSON.stringify(x, null, 2)));
