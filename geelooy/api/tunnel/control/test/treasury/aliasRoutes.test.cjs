// B"H
const assert = require("assert");
const { routeTable } = require("../../routes/table.js");

/** B"H: Root aliases must point into the same living treasury gates. */
async function run() {
  assert.strictEqual(typeof routeTable.budgets, "function");
  assert.strictEqual(typeof routeTable.reputation, "function");
  const suffix = Math.random().toString(16).slice(2);
  const userId = `alias_user_${suffix}`;
  const subjectId = `alias_agent_${suffix}`;
  const budget = await call(routeTable.budgets, userId, { action: "create", name: `Alias Budget ${suffix}`, routing: "100", compute: "10", storage: "1", gpu: "0", format: "json" });
  const reputation = await call(routeTable.reputation, userId, { action: "add", subjectType: "agent", subjectId, kind: "positive_review", weight: "3", format: "json" });
  assert.strictEqual(budget.ok, true);
  assert.strictEqual(reputation.ok, true);
  assert(budget.budgets.budgets.some(x => x.name === `Alias Budget ${suffix}`));
  assert.strictEqual(reputation.reputation.subjectId, subjectId);
  assert.strictEqual(reputation.reputation.score, 3);
  return { ok: true, aliases: ["budgets", "reputation"] };
}
async function call(handler, userId, query) {
  const headers = {};
  const $i = {
    paramKinds: { GET: query },
    request: { headers: {}, user: { info: { userId } } },
    response: { statusCode: 200, setHeader(name, value) { headers[name] = value; } }
  };
  const body = await handler($i);
  assert.strictEqual(headers["Content-Type"], "application/json; charset=utf-8");
  return JSON.parse(body);
}
module.exports = { run };
if (require.main === module) run().then(x => console.log(JSON.stringify(x, null, 2)));
