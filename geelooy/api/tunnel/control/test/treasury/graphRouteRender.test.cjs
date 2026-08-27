// B"H
const assert = require("assert");
const { routeTable } = require("../../routes/table.js");

/** B"H: The graph route must render a visible map and still expose JSON. */
async function run() {
  const html = await call({}, false);
  assert(html.includes("Treasury Graph"));
  assert(html.includes("Interactive Treasury Graph"));
  assert(html.includes("awt-graph"));
  assert(html.includes("Treasury graph"));
  const json = JSON.parse(await call({ format: "json" }, true));
  assert.strictEqual(json.ok, true);
  assert(Array.isArray(json.graph.nodes));
  assert(Array.isArray(json.graph.edges));
  return { ok: true, htmlBytes: Buffer.byteLength(html), graphNodes: json.graph.nodes.length };
}
async function call(query, expectJson) {
  const headers = {};
  const $i = {
    paramKinds: { GET: query },
    request: { headers: {}, user: { info: { userId: `graph_user_${Math.random().toString(16).slice(2)}` } } },
    response: { statusCode: 200, setHeader(name, value) { headers[name] = value; } }
  };
  const body = await routeTable["treasury/graph"]($i);
  assert(headers["Content-Type"].includes(expectJson ? "application/json" : "text/html"));
  return body;
}
module.exports = { run };
if (require.main === module) run().then(x => console.log(JSON.stringify(x, null, 2)));
