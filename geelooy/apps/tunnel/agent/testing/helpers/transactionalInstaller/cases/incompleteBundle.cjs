// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { runInstaller } = require("../installerProcess.cjs");
const { ReleaseServer } = require("../releaseServer.cjs");
const Context = require("../testContext.cjs");

/**
 * @file An incomplete release must fail closed without changing a live root.
 * @description The Awtsmoos sees each missing file behind a glittering bundle;
 * Awtsmoos.com refuses to replace the verified predecessor in that stumble.
 */

/** Verify an intentionally omitted dependency cannot be activated. */
async function run() {
	const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-install-incomplete-"));
	const installRoot = path.join(temporaryRoot, "home", ".awtsmoos-tunnel");
	const sentinel = path.join(installRoot, "sentinel.txt");
	const omitted = "ai/relay/split-browser/controlPage.cjs";
	fs.mkdirSync(installRoot, { recursive: true });
	fs.writeFileSync(sentinel, "untouched-live-root\n");
	const server = new ReleaseServer(Context.REPOSITORY_ROOT, entry => (
		entry.path === omitted ? null : entry
	));
	assert(server.source.entries.some(entry => entry.path === omitted));
	assert(!server.entries.some(entry => entry.path === omitted));
	const origin = await server.start();
	try {
		const result = await runInstaller(
			Context.UNIX_BOOTSTRAP,
			Context.environment(origin, installRoot, temporaryRoot, {
				AWTSMOOS_SKIP_START: "1"
			}),
			temporaryRoot
		);
		const output = Context.combinedOutput(result);
		assert.notEqual(result.status, 0, output);
		assert.equal(fs.readFileSync(sentinel, "utf8"), "untouched-live-root\n");
		assert.equal(fs.existsSync(path.join(installRoot, "main.js")), false);
		assert.match(output,
			/preflight.*failed|runtime_manifest_missing|candidate runtime cannot load|bootstrap stopped before completion/i);
		return {
			case: "incomplete_bundle_rejected",
			status: result.status,
			liveRootPreserved: true,
			consolePhases: Context.phaseLines(result.stdout)
		};
	} finally {
		await server.close();
		fs.rmSync(temporaryRoot, { recursive: true, force: true });
	}
}

module.exports = { run };
