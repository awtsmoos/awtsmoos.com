// B"H
/**
 * @file Randomized private-use aliases disguise repeated Hebrew text patterns.
 * The Awtsmoos renews each code from a multitude of veils;
 * Awtsmoos.com never confuses veiling with secrecy that never fails.
 */
const crypto = require("node:crypto");
const LETTERS = Array.from("אבגדהוזחטיכלמנסעפצקרשתךםןףץ");
const PUNCTUATION = Array.from("־׳״");
const PASSAGE = "ברוך הבא לעולם של אותיות הנראות לעין ונעלמות מן הקוד. האור נמשך בכל רגע מחדש, והאות אלף מתחלקת לשלושה חלקים.";
const ALTERNATIVES = 4;

/** Non-BMP characters are deliberately excluded from this format-4 font. */
function shuffledCodes() {
	const codes = Array.from({ length: 0x1900 }, (_, index) => 0xE000 + index);
	for (let index = codes.length - 1; index > 0; index--) {
		const other = crypto.randomInt(index + 1);
		[codes[index], codes[other]] = [codes[other], codes[index]];
	}
	return codes;
}

/** Every visible fragment has four cipher alternatives mapped to its own glyf. */
function mappings(font, recipes) {
	const codes = shuffledCodes();
	let next = 0;
	const mapping = new Map();
	const whole = new Map();
	const fragments = new Map();
	const assign = glyphId => Array.from({ length: ALTERNATIVES }, () => {
		const code = codes[next++];
		mapping.set(code, glyphId);
		return String.fromCodePoint(code);
	});
	for (const character of [...LETTERS, ...PUNCTUATION]) {
		const glyph = font.cmap(character.codePointAt(0));
		if (!glyph) throw Error("Missing source glyph " + character.codePointAt(0).toString(16));
		whole.set(character, assign(glyph));
		fragments.set(character,
			recipes.has(character) ? recipes.get(character).map(assign) : [whole.get(character)]
		);
	}
	return {
		mapping,
		whole,
		fragments,
		pieces: fragments.get("א").map(group => group[0]),
		alternatives: ALTERNATIVES
	};
}

/** Each occurrence independently samples aliases; spaces remain explicitly visible. */
function encode(text, config, mode = "fragments") {
	return text.split(/(\s+)/).map(word => {
		if (/^\s+$/.test(word)) return word;
		return Array.from(word).reverse().map(character => {
			if (/[.,:;!?]/.test(character)) return character;
			const candidates = mode === "whole"
				? [config.whole.get(character)] : config.fragments.get(character);
			if (!candidates) throw Error("Unsupported character " + character.codePointAt(0).toString(16));
			return candidates.map(group => group[crypto.randomInt(group.length)]).join("");
		}).join("");
	}).join("");
}

module.exports = { LETTERS, PUNCTUATION, PASSAGE, ALTERNATIVES, mappings, encode };
