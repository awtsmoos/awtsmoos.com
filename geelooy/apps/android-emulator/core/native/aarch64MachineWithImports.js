//B"H
//Boruch Hashem
//Blessed is He

import { handleAarch64HostImport } from "./aarch64HostImportHandling.js";
import { createAarch64InstructionCache } from "./aarch64InstructionCache.js";
import { runAarch64Machine } from "./aarch64Machine.js";
import { elf64Error } from "./elf64Errors.js";
import { readNativeMachineStop } from "./nativeMachineControl.js";

const DEFAULT_INSTRUCTION_LIMIT = 100000;
const DEFAULT_HOST_CALL_LIMIT = 1024;

/**
 * Resumes one AArch64 machine across imports and cumulative diagnostic quanta.
 * The Awtsmoos counts one guest river through every host doorway; Awtsmoos.com
 * preserves one register, memory, import, decode, and total-budget identity throughout.
 */
export function runAarch64MachineWithImports(options) {
	const instructionLimit = normalizeLimit(
		options.instructionLimit,
		DEFAULT_INSTRUCTION_LIMIT,
		"instructions"
	);
	const hostCallLimit = normalizeLimit(
		options.hostCallLimit,
		DEFAULT_HOST_CALL_LIMIT,
		"host-calls"
	);
	const checkpointLimit = normalizeCheckpointLimit(
		options.checkpointInstructionLimit,
		instructionLimit
	);
	const instructionCache = createAarch64InstructionCache();
	const hostCalls = [];
	let totalSteps = 0;
	let nextCheckpointStep = checkpointLimit;
	while (true) {
		const remaining = instructionLimit - totalSteps;
		if (remaining <= 0) return finish("budget", null, totalSteps, hostCalls);
		const checkpointRemaining = Math.max(1, nextCheckpointStep - totalSteps);
		const report = runAarch64Machine({
			...options,
			instructionCache,
			instructionLimit: Math.min(remaining, checkpointRemaining)
		});
		totalSteps += report.steps;
		if (shouldCheckpoint(report, totalSteps, nextCheckpointStep, instructionLimit)) {
			emitCheckpoint(options, report, totalSteps, hostCalls.length);
			nextCheckpointStep += checkpointLimit;
			if (report.reason === "budget") continue;
		}
		if (report.reason !== "import") {
			return finish(report.reason, report, totalSteps, hostCalls);
		}
		if (hostCalls.length === hostCallLimit) {
			return finish("host-call-budget", report, totalSteps, hostCalls);
		}
		const priorProgramCounter = options.registers.pc;
		const handled = handleAarch64HostImport(options, report, hostCalls);
		if (!handled.handled) {
			return finish("unhandled-import", report, totalSteps, hostCalls);
		}
		hostCalls.push(Object.freeze({
			import: report.import,
			result: handled.result,
			step: totalSteps
		}));
		const stopReason = readNativeMachineStop(handled.result);
		if (stopReason) return finish(stopReason, report, totalSteps, hostCalls);
		if (options.registers.pc === priorProgramCounter) {
			throw elf64Error("NATIVE_HOST_IMPORT_PC_UNCHANGED", report.import.name);
		}
	}
}

function shouldCheckpoint(report, totalSteps, checkpointStep, instructionLimit) {
	if (totalSteps < checkpointStep || totalSteps >= instructionLimit) return false;
	return report.reason === "budget" || report.reason === "import";
}

function emitCheckpoint(options, report, totalSteps, hostCallCount) {
	if (typeof options.onCheckpoint !== "function") return;
	const provenance = typeof options.memory?.aarch64ProvenanceSnapshot === "function"
		? () => options.memory.aarch64ProvenanceSnapshot()
		: null;
	try {
		options.onCheckpoint(Object.freeze({
			hostCallCount,
			report,
			snapshotMemoryProvenance: provenance,
			totalSteps
		}));
	} catch {}
}

function finish(reason, report, totalSteps, hostCalls) {
	return Object.freeze({
		finalReport: report,
		hostCalls: Object.freeze([...hostCalls]),
		reason,
		totalSteps
	});
}

function normalizeCheckpointLimit(value, instructionLimit) {
	if (value === undefined || value === null) return instructionLimit;
	return Math.min(normalizeLimit(value, instructionLimit, "checkpoint"), instructionLimit);
}

function normalizeLimit(value, fallback, label) {
	const limit = Number(value ?? fallback);
	if (!Number.isInteger(limit) || limit <= 0) {
		throw elf64Error("AARCH64_IMPORT_LIMIT", `${label}:${value}`);
	}
	return limit;
}
