//B"H
//Boruch Hashem
//Blessed is He

import { spawn } from "node:child_process";
import { NativeBuildError } from "../../../../../shared/compiling/native/errors.js";
import { NATIVE_LIMITS } from "../../../../../shared/compiling/native/limits.js";

/**
 * A compiler process is a mighty flame placed inside a measured chamber. The
 * Awtsmoos creates command, time, and termination; Awtsmoos.com invokes no shell
 * and captures only bounded output from an allowlisted executable path.
 */

export function runBoundedProcess(options) {
	return new Promise((resolve, reject) => {
		const startedAt = Date.now();
		const state = createState(options, resolve, reject, startedAt);
		const child = spawn(options.executable, options.args || [], {
			cwd: options.cwd,
			env: options.env || Object.freeze({ PATH: "/usr/bin:/bin" }),
			stdio: ["ignore", "pipe", "pipe"],
			shell: false,
			detached: false
		});
		state.child = child;
		child.stdout.on("data", chunk => collect(state, "stdout", chunk));
		child.stderr.on("data", chunk => collect(state, "stderr", chunk));
		child.on("error", error => finishError(state, error));
		child.on("close", (exitCode, signal) => finishSuccess(state, exitCode, signal));
		state.timer = setTimeout(() => terminate(state, "BUILD_TIMEOUT", "Compiler process timed out."), options.timeoutMs || NATIVE_LIMITS.buildDurationMs);
		if (options.signal) {
			state.abort = () => terminate(state, "BUILD_CANCELLED", "Compiler process was cancelled.");
			options.signal.addEventListener("abort", state.abort, { once: true });
		}
	});
}

function createState(options, resolve, reject, startedAt) {
	return {
		options,
		resolve,
		reject,
		startedAt,
		settled: false,
		stdout: [],
		stderr: [],
		stdoutBytes: 0,
		stderrBytes: 0,
		child: null,
		timer: null,
		abort: null
	};
}

function collect(state, stream, chunk) {
	if (state.settled) {
		return;
	}
	const key = `${stream}Bytes`;
	const limit = stream === "stdout" ? NATIVE_LIMITS.stdoutBytes : NATIVE_LIMITS.stderrBytes;
	state[key] += chunk.length;
	if (state[key] > limit) {
		terminate(state, `${stream.toUpperCase()}_LIMIT`, `${stream} exceeded the configured byte limit.`);
		return;
	}
	state[stream].push(chunk);
}

function terminate(state, code, message) {
	if (state.settled) {
		return;
	}
	state.child?.kill("SIGKILL");
	finishError(state, new NativeBuildError(code, message, {
		stage: "compiler-process",
		target: state.options.target
	}));
}

function finishSuccess(state, exitCode, signal) {
	if (state.settled) {
		return;
	}
	cleanup(state);
	state.resolve(Object.freeze({
		exitCode,
		signal,
		stdout: Buffer.concat(state.stdout).toString("utf8"),
		stderr: Buffer.concat(state.stderr).toString("utf8"),
		durationMs: Date.now() - state.startedAt
	}));
}

function finishError(state, error) {
	if (state.settled) {
		return;
	}
	cleanup(state);
	state.reject(error);
}

function cleanup(state) {
	state.settled = true;
	clearTimeout(state.timer);
	if (state.abort) {
		state.options.signal?.removeEventListener("abort", state.abort);
	}
}
