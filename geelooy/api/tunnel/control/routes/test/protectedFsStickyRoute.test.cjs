// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "awt-sticky-route-"));
process.env.__awtsdir = dir;

const { protectedFs } = require("../protectedFs.js");
const { resolveFsVessel } = require("../fsVessel/resolveFsVessel.js");

function client(tunnelName) {
  return { isTunnel: true, isAlive: true, tunnelName, root: "/projects/mitzvah-world", registeredAt: Date.now(), allowWrite: true, allowCommands: true, vesselType: "native-local" };
}

function route(action, p = {}, tunnelName = "auto", onSend = null) {
  const sent = [];
  const ctx = {
    paramKinds: { GET: { action, p: p.path || ".", conversationName: p.conversationName || "Sticky Mission", ...p } },
    request: { headers: {}, user: { info: { userId: "sticky-user" } } },
    response: { setHeader() {} },
    ws: {
      clients: new Set([client("awt-yackov-yitzchak-3750")]),
      sendTunnelRequest: async (name, payload) => {
        sent.push({ name, payload });
        if (onSend) onSend(name, payload);
        return { BH: "B\"H", ok: true, action: payload.action, content: `native:${name}:${payload.path || payload.p || "."}` };
      }
    }
  };
  return { ctx, sent, promise: protectedFs(ctx, { tunnelName }) };
}

(async () => {
  let first = route("list", { path: "AI_THOUGHTS" }, "awt-yackov-yitzchak-3750");
  const firstBody = JSON.parse(await first.promise);
  assert.strictEqual(firstBody.ok, true);
  assert.strictEqual(first.sent[0].name, "awt-yackov-yitzchak-3750");
  assert.strictEqual(firstBody.vessel, "native-tunnel");

  let second = route("read", { path: "AI_THOUGHTS/today.md" }, "auto");
  const secondBody = JSON.parse(await second.promise);
  assert.strictEqual(secondBody.ok, true);
  assert.strictEqual(second.sent[0].name, "awt-yackov-yitzchak-3750");
  assert.strictEqual(secondBody.routeReason, "exact_native_tunnel");
  assert.strictEqual(secondBody.vessel, "native-tunnel");

  const calls = [];
  const workers = Array.from({ length: 250 }, (_, index) => {
    const conversationName = `Sticky Mission ${index % 20}`;
    const run = route(index % 2 ? "findFiles" : "commandBatch", {
      path: "AI_THOUGHTS",
      conversationName,
      actions: JSON.stringify([{ action: "list", payload: { path: "AI_THOUGHTS" } }])
    }, "auto", (name, payload) => {
      calls.push({ name, action: payload.action, conversationName: payload.conversationName, controlRequestId: payload.controlRequestId, clientRequestId: payload.clientRequestId, agentSessionId: payload.agentSessionId, logicalAgentId: payload.logicalAgentId, projectRoot: payload.projectRoot, nonce: payload.nonce });
    });
    return run.promise.then(text => JSON.parse(text));
  });
  const results = await Promise.all(workers);
  assert.strictEqual(results.length, 250);
  assert(results.every(item => item.vessel === "native-tunnel"), "all auto calls should stay native");
  assert.strictEqual(calls.length, 250);
  assert(calls.every(call => call.name === "awt-yackov-yitzchak-3750"), "all concurrent calls should use sticky native tunnel");
  assert.strictEqual(new Set(calls.map(call => call.controlRequestId)).size, 250, "controlRequestId must be unique per call");
  assert.strictEqual(new Set(calls.map(call => call.clientRequestId)).size, 250, "clientRequestId must be unique per call");
  assert.strictEqual(new Set(calls.map(call => call.nonce)).size, 250, "nonce must be unique per call");
  assert(calls.every(call => call.agentSessionId && call.logicalAgentId), "agent session and logical agent ids must be attached");
  assert(calls.every(call => call.projectRoot === "/projects/mitzvah-world"), "routed project root must be attached");

  const hotCalls = [];
  const hotCtx = {
    ws: {
      clients: new Set([client("awt-yackov-yitzchak-3750")]),
      sendTunnelRequest: async (name, payload) => {
        hotCalls.push({ name, controlRequestId: payload.controlRequestId });
        return { ok: true, controlRequestId: payload.controlRequestId };
      }
    }
  };
  await Promise.all(Array.from({ length: 5000 }, (_, index) => {
    const payload = { kind: "fs", action: index % 3 === 0 ? "read" : index % 3 === 1 ? "list" : "findFiles", controlRequestId: `ctl_hot_${index}` };
    const vessel = resolveFsVessel({ $i: hotCtx, userId: "sticky-user", tunnelName: "awt-yackov-yitzchak-3750", payload, timeoutMs: 1000 });
    assert.strictEqual(vessel.kind, "native-tunnel");
    return vessel.send();
  }));
  assert.strictEqual(hotCalls.length, 5000);
  assert(hotCalls.every(call => call.name === "awt-yackov-yitzchak-3750"), "hot routing must stay on native tunnel");
  assert.strictEqual(new Set(hotCalls.map(call => call.controlRequestId)).size, 5000, "hot controlRequestId must stay unique");

  console.log("BHY protected fs sticky route stress passed", { protectedCalls: calls.length, hotCalls: hotCalls.length });
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
