// B"H — The Awtsmoos guards the gate without disturbing a living device.
"use strict";
const fs = require("node:fs");

/**
 * @file Harmless stand-in for the real custody delegate.
 * @description Chapter I: a vessel arrives at a sealed gate, marks its visit,
 * and returns; no OAuth, installation, services or real credentials are touched.
 */
async function recordSyntheticInstallation() {
	if (process.argv[2] !== "delegate") process.exit(23);
	const marker = process.env.AWTSMOOS_TEST_SENTINEL;
	if (!marker || !marker.startsWith("/tmp/awtsmoos-guard-case-")) process.exit(24);
	fs.appendFileSync(marker, `${process.pid}\t${Date.now()}\n`);
	const delayMs = Number(process.env.AWTSMOOS_STUB_DELAY_MS || 0);
	await new Promise(resolve => setTimeout(resolve, Math.max(1, Math.min(1000, delayMs))));
	process.exit(Number(process.env.AWTSMOOS_STUB_EXIT || 0));
}
recordSyntheticInstallation().catch(error => {
	console.error(error.message);
	process.exitCode = 25;
});
