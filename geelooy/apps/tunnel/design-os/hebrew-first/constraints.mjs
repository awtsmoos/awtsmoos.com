//B"H
/**
 * @file Hebrew-first constraint bundles for the Awtsmoos Design OS.
 * @description Constraint-DSL bundles expressing the Hebrew-first design contract:
 * RTL is the default, LTR is the opt-in mode; nikkud and taamim get the vertical
 * room they need; bidi isolation keeps mixed text correct. Same shape as the
 * shared constraint library ({name, category, description, source}) so the two
 * can be merged by the parent.
 *
 * Bundle sources are parsed by ../constraints/parser.mjs — only DSL features
 * that parser supports are used (paths, =, >=, in-ranges, keywords, strings,
 * dimensions, colors, and the built-in functions).
 */

const BUNDLES = [
	{
		name: "hf-rtl-default",
		category: "hebrew-first",
		description: "RTL is the default everywhere; Latin opts into LTR explicitly.",
		source: `
root.direction = rtl
hebrew.direction = rtl
body.direction = rtl
latin.direction = ltr
latin.unicodeBidi = "isolate"
`.trim(),
	},
	{
		name: "hf-nikkud-guard",
		category: "hebrew-first",
		description: "Declared guarantees: nikkud stays clear, line height accommodates marks.",
		source: `
hebrew.nikkud.clear = true
hebrew.lineHeight.accommodatesNikkud = true
hebrew.lineHeight.accommodatesTaamim = true
`.trim(),
	},
	{
		name: "hf-nikkud-type",
		category: "hebrew-first",
		description: "Nikkud typography: roomy lines, never transformed or hyphenated.",
		source: `
hebrew.lineHeight >= 1.7 * hebrew.fontSize
hebrew.textTransform = none
hebrew.hyphens = none
`.trim(),
	},
	{
		name: "hf-taamim-type",
		category: "hebrew-first",
		description: "Taamim typography: extra vertical room, never clip stacked marks.",
		source: `
hebrewTaamim.lineHeight >= 1.9 * hebrew.fontSize
hebrewTaamim.paddingBlock = 0.15em
hebrewTaamim.overflow = "visible"
`.trim(),
	},
	{
		name: "hf-font-stack",
		category: "hebrew-first",
		description: "Hebrew font stacks ordered by nikkud/taamim shaping quality.",
		source: `
hebrew.fontFamily = "Frank Ruehl CLM, David Libre, Noto Serif Hebrew, Ezra SIL, serif"
hebrewSans.fontFamily = "Heebo, Assistant, Noto Sans Hebrew, sans-serif"
latinSerif.fontFamily = "Georgia, Times New Roman, serif"
`.trim(),
	},
	{
		name: "hf-bidi",
		category: "hebrew-first",
		description: "Bidi isolation for embedded Latin runs and numbers.",
		source: `
bdi.unicodeBidi = "isolate"
latin.unicodeBidi = "isolate"
`.trim(),
	},
	{
		name: "hf-sofit-gershayim",
		category: "hebrew-first",
		description: "Acronyms with gershayim and maqaf-joined words never break across lines.",
		source: `
hebrewAcronym.whiteSpace = "nowrap"
hebrewMaqaf.whiteSpace = "nowrap"
hebrew.lineBreak = "normal"
`.trim(),
	},
	{
		name: "hf-sefer-rtl",
		category: "hebrew-first",
		description: "Full sefer page: warm paper, 4x Hebrew, English below in LTR isolate.",
		source: `
sefer.direction = rtl
sefer.background = #fffdf6
sefer.color = #2b2118
contrast(sefer.color, sefer.background) >= 7.0
hebrew.fontSize = 4 * body.fontSize
hebrew.textAlign = justify
english.position = below(hebrew)
english.direction = ltr
english.unicodeBidi = "isolate"
`.trim(),
	},
	{
		name: "hf-latin-mode",
		category: "hebrew-first",
		description: "The LTR opt-in mode: Latin subtrees declare themselves.",
		source: `
latinMode.direction = ltr
latinMode.textAlign = left
`.trim(),
	},
];

/** All Hebrew-first bundles. */
export const HF_BUNDLES = Object.freeze(BUNDLES.map((b) => Object.freeze({ ...b })));

/** Bundle names in the recommended default application order. */
export const HF_DEFAULT_SET = Object.freeze([
	"hf-rtl-default",
	"hf-font-stack",
	"hf-bidi",
	"hf-nikkud-guard",
	"hf-nikkud-type",
	"hf-sofit-gershayim",
]);

/** Full set including taamim tier and the complete sefer page. */
export const HF_TAAMIM_SET = Object.freeze([...HF_DEFAULT_SET, "hf-taamim-type"]);

/** Returns the DSL source for a Hebrew-first bundle by name. */
export function getHebrewBundle(name) {
	const b = BUNDLES.find((x) => x.name === name);
	if (!b) throw new Error(`Unknown Hebrew-first bundle '${name}'`);
	return b.source;
}

/** Lists Hebrew-first bundle names. */
export function listHebrewBundles() {
	return BUNDLES.map((b) => b.name);
}

/** Bundle count. */
export const HF_BUNDLE_COUNT = BUNDLES.length;
