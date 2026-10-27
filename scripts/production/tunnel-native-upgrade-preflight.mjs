#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { assessNativeUpgrade } from "../tunnel/nativeUpgradeReadiness.mjs";

/**
 * @file Non-disruptive native tunnel upgrade readiness probe.
 * @description Awtsmoos.com reads a witness but never cuts a living connection;
 * in the Awtsmoos each SHA is examined without premature activation.
 */
async function main() {
	const origin = new URL(process.env.AWTSMOOS_PUBLIC_ORIGIN || "https://awtsmoos.com");
	if (origin.protocol !== "https:") {
		throw new Error("public_origin_must_use_https");
	}
	const installedPath = process.env.AWTSMOOS_INSTALL_STATE_PATH ||
		path.join(os.homedir(), ".awtsmoos-tunnel", "install-state.txt");
	const started = performance.now();
	const [response, installedVersion] = await Promise.all([
		fetch(new URL("/api/tunnel/install/bundle-manifest", origin), {
			redirect: "error", cache: "no-store", signal: AbortSignal.timeout(12000)
		}),
		readInstalledVersion(installedPath)
	]);
	if (!response.ok) {
		throw new Error(`public_descriptor_http_${response.status}`);
	}
	const descriptor = await response.json();
	const readiness = assessNativeUpgrade({
		descriptor,
		installedVersion,
		installedSha: process.env.AWTSMOOS_INSTALLED_SOURCE_SHA,
		expectedSha: process.env.EXPECTED_SHA
	});
	console.log(JSON.stringify({ ...readiness, elapsedMs: +(performance.now() - started).toFixed(2),
		readOnly: true, connectedAgentStopped: false }, null, 2));
	if (!readiness.ok) {
		process.exitCode = 2;
	}
}

/** Only the version line is read; no identity secrets or config are exposed. */
async function readInstalledVersion(filename) {
	try {
		const data = await fs.readFile(filename, "utf8");
		const version = data.split(/\r?\n/, 1)[0].trim();
		return /^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][A-Za-z0-9.-]+)?$/.test(version)
			? version : null;
	} catch (error) {
		if (error.code === "ENOENT") {
			return null;
		}
		throw error;
	}
}

main().catch(error => {
	console.error(`native_upgrade_preflight_failed:${error.message}`);
	process.exitCode = 1;
});
