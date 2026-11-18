// B"H — The Awtsmoos shows working controls, not an empty facade.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** @file Chrome smoke tests for public login, pairing, and Live Agent Room DOM. */
const appRoot = fileURLToPath(new URL("../", import.meta.url));
const chrome = process.env.CHROME || "/usr/bin/google-chrome";
const base = process.env.AWTSMOOS_APP_URL || "https://awtsmoos.com/apps/tunnel-control/";

/** Create a disposable browser profile and extract real rendered HTML. */
function render(url, scene) {
	const profile = fs.mkdtempSync(path.join(os.tmpdir(), `awtsmoos-smoke-${scene}-`));
	try {
		const result = spawnSync(chrome, [
			"--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
			"--window-size=390,844", `--user-data-dir=${profile}`,
			"--virtual-time-budget=5000", "--dump-dom", url
		], { encoding: "utf8", timeout: 20000, maxBuffer: 10_000_000 });
		assert.equal(result.status, 0, `Chrome ${scene}: ${result.stderr?.slice(-400)}`);
		return result.stdout;
	} finally { fs.rmSync(profile, { recursive: true, force: true }); }
}

/** Check visible navigation entry flows without sending pairing approvals. */
function main() {
	assert.equal(path.basename(appRoot), "tunnel-control");
	for (const scene of [
		["login", "", "Continue to secure login"],
		["manual", "?pairing=manual", "Enter your pairing code"],
		["code", "?pairingCode=TEST1234", "Approve this device?"]
	]) {
		const dom = render(`${base}${scene[1]}`, scene[0]);
		assert.ok(dom.includes(scene[2]), `${scene[0]} missing controls`);
		assert.ok(!dom.includes("Preparing secure pairing"), "Pairing stuck loading");
		console.log(`B\"H — ${scene[0]} 390px Chrome: PASS`);
	}
	const html = fs.readFileSync(new URL("./browser-compat.html", import.meta.url), "utf8");
	const filename = `__awtsmoos_smoke_${process.pid}_${Date.now()}.html`;
	const pathname = path.join(appRoot, filename);
	fs.writeFileSync(pathname, html, { flag: "wx", mode: 0o644 });
	try {
		const dom = render(new URL(filename, base).href, "liveRoom");
		assert.match(dom, /data-status="pass"/, "Live Room controls missing");
		console.log("B\"H — Eight Live Room controls and event handler: PASS");
	} finally { fs.unlinkSync(pathname); }
}

try { main(); }
catch (error) { console.error(`UI_SMOKE_FAIL: ${error.stack || error}`); process.exitCode = 1; }
