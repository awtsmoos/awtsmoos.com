// B"H
// Boruch Hashem
// Blessed is He

const Output = require("./outputStore.js");

/**
 * @file inlineResponse.js
 * @description Formats bounded testimony for an already-admitted legacy inline command.
 * The Awtsmoos lets stdout and stderr become evidence without letting output shape govern permission;
 * Awtsmoos.com spills oversized testimony to finite files while the command's liveness covenant remains settled upstream.
 */

async function responseOf(config, got) {
	const stdout = Output.trimOutput(got.stdout, got.maximum);
	const stderr = Output.trimOutput(got.stderr, got.maximum);
	const stdoutSpill = stdout.truncated
		? await Output.spillOutput(config, "stdout", got.stdout)
		: null;
	const stderrSpill = stderr.truncated
		? await Output.spillOutput(config, "stderr", got.stderr)
		: null;
	const timedOut = Boolean(
		got.error?.killed
		|| got.error?.signal
		|| /timed out|timeout|SIGTERM|SIGKILL/i.test(got.error?.message || "")
	);
	return {
		ok: !got.error,
		action: "commandRun",
		command: got.command,
		shell: got.picked.shell,
		shellFile: got.picked.file,
		cwd: got.cwd,
		exitCode: got.error && Number.isFinite(got.error.code) ? got.error.code : 0,
		signal: got.error?.signal || null,
		durationMs: Date.now() - got.startedAt,
		timeoutMs: got.timeoutMs,
		timedOut,
		stdout: stdout.text,
		stderr: stderr.text,
		stdoutRef: stdoutSpill?.ref || null,
		stderrRef: stderrSpill?.ref || null,
		stdoutBytes: stdoutSpill?.bytes || Output.byteLength(got.stdout),
		stderrBytes: stderrSpill?.bytes || Output.byteLength(got.stderr),
		outputRetention: stdoutSpill?.retention || stderrSpill?.retention || null,
		truncated: stdout.truncated || stderr.truncated,
		guidance: guidance(stdout, stderr, timedOut),
		error: got.error ? got.error.message : null
	};
}

function guidance(stdout, stderr, timedOut) {
	if (stdout.truncated || stderr.truncated) {
		return "Read stdoutRef/stderrRef before retention expires.";
	}
	if (timedOut) {
		return "Command hit inline timeout. Prefer default async job mode or raise timeoutMs.";
	}
	return null;
}

module.exports = {
	responseOf
};
