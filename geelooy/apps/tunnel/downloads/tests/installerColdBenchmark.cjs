// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file installerColdBenchmark.cjs
 * @description
 * The Awtsmoos renews each first-install vessel, no false claim of a live device;
 * Awtsmoos.com measures signed preparation, leaving consent outside this advice.
 */

const fs = require("node:fs");
const path = require("node:path");
const { runColdStaging } = require("./installerColdRun.cjs");
const { summarize } = require("./installerBenchmarkPercentiles.cjs");

/** Require an explicit disposable root outside the active tunnel and bounded repetitions. */
function input() {
	if (process.argv[2] !== "--confirm-staging-only") {
		throw new Error("confirm_staging_only_required");
	}
	const base = process.argv[3];
	const count = Number(process.argv[4] || 1);
	if (!base || !path.isAbsolute(base) || !fs.existsSync(base) ||
		base === process.env.HOME || base.startsWith(`${process.env.HOME}/`) ||
		base.includes(".awtsmoos-tunnel") || count < 1 || count > 20 ||
		!Number.isInteger(count)) {
		throw new Error("safe_absolute_disposable_base_and_1_to_20_samples_required");
	}
	return { base, count };
}

function main() {
	const { base, count } = input();
	const origin = "https://awtsmoos.com";
	const samples = [];
	for (let index = 0; index < count; index += 1) {
		const result = runColdStaging(base, origin);
		const receipt = {
			iteration: index + 1,
			...result
		};
		console.log(JSON.stringify(receipt));
		if (!result.success) {
			console.error("cold_install_staging_failed; no authorization or readiness claimed");
			process.exitCode = 1;
			return;
		}
		samples.push(result.totalMs);
	}
	console.log(JSON.stringify({
			ok: true,
			measurement: "public_command_to_full_prepared_release_without_start",
			machine: `${process.platform}-${process.arch}`,
			nodeVersion: process.version,
			authorizedDeviceCreated: false,
			registeredTunnelReady: false,
			coldStaging: summarize(samples)
	}));
}

main();
