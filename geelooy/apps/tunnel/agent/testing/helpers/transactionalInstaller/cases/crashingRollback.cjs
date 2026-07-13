// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { runInstaller } = require("../installerProcess.cjs");
const { ReleaseServer } = require("../releaseServer.cjs");
const { RuntimeFixture } = require("../runtimeFixture.cjs");
const Context = require("../testContext.cjs");

/** B"H — A candidate that exits must yield the live path to its older version. */
async function run() {
	const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-install-rollback-"));
	const fixture = new RuntimeFixture(Context.REPOSITORY_ROOT, temporaryRoot);
	fixture.install("1.0.100");
	await fixture.start();
	const server = new ReleaseServer(Context.REPOSITORY_ROOT, entry => (
		entry.path === "main.js"
			? { path: entry.path, data: Buffer.from('// B"H\nprocess.exit(17);\n') }
			: entry
	));
	const origin = await server.start();
	try {
		const result = await runInstaller(
			Context.UNIX_BOOTSTRAP,
			Context.environment(origin, fixture.runtimeRoot, temporaryRoot, {
				AWTSMOOS_RECOVERY_ROOT: fixture.recoveryRoot,
				AWTSMOOS_STARTUP_TIMEOUT_SECONDS: "12",
				AWTSMOOS_ROLLBACK_TIMEOUT_SECONDS: "12"
			}),
			temporaryRoot
		);
		assert.notEqual(result.status, 0, Context.combinedOutput(result));
		await fixture.waitForAgent(15000);
		assert.equal(read(fixture.runtimeRoot, "install-state.txt").trim(), "1.0.100");
		assert.equal(read(fixture.runtimeRoot, "sentinel.txt"), "older-runtime\n");
		assert.equal(fs.readdirSync(path.join(fixture.recoveryRoot, "versions")).length >= 1, true);
		const journal = JSON.parse(read(fixture.recoveryRoot, "transactions/install-current.json"));
		assert.equal(journal.phase, "rolled_back");
		assert.match(Context.combinedOutput(result), /rollback.*passed/i);
		return {
			case: "crashing_update_rolled_back",
			status: result.status,
			restoredVersion: "1.0.100",
			journalPhase: journal.phase,
			consolePhases: Context.phaseLines(result.stdout)
		};
	} finally {
		fixture.stop();
		await server.close();
		await Context.delay(1500);
		Context.terminateReceiptProcess(fixture.runtimeRoot, "agent.pid");
		Context.terminateReceiptProcess(fixture.runtimeRoot, "supervisor.pid");
		fs.rmSync(temporaryRoot, { recursive: true, force: true });
	}
}

function read(root, relative) {
	return fs.readFileSync(path.join(root, relative), "utf8");
}

module.exports = { run };
