// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { runInstaller } = require("../installerProcess.cjs");
const { ReleaseServer } = require("../releaseServer.cjs");
const Context = require("../testContext.cjs");

/** B"H — A complete artifact must install, probe, and remain unstarted on request. */
async function run() {
	const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-install-fresh-"));
	const installRoot = path.join(temporaryRoot, "home", ".awtsmoos-tunnel");
	const server = new ReleaseServer(Context.REPOSITORY_ROOT);
	const origin = await server.start();
	try {
		const result = await runInstaller(
			Context.UNIX_BOOTSTRAP,
			Context.environment(origin, installRoot, temporaryRoot, {
				AWTSMOOS_SKIP_START: "1"
			}),
			temporaryRoot
		);
		assert.equal(result.status, 0, Context.combinedOutput(result));
		for (const relative of [
			"ai/relay/split-browser/controlPage.cjs",
			"awtsmoos-supervisor-runtime.sh"
		]) {
			assert.equal(fs.existsSync(path.join(installRoot, relative)), true);
		}
		for (const relative of [
			"bin/awtsmoos-recovery-rescue.sh",
			"bin/awtsmoos-recovery-candidates.sh"
		]) {
			assert.equal(fs.existsSync(path.join(`${installRoot}-recovery`, relative)), true);
		}
		assert.equal(fs.existsSync(path.join(installRoot, "agent.pid")), false);
		Context.assertProbePasses(installRoot);
		return {
			case: "fresh_install",
			version: fs.readFileSync(path.join(installRoot, "install-state.txt"), "utf8").trim(),
			consolePhases: Context.phaseLines(result.stdout)
		};
	} finally {
		await server.close();
		fs.rmSync(temporaryRoot, { recursive: true, force: true });
	}
}

module.exports = { run };
