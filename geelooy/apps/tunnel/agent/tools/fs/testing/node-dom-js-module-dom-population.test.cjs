// B"H
const assert = require("assert");
const path = require("path");
const { simulateNodeDomRuntime } = require(path.join(__dirname, "../nodeDomRuntime/index.js"));
const { buildRuntimeActions } = require(path.join(__dirname, "../actionGroups/runtimeActions.js"));

/**
 * B"H
 * Chapter 422: JavaScript Did Not Merely Parse The Body; It Populated It.
 *
 * The virtual DOM must remain alive after module execution. This test proves
 * inline modules, external modules, and URL-collected app modules mutate the
 * same tracked document returned in values and domSnapshot.
 */
function textOf(value) {
  return JSON.stringify(value || "");
}

async function inlineModuleCase() {
  return await simulateNodeDomRuntime({
    html: `<body><div id="root"></div><script type="module">
      document.title = 'Inline Module Title';
      document.body.className = 'js-on';
      const el = document.createElement('strong');
      el.id = 'made';
      el.textContent = 'MADE_INLINE';
      document.querySelector('#root').append(el);
      console.log('INLINE_MODULE_RAN');
    </script></body>`,
    returnValues: ["document.title", "document.body.className", "document.querySelector('#made')?.textContent", "document.body.innerHTML"],
    waitMs: 20
  });
}

async function externalModuleCase() {
  return await simulateNodeDomRuntime({
    entry: "index.html",
    files: {
      "index.html": `<body><main id="root"></main><script type="module" src="./app.js"></script></body>`,
      "app.js": `document.title = 'External Module Title';
        document.body.className = 'external-js';
        const p = document.createElement('p');
        p.id = 'made';
        p.textContent = 'MADE_EXTERNAL';
        document.getElementById('root').append(p);
        console.log('EXTERNAL_MODULE_RAN');`
    },
    returnValues: ["document.title", "document.body.className", "document.querySelector('#made')?.textContent", "document.body.innerHTML"],
    waitMs: 20
  });
}

async function urlTunnelControlCase() {
  return await buildRuntimeActions({
    config: { root: path.resolve(__dirname, "../../../../../../") },
    payload: {
      action: "simulateRuntime",
      engine: "node-dom",
      url: "http://127.0.0.1:8080/apps/tunnel-control/",
      waitMs: 500,
      returnValues: JSON.stringify([
        "document.body.className",
        "!!document.querySelector('.awt-login-gate')",
        "document.body.innerHTML.includes('Open your local codebase through Awtsmoos')"
      ])
    }
  }).simulateRuntime();
}

function assertInline(result) {
  assert.equal(result.ok, true);
  assert.equal(result.values["document.title"], "Inline Module Title");
  assert.equal(result.values["document.body.className"], "js-on");
  assert.equal(result.values["document.querySelector('#made')?.textContent"], "MADE_INLINE");
  assert.ok(textOf(result.domSnapshot).includes("MADE_INLINE"));
  assert.ok(textOf(result.console).includes("INLINE_MODULE_RAN"));
}

function assertExternal(result) {
  assert.equal(result.ok, true);
  assert.equal(result.values["document.title"], "External Module Title");
  assert.equal(result.values["document.body.className"], "external-js");
  assert.equal(result.values["document.querySelector('#made')?.textContent"], "MADE_EXTERNAL");
  assert.ok(textOf(result.domSnapshot).includes("MADE_EXTERNAL"));
  assert.ok(textOf(result.console).includes("EXTERNAL_MODULE_RAN"));
}

function assertUrl(result) {
  assert.equal(result.ok, true);
  assert.equal(result.values["document.body.className"], "awt-gated");
  assert.equal(result.values["!!document.querySelector('.awt-login-gate')"], true);
  assert.equal(result.values["document.body.innerHTML.includes('Open your local codebase through Awtsmoos')"], true);
  assert.ok(textOf(result.domSnapshot).includes("Open your local codebase through Awtsmoos"));
}

(async () => {
  const inline = await inlineModuleCase();
  const external = await externalModuleCase();
  const url = await urlTunnelControlCase();
  assertInline(inline);
  assertExternal(external);
  assertUrl(url);
  console.log(JSON.stringify({
    ok: true,
    inline: { values: inline.values, console: inline.console },
    external: { values: external.values, console: external.console },
    url: { values: url.values, console: url.console, files: Object.keys(url.virtualEnv?.files || {}).length }
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
