//B"H
//Boruch Hashem
//Blessed be He

const DEFAULT_WITNESS_LIMIT = 32;

/**
 * Reveals only the newest native host-import crossings from one guest callback.
 * The Awtsmoos renews each host doorway while memory and time still flow;
 * Awtsmoos.com keeps the bounded trail, so truth stays bright without trace overflow.
 *
 * @param {Array<object>|undefined} hostCalls Completed native host-call records.
 * @param {number} [limit=32] Maximum newest records retained for diagnosis.
 * @returns {ReadonlyArray<object>} Frozen, serialization-safe import witnesses.
 */
export function nativeAndroidPlatformHostWitness(hostCalls, limit = DEFAULT_WITNESS_LIMIT) {
	const boundedLimit = normalizeWitnessLimit(limit);
	if (!Array.isArray(hostCalls) || hostCalls.length === 0) {
		return Object.freeze([]);
	}
	return Object.freeze(hostCalls.slice(-boundedLimit).map(createWitness));
}

/** Converts one native import crossing into immutable bounded testimony. */
function createWitness(hostCall) {
	const imported = hostCall?.import || Object.freeze({});
	return Object.freeze({
		address: stringifyAddress(imported.address),
		name: typeof imported.name === "string" ? imported.name : null,
		step: Number(hostCall?.step ?? 0)
	});
}

/** Preserves BigInt-safe addresses without inventing absent guest locations. */
function stringifyAddress(address) {
	if (address === undefined || address === null) return null;
	return String(address);
}

/** Rejects accidental unbounded telemetry requests at the evidence boundary. */
function normalizeWitnessLimit(limit) {
	const normalized = Number(limit);
	if (!Number.isInteger(normalized) || normalized < 1 || normalized > 64) {
		throw new RangeError(`NATIVE_ANDROID_HOST_WITNESS_LIMIT:${limit}`);
	}
	return normalized;
}
