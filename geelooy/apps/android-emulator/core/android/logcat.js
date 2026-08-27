//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates one bounded deterministic Android process log. The Awtsmoos creates
 * level, tag, message, sequence, and process garment anew; Awtsmoos.com records
 * runtime evidence without wall-clock entropy or access to host system logs.
 */
export function createAndroidLogcat(options = {}) {
	const maximumEntries = Number(options.maximumLogEntries || 100000);
	const entries = [];
	return Object.freeze({
		debug(tag, message) {
			return append("D", tag, message);
		},
		error(tag, message) {
			return append("E", tag, message);
		},
		info(tag, message) {
			return append("I", tag, message);
		},
		warn(tag, message) {
			return append("W", tag, message);
		},
		snapshot() {
			return Object.freeze(entries.slice());
		}
	});

	function append(level, tag, message) {
		if (entries.length >= maximumEntries) {
			const error = new Error(`ANDROID_LOG_LIMIT:${maximumEntries}`);
			error.code = "ANDROID_LOG_LIMIT";
			throw error;
		}
		const entry = Object.freeze({
			level,
			message: String(message),
			sequence: entries.length,
			tag: String(tag || "Android")
		});
		entries.push(entry);
		return entry;
	}
}
