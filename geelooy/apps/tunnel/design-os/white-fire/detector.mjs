//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Intentional vs accidental whitespace detector.
 * @description Not all emptiness is white fire. Some whitespace is DESIGNED —
 * breathing room the layout asked for. Some is ACCIDENTAL — gaps nobody
 * declared, spacing that doesn't match its declaration, dead space at the
 * page end. This module tells them apart.
 *
 * Accidental rules:
 *  1. Mystery gap — space >= baseUnit that no margin/padding/gap declares.
 *  2. Declaration mismatch — declared spacing differs from the rendered gap.
 *  3. Orphan gap — a chasm (>= 3× base) after a tiny element (< 2× base tall).
 *  4. Dead space — trailing void >= 4× base with no declared bottom spacing.
 *
 * Every gap also gets an offRhythm flag when it isn't near a multiple of the
 * base unit (rhythm.mjs scores the overall rhythm separately).
 */

import { elementById } from "./layout.mjs";

function fmt(n) {
	return `${Math.round(n * 10) / 10}`;
}

/** True when size is within tol of an integer multiple of unit (hairlines exempt). */
function isNearMultiple(size, unit, tol) {
	if (size < unit * 0.4) return true;
	const m = size / unit;
	return Math.abs(m - Math.round(m)) <= tol;
}

/**
 * Classifies every measured gap and the trailing space.
 * @param {Object} layout Normalized layout.
 * @param {Object} measurements From measure().
 * @returns {{
 *   gaps: [{...gap, verdict:'intentional'|'accidental', reasons:[], offRhythm}],
 *   trailing: {...trailing, verdict, reasons},
 *   intentionalPx, accidentalPx, intentionalShare,
 *   findings: [string]
 * }}
 */
export function classify(layout, measurements) {
	const { baseUnit } = layout;

	const gaps = measurements.gaps.map((g) => {
		const reasons = [];
		let verdict = "intentional";
		const a = elementById(layout, g.between[0]);

		if (g.size >= baseUnit && g.declared < 1) {
			verdict = "accidental";
			reasons.push(
				`mystery gap of ${fmt(g.size)}px between '${g.between[0]}' and '${g.between[1]}': ` +
				`no margin, padding, or gap declares this space`
			);
		} else if (!g.accounted && g.size > 0) {
			verdict = "accidental";
			reasons.push(
				`declared spacing (${fmt(g.declared)}px) does not match the rendered gap ` +
				`(${fmt(g.size)}px) between '${g.between[0]}' and '${g.between[1]}'`
			);
		}

		if (verdict === "intentional" && g.size >= 3 * baseUnit && a.box.h < 2 * baseUnit) {
			verdict = "accidental";
			reasons.push(
				`orphan gap: ${fmt(g.size)}px of space after tiny element '${a.id}' ` +
				`(${fmt(a.box.h)}px tall) — likely a layout accident, not a pause`
			);
		}

		const offRhythm = !isNearMultiple(g.size, baseUnit, 0.2) && g.size > 0;
		if (offRhythm) {
			reasons.push(
				`off-rhythm: ${fmt(g.size)}px between '${g.between[0]}' and '${g.between[1]}' ` +
				`is not near a multiple of the ${baseUnit}px base unit`
			);
		}

		return { ...g, verdict, reasons, offRhythm };
	});

	const t = measurements.trailing;
	let trailingVerdict = "intentional";
	const trailingReasons = [];
	if (t.size >= 4 * baseUnit && t.declared < 1) {
		trailingVerdict = "accidental";
		trailingReasons.push(
			`dead space: ${fmt(t.size)}px of empty viewport below the last element ` +
			`with no declared bottom spacing`
		);
	}

	const px = (v) => gaps.filter((g) => g.verdict === v).reduce((s, g) => s + g.size, 0);
	const intentionalPx = px("intentional") + (trailingVerdict === "intentional" ? t.size : 0);
	const accidentalPx = px("accidental") + (trailingVerdict === "accidental" ? t.size : 0);
	const totalGapPx = intentionalPx + accidentalPx;
	const intentionalShare = totalGapPx === 0 ? 1 : intentionalPx / totalGapPx;

	const findings = [];
	for (const g of gaps) {
		if (g.verdict === "accidental") findings.push(...g.reasons);
	}
	findings.push(...trailingReasons);

	return {
		gaps,
		trailing: { ...t, verdict: trailingVerdict, reasons: trailingReasons },
		intentionalPx,
		accidentalPx,
		intentionalShare,
		findings,
	};
}
