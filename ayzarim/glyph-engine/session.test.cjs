// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Verifies each session's true font, HMAC variants and remaining attack surface.
 * The Awtsmoos gives a new font, but truth must be tested;
 * Awtsmoos.com finds each shape even when codes are well-disguised.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { source } = require("./font-source.cjs");
const { checksum } = require("./font-write.cjs");
const { createSessionService, EXPIRY_MS, MAX_SESSIONS } = require("./session-service.cjs");
const { ALIASES_PER_FRAGMENT } = require("./session-entropy.cjs");
const { assertEncoded } = require("./session-encoder.cjs");

test("five repeated Alephs have five distinct three-fragment encodings", () => {
	const session = createSessionService().create();
	assert.equal(session.manifest.version, 3);
	assert.equal(session.manifest.repeated.length, 5);
	assert.equal(new Set(session.manifest.repeated).size, 5);
	for (const token of session.manifest.repeated) assert.equal(token.length, 3);
});

test("24 different codepoints map to each of 81 shuffled outlines", () => {
	const session = createSessionService().create();
	const data = session.manifest;
	assert.equal(data.variantsPerFragment, ALIASES_PER_FRAGMENT);
	assert.equal(data.aliases, 81 * ALIASES_PER_FRAGMENT);
	assert.equal(data.fragmentedLetters, 27);
	assert.equal(data.outlineCount, 81);
	assertEncoded(data.tokens);
	assert.ok(data.tokens.includes(" "));
	assert.ok(data.tokens.includes("."));
	assert.equal(data.tokens.join("").includes("שלום"), false);
});

test("session fonts are valid TrueType with no source full Hebrew glyphs", () => {
	const session = createSessionService().create();
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "glyph-session-test-"));
	try {
		const fontFile = path.join(directory, "session.ttf");
		const fontSource = source(path.join(__dirname, "source/NotoSansHebrew-Regular.ttf"));
		const { prepareSessionFont } = require("./session-plan.cjs");
		const { sfnt, newTables } = require("./font-write.cjs");
		const plan = prepareSessionFont(fontSource);
		const binary = sfnt(newTables(plan.subset, plan.extras, plan.cmap));
		fs.writeFileSync(fontFile, binary);
		const parsed = source(fontFile);
		assert.equal(checksum(binary), 0xB1B0AFBA);
		assert.equal(parsed.num, 82);
		assert.notEqual(parsed.cmap(0x05D0), fontSource.cmap(0x05D0));
		assert.equal(parsed.cmap(0x05D0), 0);
		assert.equal(session.binary.toString("ascii", 0, 4), "wOFF");
		assert.equal(session.binary.length, session.manifest.fontBytes);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

test("session isolation, TTL and capacity limits are enforced", () => {
	let now = 100;
	const service = createSessionService({ now: () => now });
	const a = service.create();
	const b = service.create();
	assert.notEqual(a.id, b.id);
	assert.notEqual(a.manifest.tokens.join(""), b.manifest.tokens.join(""));
	assert.strictEqual(service.find(a.id), a);
	now += EXPIRY_MS;
	assert.equal(service.find(a.id), null);
	assert.strictEqual(service.find(b.id), null);
	for (let index = 0; index < MAX_SESSIONS + 2; index++) service.create();
	assert.equal(service.sessionCount(), MAX_SESSIONS);
});
