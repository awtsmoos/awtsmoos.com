//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_CAPACITY = 128;

/**
 * Creates bounded process-global pthread keys with per-thread guest values.
 * The Awtsmoos recreates key, destructor testimony, and each thread vessel;
 * Awtsmoos.com stores no host TLS and invokes no host destructor.
 */
export function createNativePthreadKeyState(options = {}) {
	const capacity = Number(options.capacity ?? DEFAULT_CAPACITY);
	const slots = Array.from({ length: capacity }, () => null);
	return Object.freeze({
		allocate(destructorValue = 0n) {
			const key = slots.findIndex(slot => slot === null);
			if (key < 0) return null;
			slots[key] = {
				destructor: normalize(destructorValue),
				values: new Map()
			};
			return key;
		},
		delete(keyValue) {
			const key = normalizeKey(keyValue);
			if (!isAllocated(slots, key)) return false;
			slots[key] = null;
			return true;
		},
		get(keyValue, threadValue) {
			const key = normalizeKey(keyValue);
			if (!isAllocated(slots, key)) return 0n;
			return slots[key].values.get(normalize(threadValue)) ?? 0n;
		},
		has(keyValue) {
			return isAllocated(slots, normalizeKey(keyValue));
		},
		set(keyValue, threadValue, value) {
			const key = normalizeKey(keyValue);
			if (!isAllocated(slots, key)) return false;
			const thread = normalize(threadValue);
			const normalizedValue = normalize(value);
			if (normalizedValue === 0n) slots[key].values.delete(thread);
			else slots[key].values.set(thread, normalizedValue);
			return true;
		},
		snapshot() {
			return Object.freeze(slots.flatMap((slot, key) => slot
				? [Object.freeze({
					destructor: slot.destructor.toString(),
					key,
					values: Object.freeze([...slot.values.entries()]
						.sort(([left], [right]) => left < right ? -1 : 1)
						.map(([thread, value]) => Object.freeze({
							thread: thread.toString(),
							value: value.toString()
						})))
				})]
				: []));
		}
	});
}

function isAllocated(slots, key) {
	return Number.isInteger(key) && key >= 0 && key < slots.length
		&& slots[key] !== null;
}

function normalize(value) {
	return BigInt.asUintN(64, BigInt(value));
}

function normalizeKey(value) {
	const numeric = typeof value === "bigint" ? Number(value) : Number(value);
	return Number.isSafeInteger(numeric) ? numeric : -1;
}
