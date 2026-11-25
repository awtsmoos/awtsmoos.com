//B"H
// Legacy plugin GET compatibility: authenticated non-cookie identities may
// carry payloads in GET up to the bounded legacy ceiling; sessions and
// anonymous callers may not; genuinely oversized GETs get a real chunked
// direction, and modern POST is untouched.
const assert = require("assert");
const Wiring = require("../revelation/wiring.js");
const T = require("../revelation/transportGuard.js");

const apiKey = { ok: true, kind: "apiKey" };
const oauth = { ok: true, kind: "oauth" };
const session = { ok: true, kind: "session" };
const get = (params) => ({ request: { method: "GET", url: "/fs/awt-root-73967" }, paramKinds: { GET: params } });

// The exact regression: a small authenticated plugin write (916-byte class).
assert.equal(Wiring.guardFsTransport(get({ action: "write", path: "a.txt", content: "hello B\"H" }), apiKey), null);
// Medium legacy write (~6 KB of content) still inside the legacy ceiling.
assert.equal(Wiring.guardFsTransport(get({ action: "write", path: "a.txt", content: "x".repeat(6000) }), apiKey), null);
// OAuth bearer qualifies the same way; command execution too.
assert.equal(Wiring.guardFsTransport(get({ action: "commandRun", command: "echo hi there" }), oauth), null);
// Browser-session identity can NEVER mutate over GET (CSRF / prefetch guard).
const sessionVerdict = Wiring.guardFsTransport(get({ action: "write", path: "a.txt", content: "hello" }), session);
assert.equal(sessionVerdict.status, 414);
assert.equal(sessionVerdict.body.error, "transport_guard_rejected");
// No verified identity: not eligible either.
assert.equal(Wiring.guardFsTransport(get({ action: "write", path: "a.txt", content: "hello" })).status, 414);
// Genuinely oversized legacy GET: rejected toward chunked transfer (413).
const huge = Wiring.guardFsTransport(get({ action: "write", path: "a.txt", content: "x".repeat(40000) }), apiKey);
assert.equal(huge.status, 413);
assert.equal(huge.body.result.transport, "chunked");
assert.ok(/chunked/.test(huge.body.result.guidance));
// Pure guard contract: legacy flag is opt-in and bounded.
assert.equal(T.decideTransport({ method: "GET", params: { content: "x" }, legacyGetAllowed: true }).transport, "query-legacy");
assert.equal(T.decideTransport({ method: "GET", params: { content: "x" } }).ok, false);
assert.equal(T.decideTransport({ method: "GET", params: { content: "x".repeat(40000) }, legacyGetAllowed: true }).transport, "chunked");
// Modern POST with a body is unchanged, session or not.
assert.equal(Wiring.guardFsTransport({ request: { method: "POST", url: "/fs/x" }, paramKinds: { POST: { action: "write", content: "hello" } } }, session), null);
// Read-only GETs pass for every identity, as before.
assert.equal(Wiring.guardFsTransport(get({ action: "read", path: "a.txt" }), session), null);
console.log("BHY revelation legacy-GET compatibility tests passed");
