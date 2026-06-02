// B"H
const assert = require("assert");
const { resolveFsVessel } = require("../../geelooy/api/tunnel/control/routes/fsVessel/resolveFsVessel.js");
const { listNativeTunnels } = require("../../geelooy/api/tunnel/control/routes/fsVessel/tunnelClient.js");
const { virtualOsDevice } = require("../../geelooy/api/tunnel/control/routes/fsVessel/virtualNames.js");

function fakeClient(name) {
  return {
    isTunnel: true,
    tunnelName: name,
    isAlive: true,
    registeredAt: Date.now(),
    root: "/tmp/root"
  };
}

async function run() {
  const noNative = { ws: { clients: [] } };
  const oneNative = {
    ws: {
      clients: [fakeClient("awt-real")],
      sendTunnelRequest: async (name, payload) => ({ ok: true, name, action: payload.action })
    }
  };

  assert.strictEqual(virtualOsDevice(true).tunnelName, "awtsmoos-virtual-os");
  assert.deepStrictEqual(listNativeTunnels(noNative), []);

  const explicitVirtual = resolveFsVessel({
    $i: noNative,
    userId: "u",
    tunnelName: "awtsmoos-virtual-os",
    payload: { action: "list", path: ".", routeHints: {} },
    timeoutMs: 1000
  });
  assert.strictEqual(explicitVirtual.kind, "virtual-os");

  const autoNative = resolveFsVessel({
    $i: oneNative,
    userId: "u",
    tunnelName: "auto",
    payload: { action: "list", path: ".", routeHints: {} },
    timeoutMs: 1000
  });
  assert.strictEqual(autoNative.kind, "native-tunnel");
  assert.strictEqual((await autoNative.send()).vessel, "native-tunnel");

  const missing = resolveFsVessel({
    $i: noNative,
    userId: "u",
    tunnelName: "missing",
    payload: { action: "list", path: ".", routeHints: {} },
    timeoutMs: 1000
  });
  const missingResult = await missing.send();
  assert.strictEqual(missingResult.status, 404);
  assert.ok(missingResult.virtualFallback.yamlComment.includes("virtual-os"));

  console.log("B'H resolver verification passed");
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
