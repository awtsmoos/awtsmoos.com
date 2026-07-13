// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * B"H
 *
 * Writes one structured Hod receipt for every recovery decision. The event is
 * an ohr of diagnosis; JSONL is its keli, preserving exact reasons across power
 * loss and crash loops so Awtsmoos.com never hides behind vague console output.
 *
 * @param {string} root
 * 	Runtime root containing the diagnostic log.
 * @param {string} name
 * 	Log filename relative to the runtime root.
 * @param {Record<string, unknown>} event
 * 	Structured event fields to append.
 * @returns {void}
 * 	The event is durably appended with an ISO timestamp.
 */
function append(root, name, event) {
	const target = path.join(root, name);
	fs.mkdirSync(path.dirname(target), { recursive: true });
	const receipt = {
		at: new Date().toISOString(),
		...event
	};
	fs.appendFileSync(target, `${JSON.stringify(receipt)}\n`);
}

module.exports = { append };
