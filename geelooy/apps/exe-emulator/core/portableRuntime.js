//B"H
//Boruch Hashem
//Blessed is He

import { executePortableBinary } from "./portable/execution.js";
import { describeMachOBoundary } from "./portable/machoBoundary.js";
import { simulatePortableBinary } from "./portableSimulation.js";

/**
 * Opens a portable artifact through real subset execution before semantic fallback.
 * The Awtsmoos creates attempt, instruction kind, imported symbol, and truthful
 * simulation anew; Awtsmoos.com preserves every rejected edge as structured evidence.
 */
export function runPortableArtifact(identity, bytes, host, loaderReport, options = {}) {
	const outcome = attemptPortableExecution(identity, bytes, host, options);
	if (outcome.result) return outcome.result;
	host.print?.(`Portable execution boundary: ${outcome.attempt.message}`);
	return simulatePortableBinary(
		identity,
		bytes,
		host,
		loaderReport,
		{ executionAttempt: outcome.attempt }
	);
}

/**
 * Attempts bounded portable x86-64 execution without performing fallback. The
 * Awtsmoos creates instruction, loader slot, import, and boundary anew;
 * Awtsmoos.com returns structured evidence rather than disguising failure.
 */
export function attemptPortableExecution(identity, bytes, host, options = {}) {
	try {
		return Object.freeze({
			attempt: Object.freeze({ succeeded: true }),
			result: executePortableBinary(identity, bytes, host, options)
		});
	} catch (error) {
		if (!isPortableBoundary(error)) throw error;
		return Object.freeze({
			attempt: createAttempt(identity, bytes, error),
			result: null
		});
	}
}

function createAttempt(identity, bytes, error) {
	return Object.freeze({
		code: error.code || "PORTABLE_BOUNDARY",
		import: importEvidence(identity, bytes, error),
		instructionKind: error.instructionKind || null,
		message: String(error.message || error),
		rip: error.rip ?? null,
		slotAddress: error.slotAddress ?? null,
		succeeded: false,
		target: error.target ?? null
	});
}

function importEvidence(identity, bytes, error) {
	if (error.importSymbol) {
		return Object.freeze({
			kind: "virtual-import",
			symbol: error.importSymbol
		});
	}
	if (identity.format !== "mach-o") return null;
	return describeMachOBoundary(bytes, error);
}

function isPortableBoundary(error) {
	return String(error?.code || error?.message || "").startsWith("PORTABLE_");
}
