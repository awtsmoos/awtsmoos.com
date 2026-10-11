// B"H — ExtensionHost tests: manifest validation, match patterns, CRX
// parsing, background in Merkava VM, content scripts, chrome.* APIs.
// Run: node testExtensions.mjs
import { createRequire } from "module";
import fs from "fs";
import os from "os";
import path from "path";
import zlib from "zlib";

const require = createRequire(import.meta.url);
const { ExtensionHost, validateManifest, urlMatches, parseCrx } = require("./ExtensionHost.js");

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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ext-test-"));

// Build a minimal CRX3 in-memory: header + stored zip with manifest.json.
function makeZip(files) {
	const parts = [];
	const central = [];
	let offset = 0;
	for (const [name, data] of Object.entries(files)) {
		const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), "utf8");
		const nameBuf = Buffer.from(name, "utf8");
		const lh = Buffer.alloc(30);
		lh.writeUInt32LE(0x04034b50, 0);
		lh.writeUInt16LE(20, 4);
		lh.writeUInt16LE(0, 8); // stored
		lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0, 12);
		lh.writeUInt32LE(buf.length, 18); lh.writeUInt32LE(buf.length, 22);
		lh.writeUInt16LE(nameBuf.length, 26); lh.writeUInt16LE(0, 28);
		parts.push(lh, nameBuf, buf);
		central.push({ nameBuf, size: buf.length, offset });
		offset += 30 + nameBuf.length + buf.length;
	}
	const cdStart = offset;
	const cdParts = [];
	for (const c of central) {
		const ch = Buffer.alloc(46);
		ch.writeUInt32LE(0x02014b50, 0);
		ch.writeUInt16LE(20, 6);
		ch.writeUInt16LE(0, 10);
		ch.writeUInt32LE(c.size, 24); ch.writeUInt32LE(c.size, 28);
		ch.writeUInt16LE(c.nameBuf.length, 30);
		ch.writeUInt32LE(c.offset, 42);
		cdParts.push(ch, c.nameBuf);
	}
	const cdBuf = Buffer.concat(cdParts);
	const eocd = Buffer.alloc(22);
	eocd.writeUInt32LE(0x06054b50, 0);
	eocd.writeUInt16LE(central.length, 8); eocd.writeUInt16LE(central.length, 10);
	eocd.writeUInt32LE(cdBuf.length, 12); eocd.writeUInt32LE(cdStart, 16);
	return Buffer.concat([...parts, cdBuf, eocd]);
}
function makeCrx3(files) {
	const zip = makeZip(files);
	const header = Buffer.from(JSON.stringify({})); // empty crx header
	const out = Buffer.alloc(12 + header.length + zip.length);
	out.write("Cr24", 0, "ascii");
	out.writeUInt32LE(3, 4);
	out.writeUInt32LE(header.length, 8);
	header.copy(out, 12);
	zip.copy(out, 12 + header.length);
	return out;
}

const MANIFEST_V3 = {
	manifest_version: 3, name: "Test Ext", version: "1.0",
	background: { service_worker: "bg.js" },
	action: { default_popup: "popup.html", default_title: "Test" },
	content_scripts: [{ matches: ["*://*.example.com/*"], js: ["cs.js"], run_at: "document_idle" }],
	permissions: ["storage", "alarms"]
};
const MANIFEST_V2 = {
	manifest_version: 2, name: "Old Ext", version: "2.0",
	background: { scripts: ["bg2.js"] },
	browser_action: { default_popup: "popup.html" },
	content_scripts: [{ matches: ["https://example.com/*"], js: ["cs2.js"] }]
};
const BG_JS = `
chrome.storage.local.set({ installed: true, count: 41 });
chrome.alarms.create('tick', { delayInMinutes: 0.001 });
chrome.alarms.onAlarm.addListener(function(alarm) {
  chrome.storage.local.get('count', function(res) {
    chrome.storage.local.set({ count: res.count + 1 });
  });
});
self.__bgRan = 'yes';
`;
const CS_JS = `document.title = 'injected';`;

await section("manifest validation", async () => {
	const v3 = validateManifest(MANIFEST_V3);
	ok(v3.ok && v3.manifestVersion === 3, "v3 valid");
	const v2 = validateManifest(MANIFEST_V2);
	ok(v2.ok && v2.manifestVersion === 2, "v2 valid");
	const bad = validateManifest({ name: "x" });
	ok(!bad.ok && bad.errors.length >= 2, "missing version rejected: " + bad.errors.join("|"));
	const bad3 = validateManifest({ manifest_version: 3, name: "x", version: "1", background: { scripts: ["a.js"] } });
	ok(!bad3.ok, "mv3 with background.scripts rejected");
});

