// B"H
const assert = require("assert");
const http = require("node:http");
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

async function testNavigationAndAliases() {
  const url = "https://example.test/path?x=1";
  const page = `<title>Virtual Arrival</title><h1 id="x">arrived</h1>`;
  const navigated = await run({ action: "chromeNavigate", engine: "node-dom", url, html: page });
  assert.equal(navigated.ok, true, JSON.stringify(navigated));
  assert.equal(navigated.url, url);
  assert.equal(navigated.href, url);
  assert.equal(navigated.currentUrl, url);
  assert.equal(navigated.navigation.currentUrl, url);
  const evaluated = await run({
    action: "chromeEval",
    engine: "node-dom",
    href: url,
    html: page,
    command: "location.href + '|' + document.title"
  });
  assert.equal(evaluated.expression, "location.href + '|' + document.title");
  assert.equal(evaluated.value, `${url}|Virtual Arrival`);
  return { ...navigated, evaluatedValue: evaluated.value };
}

async function testScriptNavigation() {
  const url = "https://example.test/script-arrival";
  const result = await run({
    action: "chromeRunScript",
    engine: "node-dom",
    html: `<title>Script Arrival</title><h1>ready</h1>`,
    actionsJson: JSON.stringify([
      { type: "goto", url },
      { type: "eval", command: "document.body.dataset.scripted='yes'" }
    ]),
    returnValues: JSON.stringify(["location.href", "document.title", "document.body.dataset.scripted"])
  });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.url, url);
  assert.equal(result.href, url);
  assert.equal(result.values["location.href"], url);
  assert.equal(result.values["document.title"], "Script Arrival");
  assert.equal(result.values["document.body.dataset.scripted"], "yes");
  return result;
}

async function testVirtualSurface() {
  const status = await run({ action: "chromeStatus", engine: "node-dom", href: "https://example.test/status" });
  const targets = await run({ action: "chromeTargets", engine: "node-dom", href: "https://example.test/status" });
  assert.equal(status.browserControl, true);
  assert.equal(status.nativeBrowser, false);
  assert.equal(status.targets.length, 1);
  assert.equal(targets.ok, true);
  assert.equal(targets.targets[0].url, "https://example.test/status");
  assert.equal((await run({ action: "chromeNavigate", engine: "node-dom" })).error, "browser_navigation_url_required");
  assert.equal((await run({ action: "chromeNavigate", engine: "node-dom", url: "about:blank" })).error, "about_blank_rejected");
  return status;
}

async function testFetchedNavigation() {
  const server = http.createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<title>Fetched Arrival</title><h1 id="fetched">fetched</h1>`);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    const url = `http://127.0.0.1:${address.port}/arrival`;
    const result = await run({ action: "chromeNavigate", engine: "node-dom", url });
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.currentUrl, url);
    assert.match(JSON.stringify(result.snapshot), /Fetched Arrival/);
    return result;
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

(async () => {
  const results = {
    eval: await testEval(),
    typeClick: await testTypeClick(),
    chromeType: await testChromeType(),
    runScript: await testRunScript(),
    snapshot: await testSnapshot(),
    navigationAliases: await testNavigationAndAliases(),
    scriptNavigation: await testScriptNavigation(),
    virtualSurface: await testVirtualSurface(),
    fetchedNavigation: await testFetchedNavigation()
  };
  console.log(JSON.stringify({ ok: true, summary: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { ok: v.ok, engine: v.engine, virtual: v.virtual }])) }, null, 2));
  process.exit(0);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
