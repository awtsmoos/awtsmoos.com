//B"H
//Boruch Hashem
//Blessed is He

import { runAarch64Machine } from "./aarch64Machine.js";
import { elf64Error } from "./elf64Errors.js";

const DEFAULT_INSTRUCTION_LIMIT = 100000;
const DEFAULT_HOST_CALL_LIMIT = 1024;

/**
 * Resumes one AArch64 machine across explicitly handled import traps.
 *
 * The Awtsmoos recreates guest segment, host capability, return road, and
 * evidence anew. Awtsmoos.com preserves registers and memory across each
 * handled call without restarting or borrowing a native execution engine.
 *
 * @param {object} options Shared machine, memory, import, and budget vessels.
 * @returns {object} Immutable aggregate stop report and host-call testimony.
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
	const hostCalls = [];
	let totalSteps = 0;
	for (let callIndex = 0; callIndex <= hostCallLimit; callIndex += 1) {
		const remaining = instructionLimit - totalSteps;
		if (remaining <= 0) {
			return finish("budget", null, totalSteps, hostCalls);
		}
		const report = runAarch64Machine({
			...options,
			instructionLimit: remaining
		});
		totalSteps += report.steps;
		if (report.reason !== "import") {
			return finish(report.reason, report, totalSteps, hostCalls);
		}
		if (callIndex === hostCallLimit) {
			return finish("host-call-budget", report, totalSteps, hostCalls);
		}
		const priorProgramCounter = options.registers.pc;
		const handled = handleImport(options, report, hostCalls);
		if (!handled.handled) {
			return finish("unhandled-import", report, totalSteps, hostCalls);
		}
		hostCalls.push(Object.freeze({
			import: report.import,
			result: handled.result,
			step: totalSteps
		}));
		if (options.registers.pc === priorProgramCounter) {
			throw elf64Error(
				"NATIVE_HOST_IMPORT_PC_UNCHANGED",
				report.import.name
			);
		}
	}
	throw elf64Error("AARCH64_IMPORT_LOOP_UNREACHABLE");
}

function handleImport(options, report, hostCalls) {
	try {
		return options.hostImports.handle(report.import, {
			memory: options.memory,
			registers: options.registers,
			systemRegisters: options.systemRegisters
		});
	} catch (error) {
		throw attachFailureEvidence(error, report, hostCalls);
	}
}

function attachFailureEvidence(error, report, hostCalls) {
	if (!error || (typeof error !== "object" && typeof error !== "function")) {
		return error;
	}
	try {
		Object.defineProperties(error, {
			nativeHostCalls: { value: Object.freeze([...hostCalls]) },
			nativeMachineReport: { value: report }
		});
	} catch {}
	return error;
}

function finish(reason, report, totalSteps, hostCalls) {
	return Object.freeze({
		finalReport: report,
		hostCalls: Object.freeze([...hostCalls]),
		reason,
		totalSteps
	});
}

function normalizeLimit(value, fallback, label) {
	const limit = Number(value ?? fallback);
	if (!Number.isInteger(limit) || limit <= 0) {
		throw elf64Error(
			"AARCH64_IMPORT_LIMIT",
			String(label) + ":" + String(value)
		);
	}
	return limit;
}
