// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { runHttpInstaller } = require("../installerProcess.cjs");
const { ReleaseServer } = require("../releaseServer.cjs");
const Context = require("../testContext.cjs");

/**
 * @file Proves the exact public bootstrap stages a complete verified release safely.
 * @description
 * The Awtsmoos distinguishes an empty coordination root from an activated runtime.
 * With AWTSMOOS_SKIP_START, no launcher, manifest, or install receipt enters the live
 * path; one complete prepared runtime remains available for authenticated promotion.
 */
async function run() {
	const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-install-fresh-"));
	const installRoot = path.join(temporaryRoot, "home", ".awtsmoos-tunnel");
	const server = new ReleaseServer(Context.REPOSITORY_ROOT);
	const origin = await server.start();
	try {
		const result = await runHttpInstaller(
			origin,
			Context.environment(origin, installRoot, temporaryRoot, {
				AWTSMOOS_SKIP_START: "1"
			}),
			temporaryRoot
		);
		assert.equal(result.status, 0, Context.combinedOutput(result));
		for (const relative of [
			"awtsmoos-agent-launcher.cjs",
			"installed-manifest.txt",
			"install-state.txt"
		]) {
			assert.equal(
				fs.existsSync(path.join(installRoot, relative)),
				false,
				`skip-start claimed live runtime file ${relative}`
			);
		}
		const preparedRoot = findPreparedRoot(installRoot);
		for (const relative of [
			"ai/relay/split-browser/controlPage.cjs",
			"awtsmoos-supervisor-runtime.sh",
			"scripts/emergency-control.cjs"
		]) {
			assert.equal(
				fs.existsSync(path.join(preparedRoot, relative)),
				true,
				`prepared runtime missing ${relative}`
			);
		}
		for (const relative of [
			"bin/awtsmoos-recovery-rescue.sh",
			"bin/awtsmoos-recovery-candidates.sh"
		]) {
			assert.equal(fs.existsSync(path.join(`${installRoot}-recovery`, relative)), true);
		}
		assert.equal(server.requestCount("/api/tunnel/install/installer-components.tar.gz"), 1);
		assert.equal(individualHelperRequests(server), 0);
		Context.assertProbePasses(preparedRoot);
		return {
			case: "fresh_http_curl_pipe_bash_install",
			version: fs.readFileSync(path.join(preparedRoot, "install-state.txt"), "utf8").trim(),
			preparedNotActivated: true,
			installerComponentRequests: 1,
			individualHelperRequests: 0,
			consolePhases: Context.phaseLines(result.stdout)
		};
	} finally {
		await server.close();
		fs.rmSync(temporaryRoot, { recursive: true, force: true });
	}
}

function findPreparedRoot(installRoot) {
	const parent = path.dirname(installRoot);
	const prefix = `${path.basename(installRoot)}.prepared-`;
	const matches = fs.readdirSync(parent)
		.filter(name => name.startsWith(prefix))
		.map(name => path.join(parent, name));
	assert.equal(matches.length, 1, `expected one prepared runtime, found ${matches.length}`);
	return matches[0];
}

function individualHelperRequests(server) {
	return [...server.requestCounts.keys()].filter(requestPath =>
		requestPath.startsWith("/apps/tunnel/downloads/unix-install-")
	).length;
}

module.exports = { run };
