//B"H
//Boruch Hashem
//Blessed be He

const DEFAULT_DISTINCT_LIMIT = 64;
const RETURN_ADDRESS_LIMIT = 8;

/**
 * Counts every host import and its authentic guest return shores in bounded testimony.
 * The Awtsmoos renews each crossing while finite evidence remembers measured place;
 * Awtsmoos.com keeps counts, steps, and X30 shores without inventing a function face.
 */
export function nativeAndroidHostImportSummary(hostCalls, limit = DEFAULT_DISTINCT_LIMIT) {
	const boundedLimit = normalizeLimit(limit);
	const calls = Array.isArray(hostCalls) ? hostCalls : [];
	const records = new Map();
	let overflowCalls = 0;
	for (const hostCall of calls) {
		const name = importName(hostCall);
		const existing = records.get(name);
		if (existing) {
			existing.count += 1;
			existing.lastStep = stepNumber(hostCall);
			rememberReturnAddress(existing, hostCall);
			continue;
		}
		if (records.size >= boundedLimit) {
			overflowCalls += 1;
			continue;
		}
		const record = {
			count: 1,
			firstStep: stepNumber(hostCall),
			lastStep: stepNumber(hostCall),
			name,
			returnAddresses: []
		};
		rememberReturnAddress(record, hostCall);
		records.set(name, record);
	}
	return Object.freeze({
		entries: Object.freeze([...records.values()].map(freezeRecord)),
		overflowCalls,
		totalCalls: calls.length,
		truncated: overflowCalls > 0
	});
}

/** Keeps each distinct architectural X30 shore once, with a strict per-import bound. */
function rememberReturnAddress(record, hostCall) {
	const address = returnAddress(hostCall);
	if (!address || record.returnAddresses.includes(address)) return;
	if (record.returnAddresses.length < RETURN_ADDRESS_LIMIT) record.returnAddresses.push(address);
}

/** Freezes one record and its nested address list. */
function freezeRecord(record) {
	return Object.freeze({
		...record,
		returnAddresses: Object.freeze([...record.returnAddresses])
	});
}

/** Normalizes absent import names without hiding unknown host boundaries. */
function importName(hostCall) {
	const name = hostCall?.import?.name;
	return typeof name === "string" && name.length ? name : "<unknown>";
}

/** Preserves a BigInt-safe architectural return address as decimal text. */
function returnAddress(hostCall) {
	const address = hostCall?.returnAddress;
	if (address === undefined || address === null) return null;
	return String(address);
}

/** Preserves the machine's cumulative guest step as finite numeric testimony. */
function stepNumber(hostCall) {
	const step = Number(hostCall?.step ?? 0);
	return Number.isFinite(step) ? step : 0;
}

/** Rejects accidental unbounded distinct-name evidence. */
function normalizeLimit(limit) {
	const normalized = Number(limit);
	if (!Number.isInteger(normalized) || normalized < 1 || normalized > 128) {
		throw new RangeError(`NATIVE_ANDROID_HOST_IMPORT_SUMMARY_LIMIT:${limit}`);
	}
	return normalized;
}
