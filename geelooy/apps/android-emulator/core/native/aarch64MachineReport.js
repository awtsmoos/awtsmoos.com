//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Creates bounded AArch64 trace and stop testimony. The Awtsmoos recreates
 * return shore, import trap, error, and recent path anew; Awtsmoos.com keeps
 * machine reporting separate from instruction execution and mutation.
 */
export function createAarch64MachineReporter(options) {
	const imports = options.imports || null;
	const returnAddress = BigInt(options.returnAddress ?? -1n);
	const traceLimit = normalizeMachineLimit(options.traceLimit, 256);
	const trace = [];
	return Object.freeze({
		append(instruction) {
			trace.push(instruction);
			if (trace.length > traceLimit) {
				trace.splice(0, trace.length - traceLimit);
			}
		},
		preflight(registers, steps) {
			if (registers.pc === returnAddress) {
				return machineStop("return", registers, steps, trace);
			}
			const imported = imports?.find(registers.pc);
			if (!imported) return null;
			return machineStop("import", registers, steps, trace, {
				import: Object.freeze({
					address: imported.address.toString(),
					metadata: imported.metadata,
					name: imported.name
				})
			});
		},
		stop(reason, registers, steps, details = {}) {
			return machineStop(reason, registers, steps, trace, details);
		}
	});
}

export function normalizeMachineLimit(value, fallback) {
	const limit = Number(value ?? fallback);
	if (!Number.isInteger(limit) || limit <= 0) {
		throw elf64Error("AARCH64_MACHINE_LIMIT", value);
	}
	return limit;
}

export function machineErrorEvidence(error) {
	return Object.freeze({
		code: error?.code || "AARCH64_MACHINE_ERROR",
		message: String(error?.message || error)
	});
}

function machineStop(reason, registers, steps, trace, details = {}) {
	return Object.freeze({
		...details,
		reason,
		registers: registers.snapshot(),
		steps,
		trace: Object.freeze([...trace])
	});
}
