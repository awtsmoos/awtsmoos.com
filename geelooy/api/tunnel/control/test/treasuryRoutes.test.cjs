// B"H
const assert = require("assert");
const { routeTable } = require("../routes/table.js");

/** B"H: Every treasury doorway must remain named in the route table. */
function run() {
  const expected = [
    "provider", "refund", "admin-vault", "resource-accounting", "treasury-test",
    "treasury", "flow", "organization", "agent-economy", "marketplace",
    "compute", "compute/capture", "compute/history", "compute/receipt", "compute/subscription"
  ];
  for (const route of expected) assert.strictEqual(typeof routeTable[route], "function", route);
  return { ok: true, routes: expected.length };
}
module.exports = { run };
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
