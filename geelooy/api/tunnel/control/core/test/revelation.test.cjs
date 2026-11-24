//B"H
const assert = require("assert");
const fs = require("fs"), os = require("os"), path = require("path");
const P = require("../revelation/protocol.js");
const J = require("../revelation/jobLifecycle.js");
const T = require("../revelation/transportGuard.js");
const G = require("../revelation/pathGuard.js");
const W = require("../revelation/safeWrite.js");
const R = require("../revelation/reconnect.js");

// Protocol
assert.equal(P.validateRequest({ requestId: "req-12345678", action: "read" }).ok, true);
assert.equal(P.validateRequest({ requestId: "x", action: "read" }).ok, false);
assert.equal(P.validateRequest({ requestId: "req-12345678", action: "Bad Action!" }).ok, false);
assert.equal(P.validateRequest({ requestId: "req-12345678", action: "read", version: "nope/9" }).ok, false);
assert.equal(P.makeResponse({ requestId: "r", status: "accepted" }).status, "accepted");
assert.throws(() => P.makeResponse({ status: "success-ish" }));

// Jobs: transmitted != success; unknown must reconcile, never blind-rerun
const job = { state: "not_accepted", history: [] };
J.transition(job, "accepted"); J.transition(job, "queued"); J.transition(job, "running"); J.transition(job, "completed");
assert.equal(J.isTerminal(job.state), true);
assert.throws(() => J.transition(job, "running"));
assert.equal(J.mayRetryBlindly("not_accepted"), true);
assert.equal(J.mayRetryBlindly("unknown"), false);
assert.equal(J.mayRetryBlindly("connection_lost"), false);

// Transport: the 414 killers
assert.equal(T.decideTransport({ method: "GET", params: { content: "x".repeat(5000) } }).transport, "body");
assert.equal(T.decideTransport({ method: "GET", url: "/" + "a".repeat(9000) }).ok, false);
assert.equal(T.decideTransport({ method: "POST", bodyBytes: T.MAX_BODY_BYTES + 1 }).transport, "chunked");
assert.equal(T.decideTransport({ method: "GET", url: "/ok", params: { action: "read" } }).ok, true);

// Paths + safe writes in a real temp project
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-rev-"));
fs.mkdirSync(path.join(root, "sub"));
assert.equal(G.resolveInside(root, "sub/a.txt").ok, true);
assert.equal(G.resolveInside(root, "../escape.txt").ok, false);
assert.equal(G.resolveInside(root, "/etc/passwd").ok, false);
assert.equal(G.resolveInside(root, ".env").ok, false);
fs.symlinkSync("/etc", path.join(root, "link-out"));
assert.equal(G.resolveInside(root, "link-out/passwd").ok, false);
const f = path.join(root, "sub/a.txt");
assert.equal(W.atomicWrite(f, "one", { expectedHash: null }).ok, true);
assert.equal(W.atomicWrite(f, "two", { expectedHash: null }).ok, false); // conflict: exists
const h = W.currentHash(f);
assert.equal(W.atomicWrite(f, "two", { expectedHash: h }).ok, true);
assert.equal(fs.readFileSync(f, "utf8"), "two");
assert.equal(fs.readdirSync(path.join(root, "sub")).filter(x => x.includes("awt-tmp")).length, 0);

// Reconnect: monotonic-ish capped backoff, stale != online
const seq = [0, 1, 2, 3, 10].map(a => R.backoffMs(a, { random: () => 0 }));
assert.ok(seq[4] <= 30000 && seq[2] > seq[0]);
assert.equal(R.classifyPresence({ lastHeartbeatAt: Date.now(), now: Date.now() }), "connected");
assert.equal(R.classifyPresence({ lastHeartbeatAt: 0, now: Date.now() }), "offline");
assert.equal(R.classifyPresence({ lastHeartbeatAt: 0, now: Date.now(), authOk: false }), "auth_required");
fs.rmSync(root, { recursive: true, force: true });
console.log("BHY revelation core tests passed");
