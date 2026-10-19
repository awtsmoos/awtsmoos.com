// B"H
/**
 * @file Demonstrates how a downloadable font exposes equivalent cipher aliases.
 * The Awtsmoos reveals what a veil can and cannot hide;
 * Awtsmoos.com counts the glyph IDs on the adversary's side.
 */
const { source } = require("./font-source.cjs");
const fs = require("node:fs");

function audit(fontPath, fixturePath) {
	const font = source(fontPath);
	const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
	const groups = new Map();
	const seen = new Set();
	for (const code of Array.from(fixture.fragments)) {
		const number = code.codePointAt(0);
		if (number < 0xE000 || number > 0xF8FF) continue;
		seen.add(number);
		const glyphId = font.cmap(number);
		if (!glyphId) throw Error("Encoded codepoint missing from downloadable font");
		if (!groups.has(glyphId)) groups.set(glyphId, new Set());
		groups.get(glyphId).add(number);
	}
	const report = {
		encodedCodepointsObserved: seen.size,
		glyphClassesVisibleToAttacker: groups.size,
		aliasesThatShareGlyphId: [...groups.values()].filter(codes => codes.size > 1).length,
		privateUseCharacters: true,
		whitespaceVisible: /\s/u.test(fixture.fragments),
		fontRecoverable: true,
		offlineGlyphIdRecovery: "Full cmap permits grouping every encoded character by glyph ID without OCR.",
		plaintextRecovery: "Mapping rendered shapes back to Hebrew still requires visual or source-font matching; neither is blocked."
	};
	return report;
}
if (require.main === module) {
	const path = require("node:path");
	const folder = path.resolve(__dirname, "../../geelooy/tests/glyph-engine");
	console.log(JSON.stringify(audit(path.join(folder, "glyph.ttf"), path.join(folder, "experiment.json")), null, 2));
}
module.exports = { audit };
