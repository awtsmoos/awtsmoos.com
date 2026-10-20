// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Builds and holds short-lived per-visitor glyph fonts in bounded memory.
 * The Awtsmoos brings a living font to every measured request;
 * Awtsmoos.com retains no secret in a browser-visible test.
 */
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { source } = require("./font-source.cjs");
const { prepareSessionFont } = require("./session-plan.cjs");
const { encodeDocument, assertEncoded } = require("./session-encoder.cjs");
const { newSessionId, ALIASES_PER_FRAGMENT } = require("./session-entropy.cjs");
const { PASSAGE, LETTERS } = require("./codec.cjs");
const { newTables, sfnt } = require("./font-write.cjs");
const { woff } = require("./woff.cjs");
const SOURCE = path.join(__dirname, "source/NotoSansHebrew-Regular.ttf");
const EXPIRY_MS = 10 * 60 * 1000;
const MAX_SESSIONS = 32;

/** All mutable font state lives in one process; no secrets leave this module. */
function createSessionService(options = {}) {
	const now = options.now || Date.now;
	const getFont = options.source || (() => source(SOURCE));
	let original = null;
	const sessions = new Map();

	function find(sessionId) {
		const existing = sessions.get(sessionId);
		if (!existing) return null;
		if (existing.expiresAt <= now()) {
			sessions.delete(sessionId);
			return null;
		}
		return existing;
	}

	function create() {
		const start = performance.now();
		if (!original) original = getFont();
		for (const [key, value] of sessions) {
			if (value.expiresAt <= now()) sessions.delete(key);
		}
		while (sessions.size >= MAX_SESSIONS) sessions.delete(sessions.keys().next().value);
		const id = newSessionId();
		const plan = prepareSessionFont(original);
		const trueType = sfnt(newTables(plan.subset, plan.extras, plan.cmap));
		const binary = woff(trueType);
		const tokens = encodeDocument(PASSAGE, plan, id, "intro");
		const repeated = encodeDocument("אאאאא", plan, id, "repeat");
		assertEncoded(tokens);
		assertEncoded(repeated);
		const manifest = {
			version: 3,
			tokens,
			repeated,
			alephPieces: plan.choices.get("א").map(group => group[0]),
			fontUrl: "/api/glyph-lab/font",
			aliases: plan.cmap.size,
			variantsPerFragment: ALIASES_PER_FRAGMENT,
			fragmentedLetters: LETTERS.length,
			outlineCount: plan.sourceOutlineCount,
			fontBytes: binary.length,
			generationMs: Number((performance.now() - start).toFixed(2)),
			selectionMode: "atomic-logical-rtl",
			threat: "Cmap reveals equivalence classes, fragment geometry remains matchable and OCR can recover text."
		};
		const record = { id, manifest, binary, expiresAt: now() + EXPIRY_MS };
		sessions.set(id, record);
		return record;
	}

	return { create, find, sessionCount: () => sessions.size };
}
module.exports = { createSessionService, EXPIRY_MS, MAX_SESSIONS };
