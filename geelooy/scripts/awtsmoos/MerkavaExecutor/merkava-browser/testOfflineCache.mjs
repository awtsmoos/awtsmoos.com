// B"H — OfflinePageCache tests
import pkg from "./OfflinePageCache.js";
const { OfflinePageCache } = pkg;
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let pass = 0, fail = 0;
function ok(name, cond) {
	if (cond) { pass++; console.log("  PASS " + name); }
	else { fail++; console.log("  FAIL " + name); }
}

// Fake fetch: online mode returns a Response-like; offline mode throws.
function fakeFetch(map, online) {
	return async (url) => {
		if (!online) throw new Error("network down");
		const body = map[url];
		if (body === undefined) throw new Error("404");
		return {
			status: 200,
			headers: { forEach(cb) { cb("text/html", "content-type"); } },
			arrayBuffer: async () => Buffer.from(body, "utf8"),
		};
	};
}

console.log("OfflinePageCache tests");

// 1. Online fetch stores; offline serves from cache.
{
	const c = new OfflinePageCache();
	const pages = { "https://ex.com/": "<h1>hi</h1>" };
	const r1 = await c.fetchWithCache("https://ex.com/", fakeFetch(pages, true));
	ok("online fetch not from cache", r1.fromCache === false);
	ok("online fetch data", r1.data.toString() === "<h1>hi</h1>");
	const r2 = await c.fetchWithCache("https://ex.com/", fakeFetch(pages, false));
	ok("offline serves from cache", r2.fromCache === true);
	ok("offline data intact", r2.data.toString() === "<h1>hi</h1>");
}

// 2. Missing page offline throws.
{
	const c = new OfflinePageCache();
	let threw = false;
	try { await c.fetchWithCache("https://nope.test/", fakeFetch({}, false)); }
	catch (e) { threw = /no cached copy/.test(e.message); }
	ok("offline miss throws clear error", threw);
}

// 3. putPage/getPage round-trip with resources.
{
	const c = new OfflinePageCache();
	c.putPage("https://ex.com/a", "<html><link></html>", {
		"https://ex.com/s.css": { data: "body{color:red}", mime: "text/css" },
		"https://ex.com/app.js": { data: "console.log(1)", mime: "text/javascript" },
	});
	const p = c.getPage("https://ex.com/a");
	ok("page html round-trip", p && p.html === "<html><link></html>");
	ok("css resource kept", p.resources["https://ex.com/s.css"].data.toString() === "body{color:red}");
	ok("js resource kept", p.resources["https://ex.com/app.js"].data.toString() === "console.log(1)");
}

// 4. Dedup: identical content stored once.
{
	const c = new OfflinePageCache();
	c.put("https://a.test/1", "same-bytes", "text/plain");
	c.put("https://a.test/2", "same-bytes", "text/plain");
	ok("dedup blobs==1", c.blobs.size === 1);
	ok("dedup bytes counted once", c.bytesUsed === Buffer.byteLength("same-bytes"));
}

// 5. LRU eviction under cap.
{
	const c = new OfflinePageCache({ maxBytes: 100 });
	c.put("https://a.test/old", "x".repeat(60), "text/plain");
	await new Promise(r => setTimeout(r, 5));
	c.put("https://a.test/new", "y".repeat(60), "text/plain");
	ok("eviction happened", c.stats.evictions >= 1);
	ok("old evicted, new kept", !c.has("https://a.test/old") && c.has("https://a.test/new"));
	ok("bytes under cap", c.bytesUsed <= 100);
}

// 6. Disk persistence round-trip.
{
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "merkava-offline-"));
	const c = new OfflinePageCache({ persistPath: dir });
	c.put("https://ex.com/", "<h1>persisted</h1>", "text/html");
	c.putPage("https://ex.com/p", "<p>page</p>", { "https://ex.com/c.css": { data: "a{}", mime: "text/css" } });
	ok("persist ok", await c.persist());
	const c2 = new OfflinePageCache({ persistPath: dir });
	ok("load ok", await c2.load());
	const r = c2.get("https://ex.com/");
	ok("persisted entry loads", r && r.data.toString() === "<h1>persisted</h1>");
	const p = c2.getPage("https://ex.com/p");
	ok("persisted page loads", p && p.html === "<p>page</p>");
	ok("persisted resource loads", p.resources["https://ex.com/c.css"].data.toString() === "a{}");
	fs.rmSync(dir, { recursive: true, force: true });
}

// 7. Stats.
{
	const c = new OfflinePageCache();
	c.put("https://a.test/", "z", "text/plain");
	c.get("https://a.test/");
	c.get("https://missing.test/");
	const s = c.getStats();
	ok("stats hits", s.hits === 1);
	ok("stats misses", s.misses === 1);
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
