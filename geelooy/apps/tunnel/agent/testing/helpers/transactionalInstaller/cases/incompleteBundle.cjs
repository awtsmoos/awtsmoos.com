// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { runInstaller } = require("../installerProcess.cjs");
const { ReleaseServer } = require("../releaseServer.cjs");
const Context = require("../testContext.cjs");

/** B"H — A missing startup dependency must fail before the live root changes. */
async function run() {
	const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-install-incomplete-"));
	const installRoot = path.join(temporaryRoot, "home", ".awtsmoos-tunnel");
	const sentinel = path.join(installRoot, "sentinel.txt");
	fs.mkdirSync(installRoot, { recursive: true });
	fs.writeFileSync(sentinel, "untouched-live-root\n");
	const server = new ReleaseServer(Context.REPOSITORY_ROOT, entry => (
		entry.path === "ai/relay/split-browser/controlPage.cjs" ? null : entry
	));
	const origin = await server.start();
	try {
		const result = await runInstaller(
			Context.UNIX_BOOTSTRAP,
			Context.environment(origin, installRoot, temporaryRoot, {
				AWTSMOOS_SKIP_START: "1"
			}),
			temporaryRoot
		);
		assert.notEqual(result.status, 0, Context.combinedOutput(result));
		assert.equal(fs.readFileSync(sentinel, "utf8"), "untouched-live-root\n");
		assert.equal(fs.existsSync(path.join(installRoot, "main.js")), false);
		assert.match(Context.combinedOutput(result), /preflight.*failed|runtime_manifest_missing/i);
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
