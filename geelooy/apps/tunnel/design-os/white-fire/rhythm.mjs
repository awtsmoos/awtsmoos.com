//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file The pause: spacing as musical rests.
 * @description In Torah reading, the pause between words carries meaning — a
 * sof pasuk is not a silluk. Here, the space between blocks is a REST,
 * measured in multiples of the base rhythm unit:
 *
 *   eighth-rest   0.5× base   — between footnotes, tight kinship
 *   quarter-rest  1×   base   — between related paragraphs
 *   half-rest     2×   base   — between sections
 *   whole-rest    4×   base   — between title and body, major transitions
 *   breve-rest    8×   base   — between chapters, the great pause
 *
 * Rhythm is consistent when gaps share a pulse: low coefficient of variation,
 * or most gaps aligned to base-unit multiples.
 */

export const RESTS = Object.freeze({
	"eighth-rest": 0.5,
	"quarter-rest": 1,
	"half-rest": 2,
	"whole-rest": 4,
	"breve-rest": 8,
});

const REST_ORDER = ["eighth-rest", "quarter-rest", "half-rest", "whole-rest", "breve-rest"];

/** Rank of a rest name (0 = shortest). Throws on unknown names. */
export function restRank(name) {
	const i = REST_ORDER.indexOf(name);
	if (i < 0) throw new Error(`white-fire: unknown rest '${name}' (expected one of ${REST_ORDER.join(", ")})`);
	return i;
}

/** Pixel size of a rest at the given base unit. */
export function restSize(name, baseUnit) {
	if (!(name in RESTS)) throw new Error(`white-fire: unknown rest '${name}'`);
	return RESTS[name] * baseUnit;
}

/**
 * Classifies a gap into the nearest rest.
 * @returns {{rest, size, deviation}} deviation = |gap − restSize| / restSize.
 */
export function restFor(gapPx, baseUnit) {
	let best = REST_ORDER[0];
	let bestDev = Infinity;
	for (const name of REST_ORDER) {
		const s = restSize(name, baseUnit);
		const dev = Math.abs(gapPx - s) / s;
		if (dev < bestDev) {
			bestDev = dev;
			best = name;
		}
	}
	return { rest: best, size: restSize(best, baseUnit), deviation: bestDev };
}

/**
 * Scores vertical rhythm across gaps.
 * @param {Array} gaps Measured gaps (from measure()).
 * @param {number} baseUnit Rhythm base unit in px.
 * @returns {{cv, consistent, mean, alignedShare, note}}
 */
export function rhythmScore(gaps, baseUnit) {
	const sizes = gaps.map((g) => g.size).filter((s) => s > 0);
	if (sizes.length === 0) {
		return { cv: 0, consistent: true, mean: 0, alignedShare: 1, note: "no gaps to score" };
	}
	const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
	const variance = sizes.reduce((a, b) => a + (b - mean) ** 2, 0) / sizes.length;
	const cv = mean === 0 ? 0 : Math.sqrt(variance) / mean;
	const aligned = sizes.filter((s) => {
		const m = s / baseUnit;
		return Math.abs(m - Math.round(m)) <= 0.2;
	}).length;
	const alignedShare = aligned / sizes.length;
	const consistent = cv <= 0.35 || alignedShare >= 0.75;
	return {
		cv: round3(cv),
		consistent,
		mean: round3(mean),
		alignedShare: round3(alignedShare),
		note: consistent ? "gaps share a pulse" : "gaps wander — no shared pulse",
	};
}

/** Recommended rest for a transition between two element roles. */
export const ROLE_RESTS = Object.freeze({
	"title->body": "whole-rest",
	"title->section": "whole-rest",
	"hero->body": "whole-rest",
	"hero->section": "whole-rest",
	"section->section": "half-rest",
	"section->body": "half-rest",
	"body->body": "quarter-rest",
	"body->section": "half-rest",
	"body->footnote": "quarter-rest",
	"section->footnote": "quarter-rest",
	"footnote->footnote": "eighth-rest",
	"*->*": "half-rest",
});

/** Recommended rest name for a role transition. */
export function recommendedRest(fromRole, toRole) {
	return ROLE_RESTS[`${fromRole}->${toRole}`] || ROLE_RESTS["*->*"];
}

/**
 * Recommends rest corrections for each gap.
 * @param {Object} layout Normalized layout.
 * @param {Array} gaps Measured gaps.
 * @returns {[{between, currentRest, currentDeviation, recommendedRest, recommendedPx, matches}]}
 */
export function recommendRests(layout, gaps) {
	return gaps.map((g) => {
		const a = layout.elements.find((e) => e.id === g.between[0]);
		const b = layout.elements.find((e) => e.id === g.between[1]);
		const recommended = recommendedRest(a ? a.role : "block", b ? b.role : "block");
		const current = restFor(g.size, layout.baseUnit);
		return {
			between: g.between,
			currentRest: current.rest,
			currentDeviation: round3(current.deviation),
			recommendedRest: recommended,
			recommendedPx: restSize(recommended, layout.baseUnit),
			matches: current.rest === recommended && current.deviation <= 0.2,
		};
	});
}

function round3(n) {
	return Math.round(n * 1000) / 1000;
}
