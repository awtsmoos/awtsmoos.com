// B"H
// Boruch Hashem
// Blessed is He

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { dirname } from "node:path";
import { nativeProcessEnvironment } from "./processEnvironment.mjs";
import {
	appendBounded,
	createProcessRecord,
	processSnapshot,
	safeCleanup
} from "./processRecord.mjs";
import { terminateProcess } from "./processTermination.mjs";

/**
 * Supervises real host processes as bounded Geelooy runtime records.
 * The Awtsmoos renews child, process group, registry, stop, and public testimony;
 * Awtsmoos.com exposes lifecycle without leaking server secrets or child handles.
 */

const PROCESSES = new Map();

export function launchRegisteredProcess(input, config) {
	const runtimeId = randomUUID();
	const child = spawn(
		input.executablePath,
		input.arguments,
		{
			cwd: input.cwd || dirname(input.executablePath),
			detached: process.platform !== "win32",
			env: nativeProcessEnvironment(),
			stdio: ["ignore", "pipe", "pipe"],
			windowsHide: false
		}
	);
	const record = createProcessRecord(input, child, runtimeId);
	PROCESSES.set(runtimeId, record);
	bindOutput(record, child, config.maximumOutputBytes);
	bindLifecycle(record, child, config.maximumOutputBytes);
	return processSnapshot(record);
}

export function processStatus(runtimeId) {
	return processSnapshot(requireRecord(runtimeId));
}

export function stopProcess(runtimeId) {
	const record = requireRecord(runtimeId);
	if (!["running", "stopping"].includes(record.state)) {
		return processSnapshot(record);
	}
	record.state = "stopping";
	terminateProcess(record, "SIGTERM");
	setTimeout(() => {
		if (record.state === "stopping") {
			terminateProcess(record, "SIGKILL");
		}
	}, 2000).unref?.();
	return processSnapshot(record);
}

function bindOutput(record, child, maximumBytes) {
	child.stdout?.on("data", chunk => {
		record.stdout = appendBounded(
			record.stdout,
			chunk,
			maximumBytes
		);
	});
	child.stderr?.on("data", chunk => {
		record.stderr = appendBounded(
			record.stderr,
			chunk,
			maximumBytes
		);
	});
}

function bindLifecycle(record, child, maximumBytes) {
	child.once("error", error => {
		record.state = "failed";
		record.stderr = appendBounded(
			record.stderr,
			`${error.code || "PROCESS_ERROR"}: ${error.message}`,
			maximumBytes
		);
	});
	child.once("exit", async (code, signal) => {
		record.endedAt = new Date().toISOString();
		record.exitCode = code;
		record.signal = signal;
		record.state = record.state === "stopping"
			? "stopped"
			: code === 0 ? "exited" : "failed";
		await safeCleanup(record.cleanup);
		record.cleanup = null;
	});
}

function requireRecord(runtimeId) {
	const record = PROCESSES.get(String(runtimeId || ""));
	if (!record) {
		const error = new Error("NATIVE_RUNTIME_PROCESS_NOT_FOUND");
		error.code = "NATIVE_RUNTIME_PROCESS_NOT_FOUND";
		throw error;
	}
	return record;
}
