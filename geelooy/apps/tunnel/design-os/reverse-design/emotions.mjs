//B"H
/**
 * @file Emotion lexicon for Reverse Design.
 * @description 20 emotions, each a bundle of constraint-DSL source parameterized
 * by intensity t in [0,1]. Emotions are just bundles — they solve through the
 * shared Design OS pipeline (parse → validate → solve), so every emotional
 * intent becomes verifiable mathematics.
 *
 * Conventions:
 * - `dsl(t)` returns DSL text; numbers are scaled by intensity.
 * - `contrastFloor` is the WCAG contrast the palette is verified to meet
 *   (tests assert this with the solver's own contrastRatio — no mocks).
 * - `bundles` names shared-library bundles used as fallbacks.
 */

const r2 = (n) => Math.round(n * 100) / 100;
const tier = (t) => (t < 0.34 ? 0 : t < 0.67 ? 1 : 2);

/**
 * @typedef {Object} Emotion
 * @property {string} name
 * @property {string} description
 * @property {number} contrastFloor  WCAG contrast the palette guarantees.
 * @property {Array<string>} bundles  Shared-library bundle names (fallbacks).
 * @property {(t:number)=>string} dsl  Intensity-parameterized DSL source.
 */

export const EMOTIONS = [
	{
		name: "awe",
		description:
			"Vast, overwhelming, small-before-great. Monumental scale, deep contrast, almost no chrome, the void itself speaks.",
		contrastFloor: 7.0,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#201812", bg: "#faf6ee", accent: "#9a7414" },
				{ text: "#1c1510", bg: "#f8f3e8", accent: "#a87f16" },
				{ text: "#181209", bg: "#f5efe0", accent: "#b8860b" },
			][tier(t)];
			return `
title.fontSize = ${r2(3 + 3 * t)} * body.fontSize
title.lineHeight = 1.15 * title.fontSize
whitespace.ratio >= ${r2(0.35 + 0.25 * t)}
contrast(text.color, text.background) >= 7.0
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
chrome.count = ${t > 0.5 ? 1 : 3}
body.lineHeight >= 1.7 * body.fontSize
section.spacing >= 2em
motion.speed = "still"
`.trim();
		},
	},
	{
		name: "warmth",
		description:
			"Embrace-like. Warm paper, warm ink, generous air, soft edges. The page holds you.",
		contrastFloor: 4.5,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#3a2c1c", bg: "#fdf6ec", accent: "#8a5a30" },
				{ text: "#38281a", bg: "#fbf1e0", accent: "#96502a" },
				{ text: "#332416", bg: "#f8ecd6", accent: "#a34a2a" },
			][tier(t)];
			return `
title.fontSize = ${r2(2.2 + 1.3 * t)} * body.fontSize
body.lineHeight >= ${r2(1.7 + 0.2 * t)} * body.fontSize
whitespace.ratio >= ${r2(0.35 + 0.1 * t)}
contrast(text.color, text.background) >= 4.5
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
shape.radius >= ${Math.round(8 + 8 * t)}px
section.spacing >= 1.5em
motion.speed = "gentle"
`.trim();
		},
	},
	{
		name: "clarity",
		description:
			"Nothing hidden. Razor hierarchy, honest contrast, zero decoration. The thought arrives clean.",
		contrastFloor: 7.0,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#1a1a1a", bg: "#ffffff", accent: "#1a5fb4" },
				{ text: "#161616", bg: "#ffffff", accent: "#17549f" },
				{ text: "#101010", bg: "#fefefe", accent: "#144e96" },
			][tier(t)];
			return `
title.fontSize = ${r2(2.5 + 1 * t)} * body.fontSize
contrast(text.color, text.background) >= 7.0
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
chrome.count = 2
decoration.level = "none"
body.lineHeight >= 1.6 * body.fontSize
whitespace.ratio >= ${r2(0.3 + 0.1 * t)}
whitespace.intentionalShare >= 0.9
`.trim();
		},
	},
	{
		name: "joy",
		description:
			"Bright, alive, dancing. Saturated accents, generous type, energy in the rhythm.",
		contrastFloor: 4.5,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#2b2118", bg: "#fffdf6", accent: "#c2702a" },
				{ text: "#2a2016", bg: "#fff9ea", accent: "#cf5a22" },
				{ text: "#281e14", bg: "#fff4e0", accent: "#d44a2a" },
			][tier(t)];
			return `
title.fontSize = ${r2(2 + 2 * t)} * body.fontSize
contrast(text.color, text.background) >= 4.5
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio >= 0.3
body.lineHeight >= 1.6 * body.fontSize
motion.energy = "high"
shape.radius >= ${Math.round(6 + 6 * t)}px
`.trim();
		},
	},
	{
		name: "solemnity",
		description:
			"Heavy with meaning. Dark, quiet, slow, deliberate. Every word weighed.",
		contrastFloor: 7.0,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#e8e0d0", bg: "#141210", accent: "#8a7a5a" },
				{ text: "#ece4d4", bg: "#100e0c", accent: "#94855f" },
				{ text: "#f0e8d8", bg: "#0c0a08", accent: "#9c8f68" },
			][tier(t)];
			return `
title.fontSize = ${r2(2.5 + 1.5 * t)} * body.fontSize
title.lineHeight = 1.2 * title.fontSize
contrast(text.color, text.background) >= 7.0
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio >= ${r2(0.4 + 0.2 * t)}
body.lineHeight >= 1.8 * body.fontSize
chrome.count = 1
motion.speed = "slow"
`.trim();
		},
	},
	{
		name: "intimacy",
		description:
			"Close, personal, whispered. Small scale, narrow measure, warm — like a letter.",
		contrastFloor: 4.5,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#3d3226", bg: "#faf5ea", accent: "#8a5a30" },
				{ text: "#3a2f22", bg: "#f7f0e0", accent: "#96502a" },
				{ text: "#372c1e", bg: "#f4ebd8", accent: "#a34a2a" },
			][tier(t)];
			return `
title.fontSize = ${r2(1.5 + 0.7 * t)} * body.fontSize
title.fontSize <= 2.5 * body.fontSize
contrast(text.color, text.background) >= 4.5
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
layout.measure <= 32em
whitespace.ratio >= 0.25
whitespace.ratio <= 0.45
body.lineHeight >= 1.7 * body.fontSize
chrome.count = 1
`.trim();
		},
	},
	{
		name: "reverence",
		description:
			"Awe made quiet. Restrained scale, deep contrast, perfect stillness. Standing before.",
		contrastFloor: 7.0,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#241c12", bg: "#f7f2e8", accent: "#7a621c" },
				{ text: "#221a10", bg: "#f4eee0", accent: "#83681f" },
				{ text: "#20180e", bg: "#f1ead8", accent: "#8a6d1f" },
			][tier(t)];
			return `
title.fontSize = ${r2(2.5 + 1.5 * t)} * body.fontSize
contrast(text.color, text.background) >= 7.0
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio >= ${r2(0.4 + 0.2 * t)}
chrome.count = 2
rhythm.consistent = true
body.lineHeight >= 1.7 * body.fontSize
motion.speed = "still"
`.trim();
		},
	},
	{
		name: "wonder",
		description:
			"Awe with a smile. Grand scale lit by bright gold — the child seeing the sea.",
		contrastFloor: 4.5,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#1e1a14", bg: "#fbf7ec", accent: "#a87f22" },
				{ text: "#1c1812", bg: "#faf4e4", accent: "#b8892a" },
				{ text: "#1a1610", bg: "#f8f1dc", accent: "#c9962e" },
			][tier(t)];
			return `
title.fontSize = ${r2(3 + 2 * t)} * body.fontSize
contrast(text.color, text.background) >= 4.5
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio >= ${r2(0.35 + 0.15 * t)}
chrome.count = 2
body.lineHeight >= 1.6 * body.fontSize
motion.energy = "rising"
`.trim();
		},
	},
	{
		name: "calm",
		description:
			"Still water. Muted tones, low drama, even breath. Nothing demands.",
		contrastFloor: 4.5,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#4a4f52", bg: "#e8e8e6", accent: "#6a7a72" },
				{ text: "#4e5255", bg: "#e4e4e1", accent: "#64746c" },
				{ text: "#5a5e61", bg: "#dcdcd9", accent: "#5e6e66" },
			][tier(t)];
			return `
title.fontSize = ${r2(2 + 0.8 * t)} * body.fontSize
contrast(text.color, text.background) >= 4.5
contrast(text.color, text.background) <= 7.0
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio >= ${r2(0.4 + 0.1 * t)}
body.lineHeight >= 1.8 * body.fontSize
chrome.count = 1
motion.speed = "still"
`.trim();
		},
	},
	{
		name: "urgency",
		description:
			"Now. Tight, bold, high-contrast, forward-leaning. No room to linger.",
		contrastFloor: 7.0,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#141414", bg: "#ffffff", accent: "#a3241a" },
				{ text: "#101010", bg: "#ffffff", accent: "#b0281e" },
				{ text: "#0c0c0c", bg: "#fefefe", accent: "#c22a1c" },
			][tier(t)];
			return `
title.fontSize = ${r2(2.5 + 1 * t)} * body.fontSize
contrast(text.color, text.background) >= 7.0
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio <= ${r2(0.3 - 0.05 * t)}
body.lineHeight <= 1.5 * body.fontSize
chrome.count = 3
motion.speed = "quick"
`.trim();
		},
	},
	{
		name: "trust",
		description:
			"Solid ground. Balanced, symmetrical, predictable. The page keeps its promises.",
		contrastFloor: 4.5,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#2e3440", bg: "#fafafa", accent: "#3b6ea5" },
				{ text: "#2a303c", bg: "#f8f8f8", accent: "#38699e" },
				{ text: "#262c38", bg: "#f6f6f6", accent: "#356497" },
			][tier(t)];
			return `
title.fontSize = ${r2(2 + 0.8 * t)} * body.fontSize
contrast(text.color, text.background) >= 4.5
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio >= 0.3
whitespace.ratio <= 0.5
layout.symmetry = "mirror"
rhythm.consistent = true
body.lineHeight >= 1.6 * body.fontSize
`.trim();
		},
	},
	{
		name: "mystery",
		description:
			"Depths below depths. Dark, dramatic, half-revealed. What you cannot see draws you.",
		contrastFloor: 7.0,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#ded5c2", bg: "#0d0b09", accent: "#5b4a8a" },
				{ text: "#e2d9c6", bg: "#0b0908", accent: "#645394" },
				{ text: "#e6ddca", bg: "#090807", accent: "#6d5c9e" },
			][tier(t)];
			return `
title.fontSize = ${r2(2.8 + 1.7 * t)} * body.fontSize
contrast(text.color, text.background) >= 7.0
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio >= ${r2(0.4 + 0.15 * t)}
chrome.count = 1
body.lineHeight >= 1.7 * body.fontSize
motion.speed = "slow"
`.trim();
		},
	},
	{
		name: "gratitude",
		description:
			"Thanksgiving. Warm golden light, open and generous — the table is full.",
		contrastFloor: 4.5,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#33291a", bg: "#fff9ec", accent: "#a87f22" },
				{ text: "#302618", bg: "#fff6e4", accent: "#b8892a" },
				{ text: "#2d2316", bg: "#fff3dc", accent: "#c9962e" },
			][tier(t)];
			return `
title.fontSize = ${r2(2.2 + 1.3 * t)} * body.fontSize
contrast(text.color, text.background) >= 4.5
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio >= ${r2(0.35 + 0.15 * t)}
body.lineHeight >= 1.7 * body.fontSize
shape.radius >= ${Math.round(6 + 6 * t)}px
`.trim();
		},
	},
	{
		name: "longing",
		description:
			"Distance and desire. Cool tones, vast space, the far made near by yearning.",
		contrastFloor: 4.5,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#39424e", bg: "#f2f4f6", accent: "#4a6a8a" },
				{ text: "#333c48", bg: "#eceff2", accent: "#466480" },
				{ text: "#2c3540", bg: "#e6eaee", accent: "#425e76" },
			][tier(t)];
			return `
title.fontSize = ${r2(2.5 + 2 * t)} * body.fontSize
contrast(text.color, text.background) >= 4.5
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio >= ${r2(0.45 + 0.2 * t)}
body.lineHeight >= 1.8 * body.fontSize
chrome.count = 1
motion.speed = "slow"
`.trim();
		},
	},
	{
		name: "devotion",
		description:
			"Single-hearted. Warm dark, repetitive rhythm, intimate scale — davening at midnight.",
		contrastFloor: 7.0,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#f0e6d2", bg: "#1c1610", accent: "#a87f22" },
				{ text: "#f2e8d4", bg: "#181410", accent: "#b8892a" },
				{ text: "#f4ead6", bg: "#141210", accent: "#c9962e" },
			][tier(t)];
			return `
title.fontSize = ${r2(2 + 0.5 * t)} * body.fontSize
title.fontSize <= 2.8 * body.fontSize
contrast(text.color, text.background) >= 7.0
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
rhythm.consistent = true
whitespace.ratio >= ${r2(0.35 + 0.1 * t)}
body.lineHeight >= 1.8 * body.fontSize
chrome.count = 1
motion.speed = "still"
`.trim();
		},
	},
	{
		name: "celebration",
		description:
			"Exuberant. Bright and saturated, rhythmic, overflowing — simchas Torah.",
		contrastFloor: 4.5,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#2b1f16", bg: "#fff8ee", accent: "#b84a2a" },
				{ text: "#2a1e14", bg: "#fff4e2", accent: "#c64a28" },
				{ text: "#281c12", bg: "#fff0d6", accent: "#d44a2a" },
			][tier(t)];
			return `
title.fontSize = ${r2(2.5 + 2.5 * t)} * body.fontSize
contrast(text.color, text.background) >= 4.5
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio >= 0.3
rhythm.consistent = true
body.lineHeight >= 1.6 * body.fontSize
motion.energy = "high"
`.trim();
		},
	},
	{
		name: "contemplation",
		description:
			"Quiet study. Muted, spacious, slow — the beis midrash at dawn.",
		contrastFloor: 4.5,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#44403a", bg: "#f5f3ee", accent: "#7a7468" },
				{ text: "#403c36", bg: "#f2f0ea", accent: "#746e62" },
				{ text: "#3c3832", bg: "#efede6", accent: "#6e685c" },
			][tier(t)];
			return `
title.fontSize = ${r2(2 + 0.8 * t)} * body.fontSize
contrast(text.color, text.background) >= 4.5
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio >= ${r2(0.45 + 0.2 * t)}
body.lineHeight >= 1.8 * body.fontSize
chrome.count = 1
motion.speed = "still"
`.trim();
		},
	},
	{
		name: "strength",
		description:
			"Grounded and immovable. Bold, heavy, high-contrast — the rock.",
		contrastFloor: 7.0,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#ece5d8", bg: "#171310", accent: "#9a7414" },
				{ text: "#eee7da", bg: "#141110", accent: "#a87f16" },
				{ text: "#f0e9dc", bg: "#110f0e", accent: "#b8860b" },
			][tier(t)];
			return `
title.fontSize = ${r2(3 + 2 * t)} * body.fontSize
contrast(text.color, text.background) >= 7.0
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
body.lineHeight >= 1.6 * body.fontSize
whitespace.ratio >= 0.3
chrome.count = 2
layout.weight = "heavy"
`.trim();
		},
	},
	{
		name: "tenderness",
		description:
			"Gentle hands. Soft light, small scale, rounded — holding something fragile.",
		contrastFloor: 4.5,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#4a4038", bg: "#fdfaf4", accent: "#9a6a4a" },
				{ text: "#463c34", bg: "#fbf7f0", accent: "#a87152" },
				{ text: "#423830", bg: "#f9f4ec", accent: "#b0785a" },
			][tier(t)];
			return `
title.fontSize = ${r2(1.8 + 0.7 * t)} * body.fontSize
contrast(text.color, text.background) >= 4.5
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
shape.radius >= ${Math.round(12 + 8 * t)}px
whitespace.ratio >= ${r2(0.35 + 0.1 * t)}
body.lineHeight >= 1.7 * body.fontSize
motion.speed = "gentle"
`.trim();
		},
	},
	{
		name: "majesty",
		description:
			"Royal. Grand scale, gold on dark, formal symmetry — the King in His palace.",
		contrastFloor: 7.0,
		bundles: ["color-never-white-on-white"],
		dsl(t) {
			const pal = [
				{ text: "#f2e8cf", bg: "#14100a", accent: "#b8922e" },
				{ text: "#f4eacf", bg: "#120e09", accent: "#c09c2e" },
				{ text: "#f6eccf", bg: "#100c08", accent: "#d4a72c" },
			][tier(t)];
			return `
title.fontSize = ${r2(3.5 + 2.5 * t)} * body.fontSize
title.lineHeight = 1.2 * title.fontSize
contrast(text.color, text.background) >= 7.0
text.color = ${pal.text}
text.background = ${pal.bg}
title.color = text.color
title.background = text.background
accent.color = ${pal.accent}
whitespace.ratio >= ${r2(0.4 + 0.15 * t)}
chrome.count = 2
layout.symmetry = "mirror"
body.lineHeight >= 1.7 * body.fontSize
`.trim();
		},
	},
];

/** Look up an emotion by name; throws on unknown names (fail closed). */
export function getEmotion(name) {
	const e = EMOTIONS.find((x) => x.name === name);
	if (!e) {
		throw new Error(
			`Unknown emotion '${name}'. Known: ${EMOTIONS.map((x) => x.name).join(", ")}`
		);
	}
	return e;
}

/** All emotion names. */
export function listEmotions() {
	return EMOTIONS.map((e) => e.name);
}

/** Clamp intensity into [0,1]; throws on non-numbers (fail closed). */
export function clampIntensity(t) {
	if (typeof t !== "number" || Number.isNaN(t)) {
		throw new Error(`Intensity must be a number, got ${typeof t}`);
	}
	return Math.min(1, Math.max(0, t));
}
