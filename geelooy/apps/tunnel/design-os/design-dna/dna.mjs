//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Design DNA dimensions for the Awtsmoos Design OS.
 * @description Every design tradition is a point in a shared dimensional space.
 * Dimensions are the measurable axes along which traditions differ; profiles
 * (profiles.mjs) assign each tradition a coordinate. The blender (blender.mjs)
 * interpolates between coordinates to synthesize new traditions.
 *
 * Dimensions:
 *   typography.scale      — title-to-body size ratio (e.g. 4.0 = sefer 4x)
 *   typography.bodySize   — base body font size in px
 *   typography.lineHeight — body line-height as a multiple of body font size
 *   spacing.density       — 0..1, 0 = airy/minimal, 1 = dense/maximal content
 *   color.warmth          — 0..1, 0 = cool/neutral, 1 = warm (cream, gold, amber)
 *   color.contrastFloor   — minimum WCAG contrast ratio for body text
 *   ornament.level        — "none" | "minimal" | "moderate" | "rich"
 *   formality.level       — "formal" | "balanced" | "warm"
 *
 * Design basis: each coordinate was chosen from real printed exemplars —
 * Kehot publications (Chabad), the Vilna Shas page (Litvish), classic
 * Sephardic title pages and seforim, Chassidic story collections, and
 * contemporary accessible web typography (Modern). See profiles.mjs for the
 * per-tradition sources.
 */

/** Ordered dimension keys. */
export const DIMENSIONS = Object.freeze([
	"typography.scale",
	"typography.bodySize",
	"typography.lineHeight",
	"spacing.density",
	"color.warmth",
	"color.contrastFloor",
	"ornament.level",
	"formality.level",
]);

/** Human-readable description of each dimension. */
export const DIMENSION_DESCRIPTIONS = Object.freeze({
	"typography.scale": "Title-to-body size ratio. Higher = more dramatic hierarchy.",
	"typography.bodySize": "Base body font size in px. Higher = larger, more inviting type.",
	"typography.lineHeight": "Body line-height as a multiple of body font size. Higher = airier lines.",
	"spacing.density": "0..1. 0 = airy and minimal, 1 = dense, maximal content per page.",
	"color.warmth": "0..1. 0 = cool/neutral (white, gray, blue), 1 = warm (cream, gold, amber).",
	"color.contrastFloor": "Minimum WCAG contrast ratio enforced for body text.",
	"ornament.level": "\"none\" | \"minimal\" | \"moderate\" | \"rich\". Decorative borders, rules, flourishes.",
	"formality.level": "\"formal\" | \"balanced\" | \"warm\". The visual tone of the language.",
});

/** Numeric dimensions (interpolable by the blender). */
export const NUMERIC_DIMENSIONS = Object.freeze([
	"typography.scale",
	"typography.bodySize",
	"typography.lineHeight",
	"spacing.density",
	"color.warmth",
	"color.contrastFloor",
]);

/** Categorical dimensions (blended by weighted vote). */
export const CATEGORICAL_DIMENSIONS = Object.freeze([
	"ornament.level",
	"formality.level",
]);

const ORNAMENT_ORDER = ["none", "minimal", "moderate", "rich"];
const FORMALITY_ORDER = ["formal", "balanced", "warm"];

/**
 * Validates a DNA coordinate object.
 * @param {Object} dna
 * @returns {{ok:boolean, errors:Array<string>}}
 */
export function validateDNA(dna) {
	const errors = [];
	for (const dim of DIMENSIONS) {
		if (!(dim in dna)) {
			errors.push(`Missing dimension: ${dim}`);
			continue;
		}
		const v = dna[dim];
		if (NUMERIC_DIMENSIONS.includes(dim)) {
			if (typeof v !== "number" || !Number.isFinite(v)) {
				errors.push(`Dimension ${dim} must be a finite number, got ${JSON.stringify(v)}`);
			}
		}
	}
	if (typeof dna["spacing.density"] === "number" &&
		(dna["spacing.density"] < 0 || dna["spacing.density"] > 1)) {
		errors.push("spacing.density must be in [0,1]");
	}
	if (typeof dna["color.warmth"] === "number" &&
		(dna["color.warmth"] < 0 || dna["color.warmth"] > 1)) {
		errors.push("color.warmth must be in [0,1]");
	}
	if (!ORNAMENT_ORDER.includes(dna["ornament.level"])) {
		errors.push(`ornament.level must be one of ${ORNAMENT_ORDER.join("|")}`);
	}
	if (!FORMALITY_ORDER.includes(dna["formality.level"])) {
		errors.push(`formality.level must be one of ${FORMALITY_ORDER.join("|")}`);
	}
	return { ok: errors.length === 0, errors };
}

/**
 * Euclidean distance between two DNA coordinates over numeric dimensions.
 * Categorical dimensions contribute 0 (same) or 1 (different), half-weighted.
 */
export function dnaDistance(a, b) {
	let sum = 0;
	for (const dim of NUMERIC_DIMENSIONS) {
		const d = (a[dim] ?? 0) - (b[dim] ?? 0);
		sum += d * d;
	}
	for (const dim of CATEGORICAL_DIMENSIONS) {
		if (a[dim] !== b[dim]) sum += 0.5;
	}
	return Math.sqrt(sum);
}

/**
 * One-line human description of a DNA coordinate.
 */
export function describeDNA(dna) {
	const parts = [
		`scale ${dna["typography.scale"]}x`,
		`${dna["typography.bodySize"]}px body`,
		`lh ${dna["typography.lineHeight"]}`,
		dna["spacing.density"] >= 0.66 ? "dense" : dna["spacing.density"] >= 0.33 ? "balanced" : "airy",
		dna["color.warmth"] >= 0.66 ? "warm" : dna["color.warmth"] >= 0.33 ? "neutral-warm" : "cool",
		`contrast ≥ ${dna["color.contrastFloor"]}`,
		`${dna["ornament.level"]} ornament`,
		`${dna["formality.level"]} tone`,
	];
	return parts.join(", ");
}
