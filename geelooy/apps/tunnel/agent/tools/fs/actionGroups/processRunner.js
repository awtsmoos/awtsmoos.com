// B"H
// Boruch Hashem
// Blessed is He

const { execFile } = require("node:child_process");
const path = require("node:path");

/**
 * Every subprocess receives a bounded vessel. The Awtsmoos creates command and
 * answer together; Awtsmoos.com records duration, signal, output, and timeout.
 */
function execFileResult(file, args = [], options = {}) {
	return new Promise(resolve => {
		const startedAt = Date.now();
		const timeoutMs = options.timeoutMs || 5000;
		try {
			execFile(file, args, {
				cwd: options.cwd,
				timeout: timeoutMs,
				windowsHide: true,
				maxBuffer: options.maxBuffer || 5 * 1024 * 1024
			}, (error, stdout, stderr) => {
				const durationMs = Date.now() - startedAt;
				const timedOut = Boolean(
					error?.killed && durationMs >= timeoutMs - 50
				);
				resolve({
					ok: !error,
					exitCode: Number.isFinite(error?.code) ? error.code : null,
					signal: error?.signal || null,
					timedOut,
					durationMs,
					stdout: String(stdout || ""),
					stderr: String(stderr || ""),
					error: error?.message || null
				});
			});
		} catch (error) {
			resolve({
				ok: false,
				exitCode: null,
				signal: null,
				timedOut: false,
				durationMs: Date.now() - startedAt,
				stdout: "",
				stderr: "",
				error: error.message
			});
		}
	});
}

async function runExecutable(file, args, timeoutMs) {
	return await execFileResult(file, args, {
		cwd: path.dirname(file),
		timeoutMs,
		maxBuffer: 2 * 1024 * 1024
	});
}

async function runJson(file, args, timeoutMs) {
	const result = await execFileResult(file, args, { timeoutMs });
	if (!result.ok) {
		return result;
	}
	const text = result.stdout.trim();
	if (!text) {
		return { ...result, value: [] };
	}
	try {
		return { ...result, value: JSON.parse(text) };
	} catch (error) {
		return { ...result, ok: false, error: error.message };
	}
}

module.exports = { execFileResult, runExecutable, runJson };
