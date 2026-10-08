//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file White Fire — design the emptiness.
 * @description Main entry. In Torah, the white fire around the letters is as
 * holy as the black fire of the letters themselves. This module measures,
 * classifies, and constrains whitespace: the void must be designed, not
 * accidental; the pauses must have rhythm, like the pauses in Torah reading.
 *
 * Pipeline: normalize → measure → classify → rhythm → rests → constraints → score → report.
 *
 *   import { analyze, analyzeSefer } from "./index.mjs";
 *   const a = analyzeSefer({
 *     viewport: { width: 1000, height: 800 },
 *     elements: [
 *       { id: "title", role: "title",
 *         box: { x: 100, y: 40, w: 800, h: 80 },
 *         margin: { bottom: 40 } },
 *       { id: "body", role: "body",
 *         box: { x: 100, y: 160, w: 800, h: 400 } },
 *     ],
 *   });
 *   console.log(a.score.total, a.report);
 */

export { normalizeLayout, boxArea, unionArea, sortedByY, elementById } from "./layout.mjs";
export { measure } from "./measure.mjs";
export { classify } from "./detector.mjs";
export {
	restFor, restSize, restRank, rhythmScore, recommendRests, recommendedRest,
	RESTS, ROLE_RESTS,
} from "./rhythm.mjs";
export { checkConstraints, WHITEFIRE_PRESETS } from "./constraints.mjs";
export { score, report } from "./report.mjs";

import { normalizeLayout } from "./layout.mjs";
import { measure } from "./measure.mjs";
import { classify } from "./detector.mjs";
import { rhythmScore, recommendRests } from "./rhythm.mjs";
import { checkConstraints, WHITEFIRE_PRESETS } from "./constraints.mjs";
import { score as scoreFn, report as reportFn } from "./report.mjs";

/**
 * Full white-fire pipeline.
 * @param {Object} layoutInput Raw layout JSON (see layout.mjs).
 * @param {string} constraintsSrc White-fire constraint DSL (may be empty).
 * @returns {{layout, measurements, classification, rhythm, rests, score, constraints, report}}
 */
export function analyze(layoutInput, constraintsSrc = "") {
	const layout = normalizeLayout(layoutInput);
	const measurements = measure(layout);
	const classification = classify(layout, measurements);
	const rhythm = rhythmScore(measurements.gaps, layout.baseUnit);
	const rests = recommendRests(layout, measurements.gaps);
	const analysis = { layout, measurements, classification, rhythm, rests };
	analysis.score = scoreFn(analysis);
	analysis.constraints = constraintsSrc.trim()
		? checkConstraints(layout, analysis, constraintsSrc)
		: { ok: true, results: [] };
	analysis.report = reportFn(analysis);
	return analysis;
}

/** Yaakov's sefer defaults: the white-fire preset for warm-paper seforim. */
export function analyzeSefer(layoutInput) {
	return analyze(layoutInput, WHITEFIRE_PRESETS.sefer);
}

/**
 * Demo: a small sefer page with one designed pause and two accidents.
 * @returns {Object} Full analysis.
 */
export function demo() {
	return analyzeSefer({
		viewport: { width: 1000, height: 800 },
		baseUnit: 10,
		elements: [
			{
				id: "title", role: "title",
				box: { x: 100, y: 40, w: 800, h: 80 },
				margin: { bottom: 40 }, // whole-rest: designed pause
			},
			{
				id: "body", role: "body",
				box: { x: 100, y: 160, w: 800, h: 400 },
				// no declared spacing below → mystery gap (accidental)
			},
			{
				id: "footnote", role: "footnote",
				box: { x: 100, y: 600, w: 800, h: 60 },
			},
		],
	});
}
