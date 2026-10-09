// B"H — Load 5 real Awtsmoos pages in the Merkava browser and screenshot each.
// Fetches over DirectNet (CORS-free native semantics), renders through the
// real Merkava pipeline, captures PNG + heap metrics per page.
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { DirectNet } = require("./DirectNet.js");
const autoShot = await import(
	"../merkava-service/snapshots/autoScreenshot.js"
);

const PAGES = [
	["awts-01-home", "https://awtsmoos.com/"],
	["awts-02-example", "https://example.com"],
	["awts-03-httpbin", "https://httpbin.org/html"],
	["awts-04-iana", "https://www.iana.org/"],
	["awts-05-w3c", "https://www.w3.org/"]
];

let pass = 0, fail = 0;
for (const [label, url] of PAGES) {
	try {
		const before = process.memoryUsage().heapUsed;
		const res = await DirectNet.directFetch(url, { timeoutMs: 25000 });
		if (!res.ok) throw new Error("HTTP " + res.status);
		let html = res.body.toString("utf8");
		if (html.length > 200000) {
			html = html.slice(0, 200000);
			console.log("  (truncated to 200KB for render)");
		}
		const shot = autoShot.screenshotHtml(html, { width: 900, height: 700 }, label);
		const after = process.memoryUsage().heapUsed;
		const heapMB = (after / 1024 / 1024).toFixed(1);
		const deltaKB = ((after - before) / 1024).toFixed(0);
		console.log(`PASS ${label}: ${url} -> ${res.status}, ${res.body.length} bytes, ` +
			`shot=${shot.screenshotUri} heap=${heapMB}MB delta=${deltaKB}KB`);
		pass++;
	} catch (e) {
		console.log(`FAIL ${label}: ${url} — ${e.message}`);
		fail++;
	}
}
console.log(`\nB"H — ${pass} pages rendered, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
