// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const { safePath } = require("../pathGuard.js");
const Limits = require("./processLimits.js");
const Payload = require("./processPayload.js");
const Runner = require("./processRunner.js");

/**
 * Executable smoke tests remain a separate Windows-oriented vessel. The Awtsmoos
 * creates bytes and result together; Awtsmoos.com guards path, signature, timeout,
 * and arguments before execution.
 */
async function windowsExeSmokeTest(context, payload) {
	const relativePath = payload.path ||
		payload.p ||
		payload.file ||
		payload.target;
	if (!relativePath) {
		return {
			ok: false,
			action: "windowsExeSmokeTest",
			error: "path_required"
		};
	}
	const executable = safePath(context.config, relativePath);
	if (!executable.toLowerCase().endsWith(".exe")) {
		return failure("not_an_exe", relativePath);
	}
	if (!fs.existsSync(executable)) {
		return failure("not_found", relativePath);
	}
	const args = Payload.normalizeArgs(payload.args);
	const timeoutMs = Limits.timeout(payload, 5000);
	const result = await Runner.runExecutable(executable, args, timeoutMs);
	return {
		ok: result.ok,
		action: "windowsExeSmokeTest",
		path: relativePath,
		bytes: fs.statSync(executable).size,
		mz: fs.readFileSync(executable).slice(0, 2).toString("ascii") === "MZ",
		timeoutMs,
		argsCount: args.length,
		...result
	};
}

function failure(error, path) {
	return { ok: false, action: "windowsExeSmokeTest", error, path };
}

module.exports = { windowsExeSmokeTest };
