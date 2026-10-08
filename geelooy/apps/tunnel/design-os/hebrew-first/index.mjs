//B"H
/**
 * @file Hebrew-First Design System — main entry.
 * @description Pipeline: analyze Hebrew text -> select constraint bundles ->
 * solve with the Design OS constraint language -> generate Hebrew-first CSS.
 *
 *   import { hebrewFirst } from "./index.mjs";
 *   const r = hebrewFirst(genesis1_1);
 *   // r.ok, r.analysis, r.values, r.css
 */

export {
	HEBREW_LETTER_RE,
	SOFIT_LETTERS,
	SOFIT_RE,
	NIKKUD_PATTERN,
	TAAMIM_PATTERN,
	GERESH,
	GERSHAYIM,
	MAQAF,
	SOF_PASUQ,
	PASEQ,
	LATIN_RE,
	DIGIT_RE,
	HEBREW_SERIF_STACK,
	HEBREW_SANS_STACK,
	LATIN_SERIF_STACK,
	LINE_HEIGHT_POLICY,
	NIKKUD_MIN_FONT_PX,
	countMatches,
	stripTags,
	endsWithSofit,
} from "./typography.mjs";

export { analyzeHebrew, needsTaamimTier } from "./analyzer.mjs";

export {
	DEFAULT_DIRECTION,
	LATIN_MODE_SELECTORS,
	LATIN_RUN_SELECTOR,
	logicalInline,
	physicalSide,
	DIRECTION_CONTRACT,
} from "./rtl.mjs";

export {
	HF_BUNDLES,
	HF_DEFAULT_SET,
	HF_TAAMIM_SET,
	getHebrewBundle,
	listHebrewBundles,
	HF_BUNDLE_COUNT,
} from "./constraints.mjs";

export { structuralCSS, generateHebrewCSS } from "./css.mjs";

import { analyzeHebrew } from "./analyzer.mjs";
import { getHebrewBundle } from "./constraints.mjs";
import { design } from "../constraints/index.mjs";
import { generateHebrewCSS } from "./css.mjs";

/** Default base font size (px) seeded into every Hebrew-first program. */
export const HF_BASE_FONT_PX = 16;

/**
 * Full Hebrew-first pipeline for a piece of Hebrew text.
 * @param {string} text Hebrew text (Torah verse, commentary, etc.).
 * @param {object} [options]
 *   - {Array<string>} bundles: override bundle selection (default: from analysis).
 *   - {number} baseFontPx: base font size (default 16).
 *   - {string} extra: additional constraint DSL source (may be empty).
 * @returns {{ok, analysis, bundles, values, css, warnings, errors}}
 */
export function hebrewFirst(text, options = {}) {
	const analysis = analyzeHebrew(text);
	const bundles = options.bundles || analysis.recommendedBundles;
	const baseFontPx = options.baseFontPx || HF_BASE_FONT_PX;

	const bundleSources = bundles.map(getHebrewBundle);
	// Hebrew-first default: Hebrew IS the body text. Seed hebrew.fontSize from
	// body.fontSize unless a bundle (e.g. hf-sefer-rtl) defines it explicitly —
	// the relative line-height guards need a concrete font size to check against.
	const definesHebrewFontSize = bundleSources.some((s) =>
		/(^|\n)\s*hebrew\.fontSize\s*==?/.test(s)
	);
	const parts = [`body.fontSize = ${baseFontPx}px`];
	if (!definesHebrewFontSize) parts.push("hebrew.fontSize = body.fontSize");
	parts.push(...bundleSources);
	if (options.extra && options.extra.trim()) parts.push(options.extra.trim());
	const src = parts.join("\n");

	const result = design(src);
	if (!result.ok) {
		return {
			ok: false,
			analysis,
			bundles,
			values: {},
			css: "",
			warnings: [],
			errors: result.errors,
		};
	}

	const { css, warnings } = generateHebrewCSS(result.values);
	return {
		ok: true,
		analysis,
		bundles,
		values: result.values,
		css,
		warnings,
		errors: [],
	};
}

/**
 * Quick demo on the analysis tier only (no solving): which bundles would be
 * selected for this text and why.
 */
export function planFor(text) {
	const analysis = analyzeHebrew(text);
	return {
		bundles: analysis.recommendedBundles,
		lineHeight: analysis.recommendedLineHeight,
		notes: analysis.notes,
	};
}
