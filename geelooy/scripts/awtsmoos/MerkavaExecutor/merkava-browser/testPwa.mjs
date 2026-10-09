// B"H — PwaManager tests: manifest parsing, installability, install flow,
// display modes, splash spec, beforeinstallprompt, uninstall.
// Run: node testPwa.mjs
import { createRequire } from "module";
import fs from "fs";
import os from "os";
import path from "path";

const require = createRequire(import.meta.url);
const { PwaManager } = require("./PwaManager.js");

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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pwa-test-"));
const mgr = () => new PwaManager({ dir: path.join(tmp, "apps-" + Math.random().toString(36).slice(2)) });

const GOOD_MANIFEST = {
	name: "Awtsmoos Reader", short_name: "Reader",
	start_url: "/reader/", scope: "https://awtsmoos.com/reader/",
	display: "standalone", theme_color: "#1a1a2e", background_color: "#ffffff",
	icons: [
		{ src: "/icon-192.png", sizes: "192x192", type: "image/png" },
		{ src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
	]
};

await section("parseManifest", async () => {
	const m = new PwaManager({ dir: tmp });
	const p = m.parseManifest(JSON.stringify(GOOD_MANIFEST));
	ok(p.name === "Awtsmoos Reader", "name");
	ok(p.display === "standalone", "display kept");
	ok(p.icons.length === 2, "icons kept");
	const bad = m.parseManifest('{"display":"weird","icons":[{"sizes":"16x16"}]}');
	ok(bad.display === "browser", "bad display falls back to browser");
	ok(bad.icons.length === 0, "icon without src dropped");
	let threw = false;
	try { m.parseManifest("{not json"); } catch (e) { threw = true; }
	ok(threw, "invalid JSON throws");
});

await section("checkInstallable", async () => {
	const m = new PwaManager({ dir: tmp });
	const good = m.checkInstallable({ manifest: GOOD_MANIFEST, hasServiceWorker: true });
	ok(good.installable && good.reasons.length === 0, "good manifest installable: " + JSON.stringify(good.reasons));
	const noSw = m.checkInstallable({ manifest: GOOD_MANIFEST, hasServiceWorker: false });
	ok(!noSw.installable && noSw.reasons.some(r => r.includes("service worker")), "no SW -> not installable");
	const noIcon = m.checkInstallable({ manifest: Object.assign({}, GOOD_MANIFEST, { icons: [] }), hasServiceWorker: true });
	ok(!noIcon.installable, "no icons -> not installable");
	const noName = m.checkInstallable({ manifest: { start_url: "/", icons: GOOD_MANIFEST.icons }, hasServiceWorker: true });
	ok(!noName.installable, "no name -> not installable");
});

await section("install / list / launch / uninstall", async () => {
	const m = mgr();
	const app = await m.install({ manifest: GOOD_MANIFEST, manifestUrl: "https://awtsmoos.com/manifest.json", startUrl: "https://awtsmoos.com/reader/" });
	ok(app.id && app.id.startsWith("merkava-"), "app id assigned");
	ok(app.name === "Awtsmoos Reader", "app stored");
	const list = m.listInstalled();
	ok(list.length === 1 && list[0].id === app.id, "listInstalled");
	const cfg = m.launchConfig(app.id);
	ok(cfg.display === "standalone" && cfg.chrome === "none" && cfg.standalone === true, "standalone launch config");
	ok(cfg.startUrl === "https://awtsmoos.com/reader/", "start URL");
	const splash = m.splashSpec(app.id);
	ok(splash.backgroundColor === "#ffffff" && splash.icon === "/icon-512.png", "splash picks largest icon: " + splash.icon);
	m.recordLaunch(app.id);
	ok(m.getApp(app.id).launchCount === 1, "launch counted");
	// second manager instance reads the same dir
	const m2 = new PwaManager({ dir: m.dir });
	ok(m2.listInstalled().length === 1, "install persists across instances");
	ok(m.uninstall(app.id) === true, "uninstall");
	ok(m.listInstalled().length === 0, "gone after uninstall");
});

await section("display modes", async () => {
	const m = mgr();
	const full = await m.install({ manifest: Object.assign({}, GOOD_MANIFEST, { display: "fullscreen" }), startUrl: "https://x.com/" });
	ok(m.launchConfig(full.id).fullscreen === true, "fullscreen mode");
	const mini = await m.install({ manifest: Object.assign({}, GOOD_MANIFEST, { display: "minimal-ui" }), startUrl: "https://y.com/" });
	ok(m.launchConfig(mini.id).chrome === "minimal", "minimal-ui chrome");
});

await section("beforeinstallprompt flow", async () => {
	const m = mgr();
	const ip = m.createInstallPrompt({ manifest: GOOD_MANIFEST, startUrl: "https://awtsmoos.com/reader/" });
	const { outcome, app } = await ip.prompt(true);
	ok(outcome === "accepted" && app && app.name === "Awtsmoos Reader", "accepted installs");
	const ip2 = m.createInstallPrompt({ manifest: GOOD_MANIFEST, startUrl: "https://z.com/" });
	const r2 = await ip2.prompt(false);
	ok(r2.outcome === "dismissed" && r2.app === null, "dismissed installs nothing");
	ok(m.listInstalled().length === 1, "only the accepted app installed");
});

await section("storage estimate is tiny", async () => {
	const m = mgr();
	await m.install({ manifest: GOOD_MANIFEST, startUrl: "https://a.com/" });
	const est = m.storageEstimate();
	ok(est.bytes < 64 * 1024, "app record is KBs, not MBs (" + est.bytes + " bytes)");
});

console.log(`\n==== PWA: ${pass} pass, ${fail} fail ====`);
if (fail) { console.log("FAILURES:", failures); process.exit(1); }
