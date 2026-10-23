// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file A font-only adversary recovers alias equivalences from WOFF1 cmap.
 * The Awtsmoos reveals both the wonder and the vulnerable shape;
 * Awtsmoos.com never mistakes a veil for an impossible escape.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const zlib = require("node:zlib");
const { sfnt } = require("./font-write.cjs");
const { source } = require("./font-source.cjs");
const { createSessionService } = require("./session-service.cjs");

/** Reconstitute the downloadable WOFF into the attacker's own TTF parser. */
function decodeWoff1(binary) {
	if (binary.toString("ascii", 0, 4) !== "wOFF") throw Error("Invalid WOFF1 signature");
	const count = binary.readUInt16BE(12);
	const tables = {};
	for (let index = 0; index < count; index++) {
		const offset = 44 + index * 20;
		const tag = binary.toString("ascii", offset, offset + 4);
		const start = binary.readUInt32BE(offset + 4);
		const compressed = binary.readUInt32BE(offset + 8);
		const original = binary.readUInt32BE(offset + 12);
		const slice = binary.subarray(start, start + compressed);
		const data = compressed === original ? slice : zlib.inflateSync(slice);
		if (data.length !== original) throw Error("Damaged WOFF1 table " + tag);
		tables[tag] = Buffer.from(data);
	}
	return sfnt(tables);
}

/** With nothing but a downloadable font, group all aliases by glyf index. */
function auditDownloadedFont(woffBuffer) {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), "glyph-adversary-"));
	try {
		const filename = path.join(folder, "extracted.ttf");
		fs.writeFileSync(filename, decodeWoff1(woffBuffer));
		const font = source(filename);
		const classes = new Map();
		for (let code = 0xE000; code <= 0xF8FF; code++) {
			const glyph = font.cmap(code);
			if (!glyph) continue;
			if (!classes.has(glyph)) classes.set(glyph, []);
			classes.get(glyph).push(code);
		}
		return {
			fontOnly: true,
			wholeSourceHebrewMapped: font.cmap(0x05D0) !== 0,
			glyphsAvailableToAttacker: font.num,
			aliasClassesRecoveredWithoutOcr: classes.size,
			aliasesRecovered: [...classes.values()].reduce((total, group) => total + group.length, 0),
			maxAliasesPerClass: Math.max(...[...classes.values()].map(group => group.length)),
			warning: "Equivalent cipher aliases are recoverable from downloadable font tables; source-font geometry or OCR can reveal Hebrew."
		};
	} finally {
		fs.rmSync(folder, { recursive: true, force: true });
	}
}
if (require.main === module) {
	const result = auditDownloadedFont(createSessionService().create().binary);
	console.log(JSON.stringify(result, null, 2));
}
module.exports = { auditDownloadedFont, decodeWoff1 };
