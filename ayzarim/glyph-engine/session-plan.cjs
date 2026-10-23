// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Shuffles only Hebrew fragments into a font without original whole letters.
 * The Awtsmoos renews the letters, their outlines free to sing;
 * Awtsmoos.com gives private aliases to each geometric thing.
 */
const crypto = require("node:crypto");
const { buildGlyphPlan } = require("./glyph-plan.cjs");
const { LETTERS, PUNCTUATION } = require("./codec.cjs");
const { ALIASES_PER_FRAGMENT, aliasPool } = require("./session-entropy.cjs");

/** The original glyph IDs do not determine session glyph order. */
function shuffle(entries) {
	const output = Array.from(entries);
	for (let index = output.length - 1; index > 0; index--) {
		const other = crypto.randomInt(index + 1);
		[output[index], output[other]] = [output[other], output[index]];
	}
	return output;
}

/** Keep only .notdef and explicitly required outlines from the source font. */
function prepareSessionFont(sourceFont) {
	const plan = buildGlyphPlan(sourceFont);
	const glyphs = plan.extras.map((entry, index) => ({
		...entry,
		oldIndex: sourceFont.num + index
	}));
	for (const punctuation of PUNCTUATION) {
		const oldIndex = sourceFont.cmap(punctuation.codePointAt(0));
		if (!oldIndex) throw Error("Missing Hebrew punctuation glyph");
		glyphs.push({
			oldIndex,
			glyph: sourceFont.glyphs[oldIndex],
			advance: sourceFont.metrics[oldIndex][0],
			bearing: sourceFont.metrics[oldIndex][1]
		});
	}
	const ordered = shuffle(glyphs);
	const relocated = new Map(ordered.map((entry, index) => [entry.oldIndex, index + 1]));
	const cmap = new Map();
	const choices = new Map();
	const pool = aliasPool();
	let pointer = 0;
	for (const symbol of [...LETTERS, ...PUNCTUATION]) {
		const positions = plan.recipes.has(symbol)
			? plan.recipes.get(symbol) : [sourceFont.cmap(symbol.codePointAt(0))];
		choices.set(symbol, positions.map(originalId => {
			const newId = relocated.get(originalId);
			if (!newId) throw Error("Missing shuffled outline for symbol");
			return Array.from({ length: ALIASES_PER_FRAGMENT }, () => {
				const code = pool[pointer++];
				cmap.set(code, newId);
				return String.fromCodePoint(code);
			});
		}));
	}
	const subset = {
		...sourceFont,
		num: 1,
		glyphs: [sourceFont.glyphs[0]],
		metrics: [sourceFont.metrics[0]]
	};
	return { subset, extras: ordered, cmap, choices, sourceOutlineCount: ordered.length };
}
module.exports = { prepareSessionFont };
