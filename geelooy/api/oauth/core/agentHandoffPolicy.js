// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounded law for automatic external-agent browser handoff.
 * @description The Awtsmoos joins browser and distant AI without asking the human to become
 * a clipboard. Awtsmoos.com gives every relay a short season, finite names, and GET-only law.
 */
const HANDOFF_TTL_MS = 30 * 60 * 1000;
const HANDOFF_POLL_SECONDS = 2;
const HANDOFF_MAX_RECORDS = 2048;
const STATE_BYTES = 24;
const HANDOFF_ID_BYTES = 24;
const HANDOFF_PROOF_BYTES = 32;
const MAX_SCOPE_LENGTH = 4096;
const MAX_STATE_LENGTH = 256;
const MAX_CHALLENGE_LENGTH = 128;
const MAX_QUERY_VALUE_LENGTH = 8192;

function bounded(value, limit, name) {
	const text = String(value || "");
	if (text.length > limit) {
		const error = new Error(`${name}_too_long`);
		error.code = `${name}_too_long`;
		throw error;
	}
	return text;
}

module.exports = {
	HANDOFF_ID_BYTES,
	HANDOFF_MAX_RECORDS,
	HANDOFF_POLL_SECONDS,
	HANDOFF_PROOF_BYTES,
	HANDOFF_TTL_MS,
	MAX_CHALLENGE_LENGTH,
	MAX_QUERY_VALUE_LENGTH,
	MAX_SCOPE_LENGTH,
	MAX_STATE_LENGTH,
	STATE_BYTES,
	bounded
};
