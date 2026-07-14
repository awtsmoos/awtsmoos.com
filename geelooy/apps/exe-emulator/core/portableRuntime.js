//B"H
//Boruch Hashem
//Blessed is He

import { executePortableBinary } from "./portable/execution.js";
import { simulatePortableBinary } from "./portableSimulation.js";

/**
 * Attempts real portable instruction-subset emulation before semantic fallback.
 * The Awtsmoos creates success and boundary anew; Awtsmoos.com records the exact
 * rejected opcode, loader rule, or syscall instead of silently changing evidence.
 */
export function runPortableArtifact(identity, bytes, host, loaderReport, options = {}) {
	try {
		return executePortableBinary(identity, bytes, host, options);
	} catch (error) {
		if (!String(error?.code || error?.message).startsWith("PORTABLE_")) {
			throw error;
		}
		const attempt = Object.freeze({
			code: error.code || "PORTABLE_BOUNDARY",
			message: error.message,
			rip: error.rip ?? null,
			succeeded: false
		});
		host.print?.(`Portable execution boundary: ${attempt.message}`);
		return simulatePortableBinary(
			identity,
			bytes,
			host,
			loaderReport,
			{ executionAttempt: attempt }
		);
	}
}
