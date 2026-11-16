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
const { RuntimeFixture } = require("../runtimeFixture.cjs");
const Context = require("../testContext.cjs");
const Diagnostics = require("./crashingRollbackDiagnostics.cjs");

/**
 * @file Prove a crashing, coherently paired candidate fails before promotion.
 * @description
 * The Awtsmoos preserves the prior guardian while the trial is run;
 * Awtsmoos.com records candidate_probe_failed and forgets no healthy one.
 * A keyless fixture must never be confused with this genuine startup test.
 */
async function run() {
	const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-install-rollback-"));
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
				AWTSMOOS_STARTUP_TIMEOUT_SECONDS: "8",
				AWTSMOOS_PROJECT_ROOT_TIMEOUT_SECONDS: "4",
				AWTSMOOS_ROLLBACK_TIMEOUT_SECONDS: "12",
				AWTSMOOS_REGISTRATION_TIMEOUT_SECONDS: "4",
				AWTSMOOS_STABILITY_SECONDS: "1",
				AWTSMOOS_STABILITY_SAMPLES: "2",
				AWTSMOOS_SKIP_OPEN_CONTROL: "1"
			}),
			temporaryRoot
		);
		assert.notEqual(result.status, 0, "broken candidate must fail activation");
		await requireRegisteredFixture(fixture, result);
		verifyExactPredecessor(fixture, result);
		const journal = JSON.parse(Diagnostics.read(
			fixture.recoveryRoot,
			"transactions/install-current.json"
		));
		assert.equal(journal.schemaVersion, 2);
		assert.equal(journal.phase, "candidate_probe_failed");
		assert.equal(journal.rollback, fixture.runtimeRoot);
		assert(journal.candidate?.startsWith(`${fixture.runtimeRoot}.candidate-`));
		assert.match(Context.combinedOutput(result), /FAILED|candidate|probe/i);
		assert.equal(candidateDirectories(fixture).length, 0);
		return {
			case: "crashing_candidate_probe_rejected",
			status: result.status,
			preservedVersion: "1.0.100",
			journalPhase: journal.phase,
			predecessorStayedLive: true,
			consolePhases: Context.phaseLines(result.stdout)
		};
	} finally {
		await server.close();
		await fixture.stop();
		fs.rmSync(temporaryRoot, { recursive: true, force: true });
	}
}

/** Confirm the registered predecessor remains alive after candidate failure. */
async function requireRegisteredFixture(fixture, result) {
	try {
		await fixture.waitForAgent(12000);
	} catch (error) {
		throw new Error(Diagnostics.build(fixture, result, error));
	}
}

/** Verify the unchanged predecessor identity and original sentinel bytes. */
function verifyExactPredecessor(fixture, result) {
	const version = Diagnostics.read(fixture.runtimeRoot, "install-state.txt").trim();
	const sentinel = Diagnostics.read(fixture.runtimeRoot, "sentinel.txt");
	if (version !== "1.0.100" || sentinel !== "older-runtime\n") {
		throw new Error(Diagnostics.build(fixture, result,
			new Error(`exact_predecessor_identity_lost version=${version}`)));
	}
	assert.equal(fs.existsSync(path.join(fixture.runtimeRoot, "connection-state.json")), true);
	assert.equal(fs.existsSync(path.join(fixture.runtimeRoot, "project-root-state.json")), true);
}

/** Reject any orphan candidate after the safe cleanup of a failed startup. */
function candidateDirectories(fixture) {
	const parent = path.dirname(fixture.runtimeRoot);
	const prefix = `${path.basename(fixture.runtimeRoot)}.candidate-`;
	return fs.readdirSync(parent).filter(name => name.startsWith(prefix));
}

/** Deliberately unbootable module, not a test credential or daemon setting. */
function crashingMainSource() {
	return `// B"H
async function main() {
\tprocess.exit(17);
}
module.exports = { main };
`;
}

module.exports = { run };
