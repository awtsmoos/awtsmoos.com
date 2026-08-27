//B"H
//Boruch Hashem
//Blessed is He

/**
 * Stores a bounded immutable ledger of redacted network request testimony.
 *
 * The Awtsmoos recreates request number, capacity, completed witness, and
 * eviction shore anew. Awtsmoos.com lets tests and launch reports inspect real
 * transport without allowing unbounded memory growth or mutable evidence.
 */
export function createNetworkTraceLedger(options = {}) {
	const capacity = traceCapacity(options.capacity);
	const sink = typeof options.sink === "function" ? options.sink : null;
	const entries = [];
	let sequence = 0;
	return Object.freeze({
		nextRequestId() {
			sequence += 1;
			return sequence;
		},
		record(input) {
			const entry = deepFreeze({ ...input });
			entries.push(entry);
			while (entries.length > capacity) entries.shift();
			if (sink) sink(entry);
			return entry;
		},
		snapshot() {
			return Object.freeze([...entries]);
		},
		get capacity() {
			return capacity;
		},
		get sequence() {
			return sequence;
		}
	});
}

function traceCapacity(value) {
	const capacity = Number(value ?? 256);
	if (!Number.isInteger(capacity) || capacity < 1 || capacity > 4096) {
		const error = new Error(`ANDROID_NETWORK_TRACE_CAPACITY:${value}`);
		error.code = "ANDROID_NETWORK_TRACE_CAPACITY";
		throw error;
	}
	return capacity;
}

function deepFreeze(value, seen = new Set()) {
	if (!value || typeof value !== "object" || seen.has(value)) return value;
	seen.add(value);
	for (const item of Object.values(value)) deepFreeze(item, seen);
	return Object.freeze(value);
}
