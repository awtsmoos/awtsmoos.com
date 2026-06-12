// B"H
const assert = require("assert");
const { buildActions } = require("../actions.js");

/**
 * B"H
 * Chapter 414: Chrome names were spoken inside a browser made of Node.
 * These tests do not launch Chrome. They route chrome* action names through the
 * node-dom virtual runtime and verify the same high-level vocabulary works.
 */
const config = { root: process.cwd(), allowWrite: true, allowSecrets: false, allowCommands: true, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true, chrome: true } };
const html = `<body><input id="name"><button id="go">Go</button><div id="out"></div><script>go.onclick=()=>out.textContent='Hi '+name.value</script></body>`;

async function run(payload) {
  const actions = buildActions(config, payload, null);
  const fn = actions[payload.action];
  assert.equal(typeof fn, "function", "missing " + payload.action);
  return await fn();
}

async function testEval() {
  const result = await run({ action: "chromeEval", engine: "node-dom", html, expression: "document.querySelector('#go').textContent" });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.result.result.value, "Go");
  return result;
}

async function testTypeClick() {
  const result = await run({ action: "chromeClick", engine: "node-dom", html, browserActions: JSON.stringify([{ action: "fill", selector: "#name", value: "Awts" }]), selector: "#go", returnValues: JSON.stringify(["out.textContent"]) });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.values["out.textContent"], "Hi Awts");
  return result;
}

async function testChromeType() {
  const result = await run({ action: "chromeType", engine: "node-dom", html: `<body><input id="x"></body>`, selector: "#x", text: "abc", returnValues: JSON.stringify(["x.value"]) });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.values["x.value"], "abc");
  return result;
}

async function testRunScript() {
  const script = [{ type: "click", selector: "#go" }, { type: "eval", expression: "out.textContent='Script OK'" }];
  const result = await run({ action: "chromeRunScript", engine: "node-dom", html, actionsJson: JSON.stringify(script), returnValues: JSON.stringify(["out.textContent"]) });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.values["out.textContent"], "Script OK");
  return result;
}

async function testSnapshot() {
  const result = await run({ action: "chromeSnapshot", engine: "node-dom", html });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.ok(result.snapshot, "expected snapshot");
  return result;
}

(async () => {
  const results = { eval: await testEval(), typeClick: await testTypeClick(), chromeType: await testChromeType(), runScript: await testRunScript(), snapshot: await testSnapshot() };
  console.log(JSON.stringify({ ok: true, summary: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { ok: v.ok, engine: v.engine, virtual: v.virtual }])) }, null, 2));
  process.exit(0);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
