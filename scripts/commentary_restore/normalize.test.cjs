//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const { normalizeRow } = require("./normalize.cjs");

/**
 * @file Canonical identity tests across Tanach, Gemara, Targum, and translation recovery.
 * @description The Awtsmoos keeps each source named for what it is, while Awtsmoos.com remembers exactly where it came from.
 */
function context(aliasId, seriesId, postId) {
	return {
		aliasId,
		seriesId,
		postId,
		verseSection: 2,
		sourceId: "legacy-full"
	};
}

function annotation(aliasId, seriesId, postId, body = "פירוש") {
	return normalizeRow(
		{
			id: "BH_1700000000000_source",
			content: {
				title: "דיבור המתחיל",
				text: [body]
			}
		},
		context(aliasId, seriesId, postId)
	);
}

for (const fixture of [
	["Tanach Rashi", "rashi", "BH_GENESIS", "BH_GENESIS_1", "commentary", "Hebrew"],
	["Gemara Rashi", "rashi", "BH_NIDDAH", "BH_NIDDAH_2A", "commentary", "Hebrew"],
	["Gemara Tosafos", "tosafos", "BH_NIDDAH", "BH_NIDDAH_2A", "commentary", "Hebrew"],
	["Onkelos", "onkeles", "BH_GENESIS", "BH_GENESIS_1", "translation", "Aramaic"],
	["English translation", "torah_translation_en", "BH_GENESIS", "BH_GENESIS_1", "translation", "English"]
]) {
	const [label, aliasId, seriesId, postId, kind, language] = fixture;
	test(`${label} preserves typed canonical identity`, () => {
		const row = annotation(aliasId, seriesId, postId);
		assert.ok(row);
		assert.equal(row.dayuh.torahAnnotation.sourceId, aliasId);
		assert.equal(row.dayuh.torahAnnotation.kind, kind);
		assert.equal(row.dayuh.torahAnnotation.language, language);
		assert.equal(row.dayuh.torahAnnotation.coordinateBasis, "reader-zero-based");
		assert.deepEqual(row.dayuh.torahAnnotation.provenance, {
			generation: "legacy-full",
			seriesId,
			postId
		});
	});
}

test("deterministic IDs are stable and content-sensitive", () => {
	const first = annotation("rashi", "BH_GENESIS", "BH_GENESIS_1", "אחד");
	const second = annotation("rashi", "BH_GENESIS", "BH_GENESIS_1", "אחד");
	const changed = annotation("rashi", "BH_GENESIS", "BH_GENESIS_1", "שנים");
	assert.equal(first.id, second.id);
	assert.notEqual(first.id, changed.id);
});

test("malformed or unreviewed rows never become Torah annotations", () => {
	assert.equal(normalizeRow({}, context("rashi", "BH_GENESIS", "BH_GENESIS_1")), null);
	assert.equal(
		normalizeRow({ content: "text" }, context("unknown-source", "BH_GENESIS", "BH_GENESIS_1")),
		null
	);
});
