//B"H
/**
 * @file Hebrew typography primitives for the Hebrew-First Design System.
 * @description Unicode ranges, font stacks, and line-height policy for Hebrew text
 * with nikkud (vowel points) and taamim (cantillation marks). Hebrew-first means
 * these are the DEFAULTS — Latin typography is the opt-in mode, not the other
 * way around.
 */

/** Any Hebrew letter (U+05D0–U+05EA). */
export const HEBREW_LETTER_RE = /[\u05D0-\u05EA]/;

/** Sofit (final) letters: ך ם ן ף ץ (U+05DA U+05DD U+05DF U+05E3 U+05E5). */
export const SOFIT_LETTERS = new Set(["\u05DA", "\u05DD", "\u05DF", "\u05E3", "\u05E5"]);
export const SOFIT_RE = /[\u05DA\u05DD\u05DF\u05E3\u05E5]/g;

/**
 * Nikkud: vowel points, dagesh/mapiq, meteg, rafe, shin/sin dots, qamats qatan.
 * All are nonspacing marks that need vertical room around the line.
 * Built from explicit ranges (U+05B0–U+05BD, U+05BF, U+05C1–U+05C2, U+05C7).
 */
export const NIKKUD_RANGES = [
	[0x05b0, 0x05b9], // vowels: sheva..holam
	[0x05ba, 0x05ba], // holam haser (vav)
	[0x05bb, 0x05bd], // qubutz, dagesh/mapiq, meteg
	[0x05bf, 0x05bf], // rafe
	[0x05c1, 0x05c2], // shin dot, sin dot
	[0x05c7, 0x05c7], // qamats qatan
];
export const NIKKUD_PATTERN = new RegExp(
	"[" + NIKKUD_RANGES.map(([a, b]) => "\\u" + a.toString(16).padStart(4, "0") + "-\\u" + b.toString(16).padStart(4, "0")).join("") + "]",
	"g"
);

/** Taamim (cantillation marks): U+0591–U+05AF. Render above AND below letters. */
export const TAAMIM_PATTERN = new RegExp("[\\u0591-\\u05af]", "g");

/** Hebrew punctuation. */
export const GERESH = "׳"; // U+05F3
export const GERSHAYIM = "״"; // U+05F4
export const MAQAF = "־"; // U+05BE (word joiner, do not break)
export const SOF_PASUQ = "׃"; // U+05C3
export const PASEQ = "׀"; // U+05C0

/** Latin detection (for mixed-content bidi handling). */
export const LATIN_RE = /[A-Za-z]/;

/** Digit detection (verse numbers etc. inside Hebrew need bidi isolation). */
export const DIGIT_RE = /[0-9]/;

/**
 * Hebrew serif stack — ordered by nikkud/taamim shaping quality.
 * Frank Ruehl and David Libre have the best mark positioning; Noto Serif Hebrew
 * is the reliable cross-platform fallback; Ezra SIL covers rare taamim.
 */
export const HEBREW_SERIF_STACK =
	'"Frank Ruehl CLM", "David Libre", "Noto Serif Hebrew", "Ezra SIL", "SBL Hebrew", serif';

/** Hebrew sans stack for UI chrome (never for sacred body text). */
export const HEBREW_SANS_STACK =
	'"Heebo", "Assistant", "Noto Sans Hebrew", sans-serif';

/** Latin serif for the English "mode" (matches the warm sefer feel). */
export const LATIN_SERIF_STACK =
	'Georgia, "Times New Roman", "Noto Serif", serif';

/**
 * Line-height policy. Marks stack vertically, so each layer needs more room:
 *  - plain Hebrew:        1.5
 *  - with nikkud:         1.7  (vowels above/below)
 *  - with taamim:         1.9  (cantillation above AND below, can stack)
 */
export const LINE_HEIGHT_POLICY = Object.freeze({
	plain: 1.5,
	nikkud: 1.7,
	taamim: 1.9,
});

/**
 * Minimum font size (px) at which nikkud stays legible on low-dpi screens.
 * Below this, vowel points blur together.
 */
export const NIKKUD_MIN_FONT_PX = 14;

/** Count non-overlapping matches of a global regex in text. */
export function countMatches(text, pattern) {
	pattern.lastIndex = 0;
	let n = 0;
	while (pattern.exec(text) !== null) n++;
	pattern.lastIndex = 0;
	return n;
}

/** Strips HTML/XML tags so analysis runs on real text (sources carry markup). */
export function stripTags(text) {
	return String(text).replace(/<[^>]*>/g, "");
}

/** True when the word ends with a sofit letter (correct final form present). */
export function endsWithSofit(word) {
	if (!word) return false;
	return SOFIT_LETTERS.has(word[word.length - 1]);
}
