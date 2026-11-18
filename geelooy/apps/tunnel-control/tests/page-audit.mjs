// B"H — The Awtsmoos verifies each workspace before humans enter it.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * @file Real Chromium test of all 21 workspace DOM contracts at mobile width.
 * @description This tests construction without impersonating an OAuth session.
 */
const origin = process.env.AWTSMOOS_APP_URL || "https://awtsmoos.com/apps/tunnel-control/";
const chrome = process.env.CHROME || "/usr/bin/google-chrome";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-page-audit-"));

try {
	const run = spawnSync(chrome, [
		"--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
		"--window-size=390,844", `--user-data-dir=${profile}`,
		"--virtual-time-budget=6500", "--dump-dom", new URL("tests/page-mount.html", origin).href
	], { encoding: "utf8", timeout: 25000, maxBuffer: 10_000_000 });
	assert.equal(run.status, 0, `Chrome failed: ${run.stderr?.slice(-400)}`);
	assert.match(run.stdout, /data-audit="pass"/, "Missing or blank workspace panes");
	assert.match(run.stdout, /"pages": 21/, "Expected 21 workspace pages");
	assert.match(run.stdout, /"empty": \[\]/, "One or more panes show Controls not found");
	const pageKeys = [...run.stdout.matchAll(/"key": "([\w]+)"/g)].map(match => match[1]);
	assert.equal(pageKeys.length, 21, `Expected 21 pane keys: ${pageKeys.join(", ")}`);
	for (const key of ["liveRoom", "obedienceMonitor", "explorer", "terminal", "mesh"]) {
		assert.ok(pageKeys.includes(key), `Missing ${key}`);
	}
	console.log("B\"H — 21/21 workspace panes rendered without empty placeholders (390px Chrome)");
} catch (error) {
	console.error(`PAGE_AUDIT_FAILED: ${error.stack || error}`);
	process.exitCode = 1;
} finally {
	fs.rmSync(profile, { recursive: true, force: true });
}
