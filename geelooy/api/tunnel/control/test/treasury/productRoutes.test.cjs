// B"H
const assert = require("assert");
const { routeTable } = require("../../routes/table.js");

/** B"H: The treasury product routes must remain first-class doors. */
function run() {
  const expected = [
    "treasury/home",
    "treasury/budgets",
    "treasury/forecast",
    "treasury/marketplace",
    "treasury/agents",
    "treasury/providers",
    "treasury/graph",
    "treasury/advisor",
    "treasury/reputation"
  ];
  for (const route of expected) assert.strictEqual(typeof routeTable[route], "function", route);
  return { ok: true, routes: expected.length };
}
module.exports = { run };
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
