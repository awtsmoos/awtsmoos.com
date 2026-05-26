// B"H
const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const merkavaRoot = path.resolve(__dirname, "..");
const serviceUrl = pathToFileURL(path.join(merkavaRoot, "merkava-service/index.js")).href;
const MerkavaExecutor = require(path.join(merkavaRoot, "merkavaexecutor.cjs"));

async function testMode2SourceCompileAndRun() {
  const source = {
    entry: "/index.html",
    files: {
      "/index.html": '<body><section id="app">B"H MD2</section><script src="/boot.js"></script></body>',
      "/boot.js": 'document.querySelector("#app").textContent = "B\\"H MD2 awake";'
    }
  };
  const compiled = await MerkavaExecutor.compile(source, { type: "source" });
  assert.equal(compiled.format, "MD2\u0000");
  const result = await MerkavaExecutor.execute(compiled.binary);
  assert.equal(result.ok, true);
  assert.equal(result.document.getElementById("app").textContent, 'B"H MD2');
  return { ok: true, format: compiled.format, bodyChildren: result.document.body.children.length };
}

async function testVmNodeFileRuntime() {
  const result = await MerkavaExecutor.executeNodeFiles({
    "/math.js": "export const base = 7; export default function add(a, b) { return a + b + base; }",
    "/main.js": 'import add, { base } from "./math.js"; export const total = add(2, 3); export const seen = base;'
  }, "/main.js");
  assert.equal(result.ok, true);
  assert.equal(result.exports.total, 12);
  assert.equal(result.exports.seen, 7);
  return { ok: true, exports: result.exports };
}

async function testSimulateRuntimeParameters() {
  const service = await import(serviceUrl);
  const result = await service.simulateRuntime({
    runtime: "browser",
    entry: "index.html",
    files: {
      "index.html": '<body><button id="go">go</button><output id="out">idle</output><script src="boot.js"></script></body>',
      "boot.js": [
        'window.__awtsmoosResult = { clicks: 0 };',
        'document.querySelector("#go").addEventListener("click", () => {',
        '  window.__awtsmoosResult.clicks += 1;',
        '  document.querySelector("#out").textContent = "done";',
        '});'
      ].join("\n")
    },
    interactions: [{ op: "click", selector: "#go" }, { op: "assertText", selector: "#out", expected: "done" }],
    returnValues: ["window.__awtsmoosResult.clicks"]
  });
  assert.equal(result.ok, true);
  assert.equal(result.awtsmoosResult.clicks, 1);
  assert.equal(result.values["window.__awtsmoosResult.clicks"], 1);
  assert.equal(result.interactionLog.length, 2);
  return { ok: true, clicks: result.awtsmoosResult.clicks, interactions: result.interactionLog.length };
}

(async () => {
  const results = {
    mode2SourceCompileAndRun: await testMode2SourceCompileAndRun(),
    vmNodeFileRuntime: await testVmNodeFileRuntime(),
    simulateRuntimeParameters: await testSimulateRuntimeParameters()
  };
  console.log(JSON.stringify({ ok: true, results }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
