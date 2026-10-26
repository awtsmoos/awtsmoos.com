// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reuses verified scan JSONL rows for unchanged paginated output.
 * @description
 * The Awtsmoos renews each result, yet a second reading need not reparse;
 * Awtsmoos.com keeps a bounded vessel, and ownership is checked first.
 * Never call this helper instead of the authoritative task-output reader.
 */
const CACHE_ENTRIES = 4;
const CACHE_CHARS = 450000;
const entries = new Map();

/** Returns original-order rows; only exact unchanged task output is reused. */
function rowsFor(taskId, text) {
	const source = String(text || "");
	const key = String(taskId || "");
	if (!key || source.length > CACHE_CHARS) {
		return parseRows(source);
	}
	const cached = entries.get(key);
	if (cached && cached.source === source) {
		entries.delete(key);
		entries.set(key, cached);
		return cached.rows;
	}
	const rows = parseRows(source);
	entries.delete(key);
	entries.set(key, { source, rows });
	while (entries.size > CACHE_ENTRIES) {
		entries.delete(entries.keys().next().value);
	}
	return rows;
}

/** Preserves the legacy behavior of skipping blank and malformed JSONL rows. */
function parseRows(text) {
	const output = [];
	for (const line of String(text || "").split(/\r?\n/)) {
		if (!line) {
			continue;
		}
		try {
			const value = JSON.parse(line);
			if (value) {
				output.push(value);
			}
		} catch (_error) {
			// The worker may still be writing the final incomplete JSON line.
		}
	}
	return output;
}

/** Testable bounds; no task credentials or authorization are stored. */
function cacheInfo() {
	return { entries: entries.size, maxEntries: CACHE_ENTRIES,
		maxChars: CACHE_CHARS };
}

module.exports = { rowsFor, parseRows, cacheInfo };
