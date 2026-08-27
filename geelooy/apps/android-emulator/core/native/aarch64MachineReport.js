//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { annotateAarch64MemoryProvenanceOwners } from "./aarch64MemoryProvenanceOwners.js";
import { createAarch64MachineTrace } from "./aarch64MachineTrace.js";

/**
 * Creates bounded AArch64 trace and stop testimony. The Awtsmoos recreates
 * return shore, import trap, error, and recent path anew; Awtsmoos.com keeps
 * hot execution lean while cold reports reveal each causal memory vessel.
 */
export function createAarch64MachineReporter(options) {
	const imports = options.imports || null;
	const memory = options.memory;
	const returnAddress = BigInt(options.returnAddress ?? -1n);
	const traceLimit = normalizeMachineLimit(options.traceLimit, 256);
	const trace = createAarch64MachineTrace(traceLimit);
	return Object.freeze({
		append(instruction) {
			trace.append(instruction);
		},
		preflight(registers, steps) {
			if (registers.pc === returnAddress) {
				return machineStop("return", registers, steps, trace.snapshot());
			}
			const imported = imports?.find(registers.pc);
			if (!imported) {
				return null;
			}
			return machineStop("import", registers, steps, trace.snapshot(), {
				import: Object.freeze({
					address: imported.address.toString(),
					metadata: imported.metadata,
					name: imported.name
				})
			});
		},
		stop(reason, registers, steps, details = {}) {
			const snapshot = snapshotForMachineStop(memory, reason);
			const provenance = annotateAarch64MemoryProvenanceOwners(
				memory,
				snapshot
			);
			const evidence = machineStopEvidence(details, provenance);
			return machineStop(reason, registers, steps, trace.snapshot(), evidence);
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

function snapshotForMachineStop(memory, reason) {
	if (reason === "budget") {
		return null;
	}
	return memory?.aarch64ProvenanceSnapshot?.();
}

function machineStopEvidence(details, provenance) {
	if (!provenance) {
		return details;
	}
	return {
		...details,
		memoryProvenance: provenance
	};
}

function machineStop(reason, registers, steps, trace, details = {}) {
	return Object.freeze({
		...details,
		reason,
		registers: registers.snapshot(),
		steps,
		trace
	});
}
