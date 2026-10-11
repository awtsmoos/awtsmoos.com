// B"H — OfflineVersionStore tests: refresh archives the old version,
// history serves with zero network, old pages never lost on update.
// Run: node testOfflineVersions.mjs
import { createRequire } from "module";
import fs from "fs";
import os from "os";
import path from "path";

const require = createRequire(import.meta.url);
const { OfflineVersionStore } = require("./OfflineVersionStore.js");

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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ver-test-"));
const mkStore = () => new OfflineVersionStore({
	persistPath: path.join(tmp, "cache-" + Math.random().toString(36).slice(2)),
	versionsDir: path.join(tmp, "versions-" + Math.random().toString(36).slice(2))
});

// Fake fetch: version counter in the body, honors nothing (always 200).
let netVersion = 0;
const fakeFetch = async (url) => ({
	status: 200,
	headers: new Map([["content-type", "text/html"]]),
	arrayBuffer: async () => Buffer.from("<h1>v" + (++netVersion) + " of " + url + "</h1>")
});
const deadFetch = async () => { throw new Error("OFFLINE"); };

await section("refresh archives old version, serves new", async () => {
	const s = mkStore();
	const url = "https://example.com/page";
	const r1 = await s.refresh(url, fakeFetch);
	ok(r1.updated === true && !r1.fromCache, "first fetch from network");
	ok(r1.data.toString().includes("<h1>v1"), "v1 body");
	const r2 = await s.refresh(url, fakeFetch);
	ok(r2.updated === true, "second fetch updated");
	ok(r2.data.toString().includes("<h1>v2"), "v2 body live");
	const hist = s.listVersions(url);
	ok(hist.length === 1, "one archived version (v1)");
	// Old version still available with ZERO network:
	const old = s.getVersion(url, 1);
	ok(!!old && old.data.toString().includes("<h1>v1"), "v1 served from history offline");
	ok(old.fromHistory === true, "marked fromHistory");
	// Current still served:
	const cur = s.getCurrent(url);
	ok(!!cur && cur.data.toString().includes("<h1>v2"), "current is v2");
});

await section("offline: history + current survive with dead network", async () => {
	const s = mkStore();
	const url = "https://example.com/offline-page";
	await s.refresh(url, fakeFetch);
	await s.refresh(url, fakeFetch);
	// Now the network dies:
	const r = await s.refresh(url, deadFetch);
	ok(r.fromCache === true, "falls back to cache when offline");
	ok(r.data.toString().includes("v"), "cached body served, zero network");
	const old = s.getVersion(url, "latest");
	ok(!!old, "history available offline");
});

await section("version cap trims oldest", async () => {
	const s = new OfflineVersionStore({
		persistPath: path.join(tmp, "c2"), versionsDir: path.join(tmp, "v2"), maxVersions: 3
	});
	const url = "https://example.com/many";
	for (let i = 0; i < 5; i++) await s.refresh(url, fakeFetch);
	const hist = s.listVersions(url);
	ok(hist.length === 3, "capped at 3 versions (got " + hist.length + ")");
	const oldest = s.getVersion(url, 1);
	ok(oldest === null, "oldest trimmed away");
});

await section("missing url -> nulls, no crash", async () => {
	const s = mkStore();
	ok(s.getVersion("https://nope.example/") === null, "no history -> null");
	ok(s.getCurrent("https://nope.example/") === null, "no cache -> null");
	ok(s.listVersions("https://nope.example/").length === 0, "empty list");
	ok(s.has("https://nope.example/") === false, "has false");
});

console.log(`\n==== OfflineVersions: ${pass} pass, ${fail} fail ====`);
if (fail) { console.log("FAILURES:", failures); process.exit(1); }
