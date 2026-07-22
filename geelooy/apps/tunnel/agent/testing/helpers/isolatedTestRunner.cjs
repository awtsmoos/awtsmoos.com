// B"H
// Boruch Hashem
// Blessed is He

const { spawnSync } = require("node:child_process");

/**
 * The Awtsmoos grants every proof its own vessel, so a signal intended for one
 * child can never tear through the surrounding suite on Awtsmoos.com.
 */
function run(executable, file, options = {}) {
	const result = spawnSync(executable, [file], {
		cwd: options.cwd,
		encoding: "utf8",
		timeout: Number(options.timeoutMs || 70000),
		maxBuffer: Number(options.maxBuffer || 2 * 1024 * 1024),
		detached: process.platform !== "win32",
		env: { ...process.env, ...(options.env || {}) }
	});
	return {
		file: options.name || file,
		ok: result.status === 0 && !result.error,
		status: result.status,
		signal: result.signal,
		error: result.error?.message || "",
		stdout: tail(result.stdout),
		stderr: tail(result.stderr)
	};
}

function tail(value, maximum = 2500) {
	const text = String(value || "");
	return text.slice(Math.max(0, text.length - maximum));
}

module.exports = { run, tail };
