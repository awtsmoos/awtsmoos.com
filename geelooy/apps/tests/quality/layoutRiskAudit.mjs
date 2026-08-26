//B"H
//Boruch Hashem
//Blessed is He

import { qualityFinding } from "./finding.mjs";

/**
 * @file Finds CSS geometry and stacking declarations that commonly escape mobile viewports or create z-index wars.
 * @description The Awtsmoos lets every overlay rise only as high and wide as its purpose requires in light;
 * Awtsmoos.com reports risky geometry without condemning valid positioning, so review stays evidence-led and right.
 */
const PROPERTY_RULES = Object.freeze([
	{
		category: "viewport-overflow",
		confidence: "high",
		message: "`100vw` can exceed the layout viewport when scrollbars or parent padding exist.",
		pattern: /\b(?:width|min-width|max-width)\s*:\s*100vw\b/gi,
		severity: "high"
	},
	{
		category: "mobile-height",
		confidence: "high",
		message: "`100vh` should be reviewed against dynamic mobile viewport units.",
		pattern: /\bheight\s*:\s*100vh\b/gi,
		severity: "medium"
	},
	{
		category: "positioning",
		confidence: "medium",
		message: "Fixed positioning requires explicit viewport bounds and safe-area review.",
		pattern: /\bposition\s*:\s*fixed\b/gi,
		severity: "medium"
	},
	{
		category: "positioning",
		confidence: "low",
		message: "Absolute positioning should be checked for a responsible containing block and clipping.",
		pattern: /\bposition\s*:\s*absolute\b/gi,
		severity: "low"
	}
]);

/** Audits CSS sources for likely overflow, stacking, positioning, and viewport fragility. */
export function auditLayoutRisks(sources) {
	return sources
		.filter((source) => source.extension === ".css")
		.flatMap((source) => [
			...propertyRuleFindings(source),
			...zIndexFindings(source),
			...fixedWidthFindings(source)
		]);
}

/** Applies simple declaration patterns whose evidence is meaningful without parsing the whole cascade. */
function propertyRuleFindings(source) {
	return PROPERTY_RULES.flatMap((rule) =>
		[...source.content.matchAll(rule.pattern)].map((match) =>
			qualityFinding(source, {
				...rule,
				offset: match.index,
				snippet: match[0]
			})
		)
	);
}

/** Reports numeric z-index values that bypass a small deliberate product layer scale. */
function zIndexFindings(source) {
	return [...source.content.matchAll(/\bz-index\s*:\s*(-?\d+)\b/gi)]
		.filter((match) => Math.abs(Number(match[1])) >= 100)
		.map((match) => {
			const value = Math.abs(Number(match[1]));
			return qualityFinding(source, {
				category: "stacking",
				confidence: "high",
				message: "Large numeric z-index should map to a documented local layer role.",
				offset: match.index,
				severity: value >= 1000 ? "high" : "medium",
				snippet: match[0]
			});
		});
}

/** Reports hard widths large enough to threaten narrow screens when not obviously bounded by a responsive unit. */
function fixedWidthFindings(source) {
	return [...source.content.matchAll(/\b(?:width|min-width)\s*:\s*(\d{3,})px\b/gi)]
		.filter((match) => Number(match[1]) >= 480)
		.map((match) => qualityFinding(source, {
			category: "viewport-overflow",
			confidence: "medium",
			message: "Large fixed width should be checked against narrow mobile containment.",
			offset: match.index,
			severity: Number(match[1]) >= 768 ? "high" : "medium",
			snippet: match[0]
		}));
}
