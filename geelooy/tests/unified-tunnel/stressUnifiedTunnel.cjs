// B"H
const assert = require("assert");
const { cleanPath, splitPath } = require("../../api/tunnel/control/routes/osFs/path.js");
const { publicUrlReport, classifyCandidateResult } = require("../../api/tunnel/control/routes/osFs/publicUrls.js");
const { resolveFsVessel } = require("../../api/tunnel/control/routes/fsVessel/resolveFsVessel.js");
const { VESSEL_TYPES } = require("../../api/tunnel/control/routes/fsVessel/vesselTypes.js");

function client(tunnelName, extra = {}) {
  return { isTunnel: true, isAlive: true, tunnelName, registeredAt: Date.now() + Math.floor(Math.random() * 1000), ...extra };
}

function ctx(clients = []) {
  return { ws: { clients, sendTunnelRequest: async (name, payload) => ({ ok: true, name, payload }) } };
}

function stressPathJail() {
  const good = ["alias/file.txt", "alias/Coby/apps/demo/index.html", "alias/a/b/c.js", "/alias/folder/file.awtsmoosJSON"];
  for (let i = 0; i < 250; i++) {
    const path = good[i % good.length];
    assert(cleanPath(path).startsWith("alias"));
    assert.strictEqual(splitPath(path).aliasId, "alias");
  }
  const bad = ["alias/../secret", "alias/%2e%2e/secret", "alias/%252e%252e/secret", "C:/secret", "alias/a\u0000b", "alias/http:evil"];
  for (let i = 0; i < 250; i++) assert.throws(() => cleanPath(bad[i % bad.length]));
}

function stressPublicUrls() {
  for (let i = 0; i < 200; i++) {
    const got = publicUrlReport({ path: `project/Coby/apps/demo${i}/index.html`, publicOrigin: "https://example.com/" });
    assert.strictEqual(got.appPath, `/apps/demo${i}/index.html`);
    assert(got.candidates[0].endsWith(`/apps/demo${i}/index.html`));
  }
  assert.strictEqual(classifyCandidateResult({ status: 200, body: "<!doctype html><main>OK</main>" }).ok, true);
  assert.strictEqual(classifyCandidateResult({ status: 404, body: "DYN_ROUTE_NOT_FOUND" }).ok, false);
  assert.strictEqual(classifyCandidateResult({ status: 0, body: "plain" }).verdict, "inconclusive");
}

function stressResolver() {
  const native = client("native-one", { allowWrite: true, allowCommands: true });
  const browser = client("browser-one", { browserAgent: true, vesselType: "browser-tab", allowWrite: true });
  for (let i = 0; i < 200; i++) {
    const $i = ctx(i % 2 ? [native, browser] : [browser, native]);
    assert.strictEqual(resolveFsVessel({ $i, userId: "u", tunnelName: "browser-one", payload: { targetVessel: "browser-tab" } }).kind, VESSEL_TYPES.BROWSER);
    assert.strictEqual(resolveFsVessel({ $i, userId: "u", tunnelName: "native-one", payload: { targetVessel: "native" } }).kind, VESSEL_TYPES.NATIVE);
    assert.strictEqual(resolveFsVessel({ $i, userId: "u", tunnelName: "native-one", payload: { targetVessel: "virtual-os" } }).kind, VESSEL_TYPES.VIRTUAL_OS);
    assert.strictEqual(resolveFsVessel({ $i, userId: "u", tunnelName: "auto", payload: {} }).kind, VESSEL_TYPES.BROWSER);
  }
}

const started = Date.now();
stressPathJail();
stressPublicUrls();
stressResolver();
console.log(JSON.stringify({ ok: true, suite: "unified-tunnel-stress", durationMs: Date.now() - started, cases: { pathJail: 500, publicUrls: 203, resolver: 800 } }, null, 2));
