// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { runInstaller } = require("../installerProcess.cjs");
const { ReleaseServer } = require("../releaseServer.cjs");
const { RuntimeFixture } = require("../runtimeFixture.cjs");
const Context = require("../testContext.cjs");
const Diagnostics = require("./crashingRollbackDiagnostics.cjs");

/**
 * @file Proves a candidate startup crash restores and then fully tears down its world.
 * @description
 * The Awtsmoos renews predecessor after real failure, then renews the test machine by
 * ending every exact-root agent and supervisor. Awtsmoos.com calls rollback complete
 * only when exact identity, registration, journal, and process cleanup all agree.
 */
async function run() {
	const temporaryRoot = fs.mkdtempSync(
		path.join(os.tmpdir(), "awts-install-rollback-")
	);
	const fixture = new RuntimeFixture(Context.REPOSITORY_ROOT, temporaryRoot);
	fixture.install("1.0.100");
	await fixture.start();
	const server = new ReleaseServer(Context.REPOSITORY_ROOT, entry => (
		entry.path === "main.js"
			? { path: entry.path, data: Buffer.from(crashingMainSource()) }
			: entry
	));
	const origin = await server.start();
	let result = null;
	try {
		result = await runInstaller(
			Context.UNIX_BOOTSTRAP,
			Context.environment(origin, fixture.runtimeRoot, temporaryRoot, {
				AWTSMOOS_RECOVERY_ROOT: fixture.recoveryRoot,
				AWTSMOOS_STARTUP_TIMEOUT_SECONDS: "24",
				AWTSMOOS_ROLLBACK_TIMEOUT_SECONDS: "24",
				AWTSMOOS_REGISTRATION_TIMEOUT_SECONDS: "8",
				AWTSMOOS_STABILITY_SECONDS: "3"
			}),
			temporaryRoot
		);
		assert.equal(result.status, 0, Context.combinedOutput(result));
		await requireRegisteredFixture(fixture, result);
		verifyExactPredecessor(fixture, result);
		const journal = JSON.parse(Diagnostics.read(
			fixture.recoveryRoot,
			"transactions/install-current.json"
		));
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
		await server.close();
		await fixture.stop();
		fs.rmSync(temporaryRoot, { recursive: true, force: true });
	}
}

async function requireRegisteredFixture(fixture, result) {
	try {
		await fixture.waitForAgent(25000);
	} catch (error) {
		throw new Error(Diagnostics.build(fixture, result, error));
	}
}

function verifyExactPredecessor(fixture, result) {
	const version = Diagnostics.read(
		fixture.runtimeRoot,
		"install-state.txt"
	).trim();
	const sentinel = Diagnostics.read(fixture.runtimeRoot, "sentinel.txt");
	if (version !== "1.0.100" || sentinel !== "older-runtime\n") {
		throw new Error(Diagnostics.build(
			fixture,
			result,
			new Error(`exact_predecessor_identity_lost version=${version} sentinel=${sentinel}`)
		));
	}
	const versions = path.join(fixture.recoveryRoot, "versions");
	assert.equal(fs.readdirSync(versions).length >= 1, true);
}

function crashingMainSource() {
	return `// B"H
async function main() {
\tprocess.exit(17);
}
module.exports = { main };
`;
}

module.exports = {
	run
};
