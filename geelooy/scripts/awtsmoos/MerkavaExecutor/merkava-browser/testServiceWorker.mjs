// B"H — ServiceWorkerHost tests: lifecycle, fetch interception, push/sync,
// cache API, persistence. Guest scripts run through the real Merkava VM.
// Run: node testServiceWorker.mjs
import { createRequire } from "module";
import fs from "fs";
import os from "os";
import path from "path";

const require = createRequire(import.meta.url);
const { ServiceWorkerHost } = require("./ServiceWorkerHost.js");

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name) {
	if (cond) pass++;
	else { fail++; failures.push(name); console.log("  FAIL:", name); }
}
async function section(name, fn) {
	const p0 = pass, f0 = fail;
	try { await fn(); } catch (e) { fail++; failures.push(name + " threw: " + e.message); console.log("  THREW:", name, e.message, e.stack && e.stack.split("\n")[1]); }
	console.log(`## ${name}: ${pass - p0} pass, ${fail - f0} fail`);
}
const tick = (ms = 30) => new Promise(r => setTimeout(r, ms));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sw-test-"));

const SW_SOURCE = `
var CACHE = 'app-v1';
self.addEventListener('install', function(e) {
  self.__installedAt = 'install-ran';
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.put('/cached/index.html', new Response('<h1>offline</h1>', { status: 200 }));
    }).then(function() { return caches.open(CACHE).then(function(c) { return c.put('/app.js', new Response('console.log(1)', { status: 200 })); }); })
  );
});
self.addEventListener('activate', function(e) {
  self.__activatedAt = 'activate-ran';
});
self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  if (url.indexOf('/cached') === 0) {
    e.respondWith(caches.match(url).then(function(hit) {
      if (hit) return hit;
      return new Response('miss', { status: 404 });
    }));
  } else if (url === '/sync-echo') {
    e.respondWith(new Response('echo-ok', { status: 200 }));
  }
  // else: no respondWith -> network fallback (null)
});
self.addEventListener('push', function(e) {
  self.__pushData = 'got-push';
  e.waitUntil(Promise.resolve('shown'));
});
self.addEventListener('sync', function(e) {
  self.__syncTag = e.tag;
});
`;

const mem = () => { const m = process.memoryUsage(); return Math.round(m.heapUsed / 1024 / 1024); };

await section("register + lifecycle in Merkava VM", async () => {
	const heap0 = mem();
	const host = new ServiceWorkerHost({ cacheDir: path.join(tmp, "caches") });
	const reg = await host.register("https://example.com/sw.js", { scriptSource: SW_SOURCE, scope: "https://example.com/" });
	ok(reg.scope === "https://example.com/", "scope set");
	ok(reg.active && reg.active.state === "activated", "activated after lifecycle");
	// install handler ran inside the VM and populated the cache
	const cache = await host.cacheStorage.open("app-v1");
	const hit = await cache.match("/cached/index.html");
	ok(!!hit, "install cached /index.html");
	ok((await hit.text()) === "<h1>offline</h1>", "cached body correct");
	const hit2 = await cache.match("/app.js");
	ok(!!hit2 && (await hit2.text()) === "console.log(1)", "install cached /app.js via chained puts");
	const heap1 = mem();
	ok(heap1 - heap0 < 30, "heap growth sane (" + heap0 + "->" + heap1 + "MB)");
});

await section("fetch interception (offline, zero network)", async () => {
	const host = new ServiceWorkerHost({});
	host.fetchImpl = () => { throw new Error("NETWORK-USED"); };
	await host.register("https://example.com/sw.js", { scriptSource: SW_SOURCE, scope: "https://example.com/" });
	const r1 = await host.handleFetch({ url: "/cached/index.html", method: "GET" });
	ok(r1 && r1.status === 200, "cached fetch -> 200");
	ok(r1 && r1.body.toString("utf8") === "<h1>offline</h1>", "cached fetch body correct, no network");
	const r2 = await host.handleFetch({ url: "/sync-echo", method: "GET" });
	ok(r2 && r2.body.toString("utf8") === "echo-ok", "sync respondWith works");
	const r3 = await host.handleFetch({ url: "/not-handled", method: "GET" });
	ok(r3 === null, "unhandled fetch falls through (null)");
	const r4 = await host.handleFetch({ url: "https://other.com/cached/x", method: "GET" });
	ok(r4 === null, "out-of-scope falls through");
});

await section("push + sync + message", async () => {
	const host = new ServiceWorkerHost({});
	const reg = await host.register("https://example.com/sw.js", { scriptSource: SW_SOURCE, scope: "https://example.com/" });
	const p = await host.dispatchPush("https://example.com/", { title: "hi" });
	ok(p.ok, "push dispatched");
	const s = await host.dispatchSync("https://example.com/", "upload-queue");
	ok(s.ok, "sync dispatched");
	const rec = host.registrations.get("https://example.com/");
	ok(rec.self.__pushData === "got-push", "push handler ran in VM");
	ok(rec.self.__syncTag === "upload-queue", "sync handler got tag");
	const u = await reg.unregister();
	ok(u === true, "unregister works");
	const r = await host.handleFetch({ url: "/sync-echo" });
	ok(r === null, "no worker after unregister");
});

await section("cache persistence across restarts", async () => {
	const dir = path.join(tmp, "persist-caches");
	const h1 = new ServiceWorkerHost({ cacheDir: dir });
	await h1.register("https://example.com/sw.js", { scriptSource: SW_SOURCE, scope: "https://example.com/" });
	ok(await h1.persistCaches(), "persist ok");
	const h2 = new ServiceWorkerHost({ cacheDir: dir });
	ok(await h2.loadCaches(), "load ok");
	const c = await h2.cacheStorage.open("app-v1");
	const hit = await c.match("/cached/index.html");
	ok(!!hit && (await hit.text()) === "<h1>offline</h1>", "cache survives restart");
});

await section("crash in SW script is reported, not silent", async () => {
	const host = new ServiceWorkerHost({});
	let threw = false;
	try {
		await host.register("https://example.com/bad.js", { scriptSource: "this is not valid js ((((", scope: "https://example.com/" });
	} catch (e) { threw = true; }
	ok(threw, "invalid script rejects registration");
});

console.log(`\n==== ServiceWorker: ${pass} pass, ${fail} fail ====`);
if (fail) { console.log("FAILURES:", failures); process.exit(1); }