await section("match patterns", async () => {
	ok(urlMatches("https://sub.example.com/page", ["*://*.example.com/*"]), "wildcard subdomain");
	ok(urlMatches("https://example.com/page", ["*://*.example.com/*"]), "bare domain matches *.");
	ok(!urlMatches("https://evil.com/", ["*://*.example.com/*"]), "other domain rejected");
	ok(urlMatches("https://anything.com/x", ["<all_urls>"]), "<all_urls>");
	ok(urlMatches("https://example.com/a", ["https://example.com/*"]), "exact host prefix");
	ok(!urlMatches("http://example.com/a", ["https://example.com/*"]), "scheme must match");
});

await section("load unpacked + background in Merkava VM", async () => {
	const host = new ExtensionHost({ dataDir: path.join(tmp, "extdata") });
	const ext = await host.loadManifestFiles(MANIFEST_V3, {
		"manifest.json": JSON.stringify(MANIFEST_V3),
		"bg.js": BG_JS, "cs.js": CS_JS, "popup.html": "<h1>popup</h1>"
	});
	ok(ext.id && ext.id.length >= 8, "extension id assigned");
	const res = await host.startBackground(ext.id);
	ok(res.length === 1 && res[0].ok, "background ran in VM: " + JSON.stringify(res));
	// chrome.storage.local written by the VM-run background script
	const got = await ext._chrome.storage.local.get("installed");
	ok(got.installed === true, "VM background wrote chrome.storage.local");
	const count = await ext._chrome.storage.local.get("count");
	ok(count.count === 41, "storage value correct");
	// storage persists to disk
	const raw = JSON.parse(fs.readFileSync(path.join(tmp, "extdata", ext.id, "storage-local.json"), "utf8"));
	ok(raw.installed === true, "storage persisted to disk");
});

await section("content scripts + action metadata", async () => {
	const host = new ExtensionHost({ dataDir: path.join(tmp, "extdata2") });
	const ext = await host.loadManifestFiles(MANIFEST_V3, { "manifest.json": JSON.stringify(MANIFEST_V3), "cs.js": CS_JS });
	const css = host.getContentScriptsForUrl(ext.id, "https://sub.example.com/article");
	ok(css.length === 1 && css[0].js.length === 1, "content script matches subdomain");
	ok(css[0].js[0].includes("injected"), "content script source returned");
	const none = host.getContentScriptsForUrl(ext.id, "https://other.org/");
	ok(none.length === 0, "no match on other domain");
	const action = host.getAction(ext.id);
	ok(action && action.defaultPopup === "popup.html", "action popup metadata");
	const page = host.getExtensionPage(ext.id, "popup.html");
	ok(page === null, "missing page returns null (fixture has none)");
});

await section("CRX3 parsing + load", async () => {
	const crx = makeCrx3({
		"manifest.json": JSON.stringify(MANIFEST_V2),
		"bg2.js": "self.__v2bg = 1;",
		"cs2.js": CS_JS
	});
	const host = new ExtensionHost({ dataDir: path.join(tmp, "extdata3") });
	const ext = await host.loadCrx(crx);
	ok(ext.manifest.name === "Old Ext", "CRX manifest parsed");
	ok(ext.manifest.manifest_version === 2, "CRX mv2");
	const res = await host.startBackground(ext.id);
	ok(res.length === 1 && res[0].ok, "v2 background scripts run");
	const list = host.listExtensions();
	ok(list.length === 1 && list[0].name === "Old Ext", "listExtensions");
	ok(host.unloadExtension(ext.id) === true, "unload works");
	ok(host.listExtensions().length === 0, "unloaded gone");
});

await section("chrome.alarms + notifications + tabs", async () => {
	const host = new ExtensionHost({ dataDir: path.join(tmp, "extdata4") });
	const ext = await host.loadManifestFiles(MANIFEST_V3, { "manifest.json": JSON.stringify(MANIFEST_V3) });
	const chrome = ext._chrome;
	let alarmFired = null;
	chrome.alarms.onAlarm.addListener(a => { alarmFired = a.name; });
	chrome.alarms.create("quick", { when: Date.now() + 60 });
	await new Promise(r => setTimeout(r, 250));
	ok(alarmFired === "quick", "alarm fired");
	const nid = await chrome.notifications.create({ title: "t", message: "m" });
	ok(typeof nid === "string", "notification created");
	const all = await chrome.notifications.getAll();
	ok(all[nid] && all[nid].title === "t", "notification listed");
	const tabs = await chrome.tabs.query({});
	ok(Array.isArray(tabs), "tabs.query works");
	const tab = await chrome.tabs.create({ url: "https://example.com/" });
	ok(tab.url === "https://example.com/", "tabs.create works");
	await chrome.tabs.remove(tab.id);
	const tabs2 = await chrome.tabs.query({});
	ok(tabs2.length === 0, "tabs.remove works");
	let badge = null;
	await chrome.action.setBadgeText({ text: "5" });
	badge = await chrome.action.getBadgeText({});
	ok(badge === "5", "badge text round-trips");
});

console.log(`\n==== Extensions: ${pass} pass, ${fail} fail ====`);
if (fail) { console.log("FAILURES:", failures); process.exit(1); }
