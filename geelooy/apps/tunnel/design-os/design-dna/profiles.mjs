//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Design tradition profiles for the Awtsmoos Design OS.
 * @description Five design traditions as constraint-DSL bundles. Each profile is
 * grounded in real printed exemplars (cited in `sources`), not stereotypes:
 * a profile's palette, scale, density, and ornament were read off actual
 * seforim and publications of that tradition.
 *
 * Bundle shape matches the shared constraint library:
 *   { name, tradition, description, sources, dna, palette, source }
 * where `source` is constraint-DSL text (parse with ../constraints/parser.mjs)
 * and `dna` is a coordinate in the dimension space defined in dna.mjs.
 *
 * Profiles deliberately avoid every path set by the Hebrew-first structural
 * bundles (hf-rtl-default, hf-nikkud-guard, hf-font-stack, hf-bidi), so a
 * profile can be combined with them without validator conflicts.
 */

export const PROFILES = Object.freeze([
	{
		name: "chabad",
		tradition: "Chabad",
		description:
			"Clean, clear, warm. The Kehot look: dark ink on warm paper, strong " +
			"hierarchy, generous margins, minimal ornament, deep-blue accent.",
		sources: Object.freeze([
			"Kehot Publication Society: Tanya (bilingual edition) — cream paper, black serif, clear section heads",
			"Kehot: Likkutei Sichos — numbered sichos, generous leading, blue cover accents",
			"Chabad.org article typography — high readability, warm neutrals",
		]),
		dna: Object.freeze({
			"typography.scale": 4.0,
			"typography.bodySize": 16,
			"typography.lineHeight": 1.7,
			"spacing.density": 0.35,
			"color.warmth": 0.6,
			"color.contrastFloor": 7.0,
			"ornament.level": "minimal",
			"formality.level": "balanced",
		}),
		palette: Object.freeze({
			background: "#fffdf6",
			color: "#2b2118",
			accent: "#1e3a6e",
		}),
		source: `
body.fontSize = 16px
body.lineHeight = 1.7 * body.fontSize
body.fontWeight = 400
title.fontSize = 4 * body.fontSize
title.lineHeight = 1.25 * title.fontSize
title.fontWeight = 700
title.marginTop = 2 * body.fontSize
title.marginBottom = 1 * body.fontSize
section.marginTop = 2.5 * body.fontSize
section.marginBottom = 2.5 * body.fontSize
paragraph.marginBottom = 1 * body.fontSize
content.maxWidth = 34em
paper.background = #fffdf6
paper.color = #2b2118
contrast(paper.color, paper.background) >= 7.0
accent.color = #1e3a6e
link.color = accent.color
ornament.level = "minimal"
`.trim(),
	},
	{
		name: "litvish",
		tradition: "Litvish",
		description:
			"Dense, serious, black-and-white. The Vilna Shas page: small type, " +
			"maximum content per page, no color, modest hierarchy — the text is king.",
		sources: Object.freeze([
			"Vilna Shas (Talmud Bavli, Romm edition) — dense black-on-white, Rashi script margins, minimal hierarchy",
			"Classic yeshiva seforim (e.g. Mishnah Berurah) — compact setting, narrow margins, formal tone",
		]),
		dna: Object.freeze({
			"typography.scale": 2.0,
			"typography.bodySize": 14,
			"typography.lineHeight": 1.5,
			"spacing.density": 0.85,
			"color.warmth": 0.1,
			"color.contrastFloor": 7.0,
			"ornament.level": "none",
			"formality.level": "formal",
		}),
		palette: Object.freeze({
			background: "#ffffff",
			color: "#111111",
			accent: "#111111",
		}),
		source: `
body.fontSize = 14px
body.lineHeight = 1.5 * body.fontSize
body.fontWeight = 400
title.fontSize = 2 * body.fontSize
title.lineHeight = 1.3 * title.fontSize
title.fontWeight = 700
title.marginTop = 1.5 * body.fontSize
title.marginBottom = 0.75 * body.fontSize
section.marginTop = 1.5 * body.fontSize
section.marginBottom = 1.5 * body.fontSize
paragraph.marginBottom = 0.75 * body.fontSize
content.maxWidth = 40em
paper.background = #ffffff
paper.color = #111111
contrast(paper.color, paper.background) >= 7.0
accent.color = #111111
link.color = accent.color
ornament.level = "none"
`.trim(),
	},
	{
		name: "sephardic",
		tradition: "Sephardic",
		description:
			"Ornate, warm, dignified. Classic Sephardic seforim: warm parchment, " +
			"gold and deep-red accents, decorative title pages, formal warmth.",
		sources: Object.freeze([
			"Classic Sephardic title pages — ornamental frames, gold/red lettering on parchment",
			"Sephardic siddurim (e.g. Kol Yaakov) — warm paper, decorative rules, formal layout",
		]),
		dna: Object.freeze({
			"typography.scale": 3.0,
			"typography.bodySize": 16,
			"typography.lineHeight": 1.75,
			"spacing.density": 0.5,
			"color.warmth": 0.9,
			"color.contrastFloor": 4.5,
			"ornament.level": "rich",
			"formality.level": "formal",
		}),
		palette: Object.freeze({
			background: "#fdf6e3",
			color: "#3a2410",
			accent: "#8b1a1a",
		}),
		source: `
body.fontSize = 16px
body.lineHeight = 1.75 * body.fontSize
body.fontWeight = 400
title.fontSize = 3 * body.fontSize
title.lineHeight = 1.3 * title.fontSize
title.fontWeight = 700
title.marginTop = 2 * body.fontSize
title.marginBottom = 1.25 * body.fontSize
section.marginTop = 2.5 * body.fontSize
section.marginBottom = 2 * body.fontSize
paragraph.marginBottom = 1 * body.fontSize
content.maxWidth = 36em
paper.background = #fdf6e3
paper.color = #3a2410
contrast(paper.color, paper.background) >= 4.5
accent.color = #8b1a1a
link.color = accent.color
ornament.level = "rich"
`.trim(),
	},
	{
		name: "chassidic",
		tradition: "Chassidic",
		description:
			"Warm, story-like, inviting. Chassidic story collections: larger " +
			"inviting type, airy lines, amber warmth, gentle ornament.",
		sources: Object.freeze([
			"Chassidic story collections (e.g. Sippurei Chassidim) — narrative warmth, inviting setting",
			"Warm illustrated seforim for families — soft palettes, generous spacing",
		]),
		dna: Object.freeze({
			"typography.scale": 3.5,
			"typography.bodySize": 17,
			"typography.lineHeight": 1.8,
			"spacing.density": 0.25,
			"color.warmth": 0.8,
			"color.contrastFloor": 4.5,
			"ornament.level": "moderate",
			"formality.level": "warm",
		}),
		palette: Object.freeze({
			background: "#faf5ea",
			color: "#3a2c1c",
			accent: "#a05e1a",
		}),
		source: `
body.fontSize = 17px
body.lineHeight = 1.8 * body.fontSize
body.fontWeight = 400
title.fontSize = 3.5 * body.fontSize
title.lineHeight = 1.25 * title.fontSize
title.fontWeight = 700
title.marginTop = 2 * body.fontSize
title.marginBottom = 1.25 * body.fontSize
section.marginTop = 2.5 * body.fontSize
section.marginBottom = 2.5 * body.fontSize
paragraph.marginBottom = 1.25 * body.fontSize
content.maxWidth = 34em
paper.background = #faf5ea
paper.color = #3a2c1c
contrast(paper.color, paper.background) >= 4.5
accent.color = #a05e1a
link.color = accent.color
ornament.level = "moderate"
`.trim(),
	},
	{
		name: "modern",
		tradition: "Modern",
		description:
			"Minimal, digital-first, accessible. Contemporary web typography: " +
			"large body text, abundant whitespace, no ornament, AAA contrast.",
		sources: Object.freeze([
			"Contemporary accessible web typography — 18px body, generous measure, minimal chrome",
			"Digital-first sefer readers — clean screens, focus on legibility",
		]),
		dna: Object.freeze({
			"typography.scale": 2.5,
			"typography.bodySize": 18,
			"typography.lineHeight": 1.7,
			"spacing.density": 0.2,
			"color.warmth": 0.2,
			"color.contrastFloor": 7.0,
			"ornament.level": "none",
			"formality.level": "balanced",
		}),
		palette: Object.freeze({
			background: "#ffffff",
			color: "#1a1a1a",
			accent: "#2563eb",
		}),
		source: `
body.fontSize = 18px
body.lineHeight = 1.7 * body.fontSize
body.fontWeight = 400
title.fontSize = 2.5 * body.fontSize
title.lineHeight = 1.2 * title.fontSize
title.fontWeight = 700
title.marginTop = 2 * body.fontSize
title.marginBottom = 1 * body.fontSize
section.marginTop = 3 * body.fontSize
section.marginBottom = 3 * body.fontSize
paragraph.marginBottom = 1 * body.fontSize
content.maxWidth = 34em
paper.background = #ffffff
paper.color = #1a1a1a
contrast(paper.color, paper.background) >= 7.0
accent.color = #2563eb
link.color = accent.color
ornament.level = "none"
`.trim(),
	},
]);

/** Profile names in canonical order. */
export const PROFILE_NAMES = Object.freeze(PROFILES.map((p) => p.name));

/**
 * Returns the profile object for a tradition name.
 * @throws on unknown name.
 */
export function getProfile(name) {
	const p = PROFILES.find((x) => x.name === name);
	if (!p) throw new Error(`Unknown design tradition '${name}'. Known: ${PROFILE_NAMES.join(", ")}`);
	return p;
}

/** Lists profile names with one-line descriptions. */
export function listProfiles() {
	return PROFILES.map((p) => ({ name: p.name, tradition: p.tradition, description: p.description }));
}
