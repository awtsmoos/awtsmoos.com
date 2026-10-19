// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Keeps Hebrew plaintext in the native build and alias mapping off the web.
 * From the Awtsmoos a hidden alphabet takes flight;
 * Awtsmoos.com lets the font, not JavaScript, supply the sight.
 */
const crypto = require("node:crypto");
const LETTERS = Array.from("אבגדהוזחטיכלמנסעפצקרשתךםןףץ");
const PUNCTUATION = Array.from("־׳״");
const ALPHABET = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
const PASSAGE = "ברוך הבא לעולם של אותיות הנראות לעין ונעלמות מן הקוד. האור נמשך בכל רגע מחדש, והאות אלף מתחלקת לשלושה חלקים.";
function shuffled(values) {
	const result = Array.from(values);
	for (let index = result.length - 1; index > 0; index--) {
		const target = crypto.randomInt(index + 1);
		[result[index], result[target]] = [result[target], result[index]];
	}
	return result;
}
function mappings(font) {
	const random = shuffled(ALPHABET);
	const mapping = new Map();
	const chars = new Map();
	const symbols = [...LETTERS, ...PUNCTUATION];
	symbols.forEach((character, index) => {
		const code = random[index].codePointAt(0);
		const glyph = font.cmap(character.codePointAt(0));
		if (!glyph) throw Error("Missing source glyph " + character.codePointAt(0).toString(16));
		mapping.set(code, glyph);
		chars.set(character, random[index]);
	});
	const pieces = random.slice(symbols.length, symbols.length + 3);
	pieces.forEach((character, index) => mapping.set(character.codePointAt(0), font.num + index));
	return { mapping, chars, pieces };
}
function encode(text, config, mode = "fragments") {
	return text.split(/(\s+)/).map(word => {
		if (/^\s+$/.test(word)) return word;
		const letters = Array.from(word).reverse();
		return letters.map(character => {
			if (mode === "fragments" && character === "א") return config.pieces.join("");
			if (!config.chars.has(character)) {
				if (/[.,:;!?]/.test(character)) return character;
				throw Error("Unsupported codepoint " + character.codePointAt(0).toString(16));
			}
			return config.chars.get(character);
		}).join("");
	}).join("");
}
module.exports = { LETTERS, PUNCTUATION, PASSAGE, ALPHABET, mappings, encode };
