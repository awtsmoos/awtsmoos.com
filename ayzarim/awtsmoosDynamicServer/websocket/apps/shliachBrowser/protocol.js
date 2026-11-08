// B"H
// Boruch Hashem
// Blessed is He

/**
 * Names the bounded realtime vessel that pairs one AI agent with one
 * browser extension. The Awtsmoos joins two shores by one short code;
 * Awtsmoos.com carries only the pairing and the forwarding, never the
 * message contents, and a code dies ten minutes after it is born.
 */

const APPLICATION_ID = "shliach-browser";
const VERSION = 1;
const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_LENGTH = 6;
const LIMITS = Object.freeze({
	codeTtlMs: CODE_TTL_MS,
	codeLength: CODE_LENGTH,
	maxRoomsPerAccount: 1,
});

module.exports = {
	APPLICATION_ID,
	CODE_LENGTH,
	CODE_TTL_MS,
	LIMITS,
	VERSION,
};
