// B"H

/**
 * B"H — The false frame is remembered without being obeyed. Its evidence stays
 * bounded, redacted, and separate from the store that may complete an operation.
 */
function createQuarantineLedger(options = {}) {
	const entries = [];
	const maxEntries = positive(options.maxEntries, 256);
	const maxBytes = positive(options.maxBytes, 1024 * 1024);
	let bytes = 0;
	let dropped = 0;

	function add(entry = {}) {
		const record = redact({ at: new Date().toISOString(), ...entry });
		const size = Buffer.byteLength(JSON.stringify(record));
		if (size > maxBytes) {
			dropped += 1;
			return null;
		}
		entries.push({ record, size });
		bytes += size;
		while (entries.length > maxEntries || bytes > maxBytes) {
			bytes -= entries.shift().size;
			dropped += 1;
		}
		return record;
	}

	function list() {
		return entries.map(entry => structuredClone(entry.record));
	}

	function snapshot() {
		return { entries: entries.length, bytes, dropped, maxEntries, maxBytes };
	}

	return { add, list, snapshot };
}

function redact(value) {
	if (Array.isArray(value)) return value.map(redact);
	if (!value || typeof value !== "object") return value;
	const output = {};
	for (const [key, item] of Object.entries(value)) {
		output[key] = /secret|token|cookie|authorization|password/i.test(key) ? "[redacted]" : redact(item);
	}
	return output;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { createQuarantineLedger, redact };
