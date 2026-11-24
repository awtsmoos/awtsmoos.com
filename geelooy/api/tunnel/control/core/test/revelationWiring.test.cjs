//B"H
const assert = require("assert");
const fs = require("fs"), os = require("os"), path = require("path");
const Wiring = require("../revelation/wiring.js");
const { buildFsPayload } = require("../tunnelPayload.js");
const Projection = require("../../routes/devicePublicProjection.js");
const SafeWrite = require("../revelation/safeWrite.js");

// Transport guard wired into the native fs route: payload-in-GET is rejected
const getWrite = { request: { method: "GET", url: "/fs/x" }, paramKinds: { GET: { action: "write", content: "hello" } } };
const rejected = Wiring.guardFsTransport(getWrite);
assert.equal(rejected.status, 414);
assert.equal(rejected.body.status, "not_accepted");
assert.equal(rejected.body.error, "transport_guard_rejected");
// Small GET reads and GET search terms pass untouched (backward compatibility)
assert.equal(Wiring.guardFsTransport({ request: { method: "GET", url: "/fs/x" }, paramKinds: { GET: { action: "read", path: "a.txt" } } }), null);
assert.equal(Wiring.guardFsTransport({ request: { method: "GET", url: "/fs/x" }, paramKinds: { GET: { action: "grep", text: "needle" } } }), null);
// The same payload in a POST body passes
assert.equal(Wiring.guardFsTransport({ request: { method: "POST", url: "/fs/x" }, paramKinds: { POST: { action: "write", content: "hello" } } }), null);

// Canonical protocol: opt-in only. Legacy carriers are untouched.
const legacy = buildFsPayload({ paramKinds: { GET: { action: "read", path: "a.txt", requestId: "r1" } } });
assert.equal(legacy.payloadError, undefined);
const badCanonical = buildFsPayload({ paramKinds: { GET: { action: "read", path: "a.txt", version: "awtsmoos.tunnel/1", requestId: "r1" } } });
assert.ok(String(badCanonical.payloadError).startsWith("canonical_protocol_invalid"));
const goodCanonical = buildFsPayload({ paramKinds: { GET: { action: "read", path: "a.txt", version: "awtsmoos.tunnel/1", requestId: "req-12345678" } } });
assert.equal(goodCanonical.payloadError, undefined);

// Path guard at the control layer: escaping relative paths rejected, others pass
const escape = buildFsPayload({ paramKinds: { GET: { action: "read", path: "../escape.txt" } } });
assert.ok(String(escape.payloadError).startsWith("path_guard_rejected"));
assert.equal(buildFsPayload({ paramKinds: { GET: { action: "read", path: "sub/../a.txt" } } }).payloadError, undefined);
assert.equal(buildFsPayload({ paramKinds: { GET: { action: "read", path: "/abs/project/a.txt" } } }).payloadError, undefined);

// Presence projection (reconnect): live socket connected, recent degraded, old offline
assert.equal(Projection.device({ isAlive: true, connected: true }).presence, "connected");
assert.equal(Projection.device({ lastSeenAt: new Date(Date.now() - 600000).toISOString() }).presence, "degraded");
assert.equal(Projection.device({ lastSeenAt: new Date(Date.now() - 172800000).toISOString() }).presence, "offline");

// safeWrite mode option + store delegation roundtrip in an isolated store file
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "awt-wire-"));
const direct = path.join(dir, "direct.txt");
assert.equal(SafeWrite.atomicWrite(direct, "x", { mode: 0o600 }).ok, true);
assert.equal(fs.statSync(direct).mode & 0o777, 0o600);
process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(dir, "store.json");
const Store = require("../store.js");
Store.writeStore({ apiKeys: { k: { id: "k" } }, usage: [] });
assert.equal(fs.statSync(process.env.AWTSMOOS_TUNNEL_CONTROL_STORE).mode & 0o777, 0o600);
assert.equal(Store.readStore().apiKeys.k.id, "k");
Store.writeStore({ apiKeys: {}, usage: [{ action: "read" }] });
assert.equal(Store.readStore().usage.length, 1);
delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
fs.rmSync(dir, { recursive: true, force: true });
console.log("BHY revelation wiring tests passed");
