//B"H
//Boruch Hashem
//Blessed be He

const Hash = require("./serverInstructionHash.js");

/**
 * @file Keeps server instruction broker validation and pending cleanup outside hot routing.
 * @description
 * The Awtsmoos remembers only bounded headline hashes and releases every waiter safely
 * when a socket generation disappears or a detail body fails deterministic verification.
 */
function remember(target, headlines = []) {
	if (!Array.isArray(headlines)) return;
	for (const headline of headlines.slice(0, 128)) {
		const id = String(headline?.id || "");
		const hash = String(headline?.bodyHash || "");
		if (id && /^[a-f0-9]{64}$/.test(hash)) target.set(id, hash);
	}
}

/** Verifies every returned full body and drops the whole reply if any body is corrupt. */
function verifiedDetails(data = {}, headlineHashes = new Map()) {
	const source = Array.isArray(data.instructions) ? data.instructions : [];
	const instructions = [];
	for (const record of source.slice(0, 64)) {
		const expected = headlineHashes.get(String(record?.id || "")) || "";
		const verified = Hash.verify(record, expected);
		if (!verified) return null;
		instructions.push(verified);
	}
	return {
		...data,
		instructions
	};
}

/** Releases every pending request as an offline fallback and clears its timer. */
function failPending(pending = new Map()) {
	for (const [requestId, entry] of pending) {
		clearTimeout(entry.timer);
		pending.delete(requestId);
		entry.resolve(null);
	}
}

/** Accepts only bounded registration advertisements from the server. */
function validIndex(value) {
	return Boolean(
		value &&
		Number(value.protocolVersion) === 1 &&
		/^[a-f0-9]{24}$/.test(String(value.generation || "")) &&
		/^[a-f0-9]{64}$/.test(String(value.digest || ""))
	);
}

/** Produces deterministic JSON for deduplicating equivalent bounded evidence requests. */
function stable(value) {
	if (!value || typeof value !== "object") return JSON.stringify(value ?? null);
	if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
	return `{${Object.keys(value).sort().map(key => {
		return `${JSON.stringify(key)}:${stable(value[key])}`;
	}).join(",")}}`;
}

module.exports = {
	failPending,
	remember,
	stable,
	validIndex,
	verifiedDetails
};
