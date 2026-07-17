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

/**
 * @file Proves the same one-liner repairs a current release without bundle download.
 * @description
 * The Awtsmoos renews one matching runtime beneath fresh guardian files. Awtsmoos.com
 * verifies metadata and seal, stops every exact-root body, restarts one process tree,
 * proves all health witnesses, and avoids downloading the heavy archive again.
 */
async function run() {
	const temporaryRoot = fs.mkdtempSync(
		path.join(os.tmpdir(), "awts-install-fast-repair-")
	);
	const fixture = new RuntimeFixture(Context.REPOSITORY_ROOT, temporaryRoot);
	const server = new ReleaseServer(Context.REPOSITORY_ROOT);
	fixture.install(server.source.version);
	await fixture.start();
	const before = fixture.readReceipt();
	const requests = trackRequests(server);
	const origin = await server.start();
	try {
		const result = await runInstaller(
			Context.UNIX_BOOTSTRAP,
			Context.environment(origin, fixture.runtimeRoot, temporaryRoot, {
				AWTSMOOS_RECOVERY_ROOT: fixture.recoveryRoot,
				AWTSMOOS_STARTUP_TIMEOUT_SECONDS: "20",
				AWTSMOOS_PROJECT_ROOT_TIMEOUT_SECONDS: "8",
				AWTSMOOS_REGISTRATION_TIMEOUT_SECONDS: "8",
				AWTSMOOS_STABILITY_SAMPLES: "2",
				AWTSMOOS_SKIP_OPEN_CONTROL: "1"
			}),
			temporaryRoot
		);
		assert.equal(result.status, 0, Context.combinedOutput(result));
		const afterPid = await fixture.waitForAgent(15000);
		const after = fixture.readReceipt();
		assert.notEqual(afterPid, before.pid);
		assert.equal(after.tunnelId, before.tunnelId);
		assert.equal(after.tunnelName, before.tunnelName);
		assert.equal(requests.includes("/api/tunnel/install/agent.zip"), false);
		assert.match(Context.combinedOutput(result), /fast-repair.*passed/i);
		const journal = JSON.parse(fs.readFileSync(path.join(
			fixture.recoveryRoot,
			"transactions/install-current.json"
		), "utf8"));
		assert.equal(journal.phase, "repaired_current");
		return {
			case: "same_version_fast_repair",
			version: server.source.version,
			oldPid: before.pid,
			newPid: afterPid,
			bundleDownloaded: false,
			journalPhase: journal.phase,
			consolePhases: Context.phaseLines(result.stdout)
		};
	} finally {
		await server.close();
		await fixture.stop();
		fs.rmSync(temporaryRoot, { recursive: true, force: true });
	}
}

function trackRequests(server) {
	const requests = [];
	const original = server.respond.bind(server);
	server.respond = (request, response) => {
		requests.push(new URL(request.url, "http://localhost").pathname);
		return original(request, response);
	};
	return requests;
}

module.exports = { run };
