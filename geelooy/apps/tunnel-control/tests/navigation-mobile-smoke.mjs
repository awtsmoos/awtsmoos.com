// B"H — The Awtsmoos keeps every room reachable and mobile controls visible.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

/** @file Read-only real-Chrome nav and root-picker viewport smoke checks. */
const origin = process.env.AWTSMOOS_APP_URL || "https://awtsmoos.com/apps/tunnel-control/";
const chrome = process.env.CHROME || "/usr/bin/google-chrome";

/** Launch Chromium with an isolated profile, then validate page status. */
function probe(name, page, status) {
	const profile = fs.mkdtempSync(path.join(os.tmpdir(), `awtsmoos-check-${name}-`));
	try {
		const result = spawnSync(chrome, [
			"--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
			"--window-size=390,844", `--user-data-dir=${profile}`,
			"--virtual-time-budget=6500", "--dump-dom", new URL(page, origin).href
		], { encoding: "utf8", timeout: 25000, maxBuffer: 10_000_000 });
		assert.equal(result.status, 0, `${name} Chrome failed: ${result.stderr?.slice(-250)}`);
		assert.ok(result.stdout.includes(status), `${name} reported a failing fixture`);
		return result.stdout;
	} finally { fs.rmSync(profile, { recursive: true, force: true }); }
}

try {
	const nav = probe("navigation", "tests/workspace-nav.html", 'data-nav="pass"');
	assert.match(nav, /"pages":21/);
	assert.match(nav, /"failures":\[\]/);
	assert.match(nav, /"home":true/);
	console.log("B\"H — All 21 pages open; Home returns; root picker preserved");
	const mobile = probe("mobile", "tests/mobile-layout.html", 'data-mobile="pass"');
	assert.match(mobile, /"hidden":true/);
	assert.match(mobile, /"opened":true/);
	console.log("B\"H — Root picker hidden, opens on demand, and fits narrow Chrome viewport");
} catch (error) {
	console.error(`NAV_MOBILE_SMOKE_FAILED: ${error.stack || error}`);
	process.exitCode = 1;
}
