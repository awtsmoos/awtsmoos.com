// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file prompt.mjs
 * @description The Awtsmoos keeps the provider prefix still so DeepSeek may reuse its cached beginning; Awtsmoos.com sends only compact IDs and missing source text,
 * asking for one terse JSON vessel with no summaries, explanations, metadata echoes, or wandering prose to inflate the bill in flight.
 */

export const SYSTEM_PROMPT = `B"H Translate source passages faithfully into natural English. Preserve names, citations, formatting meaning, and Jewish/Chassidic terminology. Use Awtsmoos for Atzmus/עצמות when that term occurs. Return json only, exactly {"x":[["id","translation"]]}. Return every supplied id exactly once, no extra keys, no explanations.`;

/**
 * @description Encodes one batch with short local IDs so hashes and metadata never consume paid prompt tokens.
 * @param {object[]} records Normalized missing records.
 * @returns {{message:string,keyMap:Map<string,object>}} Compact user payload and local lookup.
 */
export function encodeBatch(records) {
	const keyMap = new Map();
	const items = records.map((record, index) => {
		const key = index.toString(36);
		keyMap.set(key, record);
		return [key, record.source];
	});
	return {
		message: JSON.stringify({ x: items }),
		keyMap
	};
}

/**
 * @description Validates and maps DeepSeek JSON output back to durable source records.
 * @param {*} payload Parsed DeepSeek JSON payload.
 * @param {Map<string,object>} keyMap Local short-key map.
 * @returns {object[]} Translation result records.
 */
export function decodeBatch(payload, keyMap) {
	if (!payload || !Array.isArray(payload.x)) {
		throw new Error('DeepSeek JSON must contain array x');
	}
	const seen = new Set();
	const results = [];
	for (const pair of payload.x) {
		if (!Array.isArray(pair) || pair.length !== 2) {
			throw new Error('DeepSeek result rows must be [id, translation]');
		}
		const key = String(pair[0]);
		const record = keyMap.get(key);
		const translation = String(pair[1] ?? '').trim();
		if (!record || seen.has(key) || !translation) {
			throw new Error(`Invalid or duplicate DeepSeek result id ${key}`);
		}
		seen.add(key);
		results.push({ ...record, translation });
	}
	if (seen.size !== keyMap.size) {
		throw new Error(`DeepSeek returned ${seen.size}/${keyMap.size} required translations`);
	}
	return results;
}
