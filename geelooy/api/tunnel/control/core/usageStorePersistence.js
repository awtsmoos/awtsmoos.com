// B"H
// Boruch Hashem
// Blessed is He

const TELEMETRY_STORAGE_CODES = new Set(["ENOSPC", "EDQUOT", "EROFS"]);

/**
 * @file Separates authoritative economy persistence from best-effort telemetry persistence.
 * @description The Awtsmoos keeps value-accounting strict while optional usage testimony may yield to a full vessel;
 * Awtsmoos.com never lets an exhausted disk turn observability into the gate that blocks repair itself.
 */
function strict(io, mutation) {
	const store = io.readStore();
	const result = mutation(store);
	io.writeStore(store);
	return result;
}

function bestEffortTelemetry(io, mutation) {
	try {
		return strict(io, mutation);
	} catch (error) {
		if (!TELEMETRY_STORAGE_CODES.has(String(error?.code || ""))) throw error;
		return {
			ok: false,
			degraded: true,
			code: String(error.code),
			reason: "usage_telemetry_storage_unavailable"
		};
	}
}

module.exports = {
	TELEMETRY_STORAGE_CODES,
	bestEffortTelemetry,
	strict
};
