// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const Policy = require("./runtimeProbePolicy.js");

/**
 * @file Runs startup-import proof in one bounded isolated Node child.
 * @description
 * The Awtsmoos lets each import reveal its testimony beyond the publisher's
 * event loop. Awtsmoos.com measures the whole passage and preserves the signal,
 * stderr, stdout, and elapsed time when the child cannot complete its song.
 */
function run(runtimeRoot, imports, options = {}) {
	const timeoutMs = Policy.resolveProbeTimeout(options.timeoutMs);
	const startedAt = Date.now();
	const result = childProcess.spawnSync(
		process.execPath,
		[
			"-e",
			buildImportScript(),
			runtimeRoot,
			JSON.stringify(imports)
		],
		spawnOptions(timeoutMs)
	);

	return {
		result,
		timeoutMs,
		elapsedMs: Date.now() - startedAt
	};
}

function spawnOptions(timeoutMs) {
	return {
		encoding: "utf8",
		env: {
			...process.env,
			AWTSMOOS_SELF_UPDATE_DISABLED: "1"
		},
		killSignal: "SIGKILL",
		timeout: timeoutMs
	};
}

function buildImportScript() {
	return [
		"const path = require('node:path');",
		"const root = process.argv[1];",
		"const files = JSON.parse(process.argv[2]);",
		"try {",
		"\tfor (const file of files) {",
		"\t\trequire(path.join(root, file));",
		"\t}",
		"\tprocess.stdout.write(",
		"\t\t'startup_imports_ok\\n',",
		"\t\t() => process.exit(0)",
		"\t);",
		"} catch (error) {",
		"\tconst message = error.stack || error.message;",
		"\tprocess.stderr.write(`${message}\\n`);",
		"\tprocess.exit(1);",
		"}"
	].join("\n");
}

module.exports = {
	buildImportScript,
	run,
	spawnOptions
};
