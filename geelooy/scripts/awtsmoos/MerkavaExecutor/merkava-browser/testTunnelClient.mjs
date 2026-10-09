// B"H — MerkavaTunnelClient tests (mock transport, no live server needed).
// Run: node testTunnelClient.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { MerkavaTunnelClient, TunnelError } = require("./MerkavaTunnelClient.js");

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name) {
    if (cond) pass++;
    else { fail++; failures.push(name); console.log("  FAIL:", name); }
}
async function section(name, fn) {
    const p0 = pass, f0 = fail;
    try { await fn(); } catch (e) { fail++; failures.push(name + " threw: " + e.message); console.log("  THREW:", name, e.message); }
    console.log(`## ${name}: ${pass - p0} pass, ${fail - f0} fail`);
}

// Mock fetch: scripted responses
function mockFetch(script) {
    const calls = [];
    const fn = async (url, opts) => {
        calls.push({ url, opts, body: opts && opts.body ? JSON.parse(opts.body) : undefined });
        const next = script.shift();
        if (!next) throw new Error("mockFetch: no scripted response for " + url);
        if (next.throw) throw new Error(next.throw);
        return { text: async () => JSON.stringify(next.json), status: next.status || 200 };
    };
    fn.calls = calls;
    return fn;
}

await section("discovery picks alive device", async () => {
    const f = mockFetch([{
        json: {
            nativeDevices: [
                { connected: true, isAlive: false, routeReference: "dead1", tunnelName: "d" },
                { connected: true, isAlive: true, routeReference: "live9", tunnelName: "mac" }
            ]
        }
    }]);
    const c = new MerkavaTunnelClient({ token: "TOK", fetchImpl: f });
    const ref = await c.discover();
    ok(ref === "live9", "picks the alive device, got " + ref);
    ok(f.calls[0].url.includes("/api/tunnel/control/my-device"), "hits my-device endpoint");
    ok(f.calls[0].opts.headers.Authorization === "Bearer TOK", "sends bearer token");
});

await section("discovery prefers preferredRef", async () => {
    const f = mockFetch([{
        json: {
            nativeDevices: [
                { connected: true, isAlive: true, routeReference: "a1" },
                { connected: true, isAlive: true, routeReference: "b2" }
            ]
        }
    }]);
    const c = new MerkavaTunnelClient({ token: "TOK", fetchImpl: f, preferredRef: "b2" });
    const ref = await c.discover();
    ok(ref === "b2", "preferred ref wins");
});

await section("discovery throws when none alive", async () => {
    const f = mockFetch([{ json: { nativeDevices: [] } }]);
    const c = new MerkavaTunnelClient({ token: "TOK", fetchImpl: f });
    let threw = false;
    try { await c.discover(); } catch (e) { threw = e.code === "no_route"; }
    ok(threw, "throws no_route");
});

await section("executeAction follows pending envelope", async () => {
    const f = mockFetch([
        { json: { nativeDevices: [{ connected: true, isAlive: true, routeReference: "r1" }] } },
        { json: { ok: true, pending: true, next: { retryAfterMs: 10, controlRequestId: "c1", requestedAction: "commandRun" } } },
        { json: { ok: true, pending: true, next: { retryAfterMs: 10, controlRequestId: "c1", requestedAction: "commandRun" } } },
        { json: { ok: true, stdout: "hello\n", exitCode: 0 } }
    ]);
    const c = new MerkavaTunnelClient({ token: "TOK", fetchImpl: f });
    const r = await c.executeAction("commandRun", { command: "echo hello" });
    ok(r.stdout === "hello\n", "final result returned after pending follows");
    ok(r.exitCode === 0, "exit code present");
    const retryCall = f.calls[2];
    ok(retryCall.body.action === "retryAction", "sends retryAction, got " + retryCall.body.action);
    ok(retryCall.body.controlRequestId === "c1", "carries controlRequestId");
});

await section("executeAction posts to fs route", async () => {
    const f = mockFetch([
        { json: { nativeDevices: [{ connected: true, isAlive: true, routeReference: "rZ" }] } },
        { json: { ok: true, items: ["a", "b"] } }
    ]);
    const c = new MerkavaTunnelClient({ token: "TOK", fetchImpl: f });
    const r = await c.fsList("/tmp");
    ok(r.items.length === 2, "fs list works");
    ok(f.calls[1].url.includes("/api/tunnel/control/fs/rZ"), "posts to route ref URL");
    ok(f.calls[1].body.action === "list", "action=list");
});

await section("no token throws", async () => {
    const c = new MerkavaTunnelClient({ fetchImpl: async () => ({ text: async () => "{}" }) });
    let threw = false;
    try { await c.myDevice(); } catch (e) { threw = e.code === "no_token"; }
    ok(threw, "throws no_token without token");
});

await section("transport failure wrapped", async () => {
    const f = async () => { throw new Error("socket hangup"); };
    const c = new MerkavaTunnelClient({ token: "T", fetchImpl: f });
    let threw = false;
    try { await c.myDevice(); } catch (e) { threw = e.code === "transport"; }
    ok(threw, "transport errors become TunnelError");
});

console.log(`\n==== RESULT: ${pass} pass, ${fail} fail ====`);
if (failures.length) { console.log("Failures:"); failures.forEach(f => console.log(" - " + f)); }
process.exit(fail ? 1 : 0);
