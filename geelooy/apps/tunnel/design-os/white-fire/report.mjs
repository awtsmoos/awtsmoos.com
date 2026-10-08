//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file White-fire scoring and audit report.
 * @description A 0–100 score for the emptiness of a layout, plus a readable
 * audit: what the void looks like, which gaps are accidental, where the
 * rhythm breaks, and which pauses to fix.
 *
 * Score breakdown (100 total):
 *   whitespace ratio   30 — ideal 0.40–0.60, falloff to 0 at 0.15 / 0.85
 *   intentionality     30 — intentionalShare 1.0 → 30, 0.5 → 0
 *   rhythm             25 — consistent → 25, else scaled by (1 − cv)
 *   rests              15 — share of gaps already at their recommended rest
 */

/** Linear falloff: 1 inside [lo,hi], 0 outside [hardLo,hardHi]. */
function band(x, lo, hi, hardLo, hardHi) {
	if (x >= lo && x <= hi) return 1;
	if (x < hardLo || x > hardHi) return 0;
	if (x < lo) return (x - hardLo) / (lo - hardLo);
	return (hardHi - x) / (hardHi - hi);
}

function clamp01(x) {
	return Math.max(0, Math.min(1, x));
}

function pct(x) {
	return `${Math.round(x * 100)}%`;
}

/**
 * Scores an analysis.
 * @param {Object} analysis {measurements, classification, rhythm, rests}.
 * @returns {{total:number, breakdown:{whitespaceRatio,intentionality,rhythm,rests}, grade}}
 */
export function score(analysis) {
	const m = analysis.measurements;
	const c = analysis.classification;
	const r = analysis.rhythm;

	const ratioPts = band(m.ratio, 0.4, 0.6, 0.15, 0.85) * 30;
	const intentPts = clamp01((c.intentionalShare - 0.5) / 0.5) * 30;
	const rhythmPts = r.consistent ? 25 : clamp01(1 - r.cv) * 25;
	const recs = analysis.rests || [];
	const restPts = recs.length === 0 ? 15 : (recs.filter((x) => x.matches).length / recs.length) * 15;

	const total = Math.round(ratioPts + intentPts + rhythmPts + restPts);
	const breakdown = {
		whitespaceRatio: Math.round(ratioPts),
		intentionality: Math.round(intentPts),
		rhythm: Math.round(rhythmPts),
		rests: Math.round(restPts),
	};
	const grade = total >= 90 ? "radiant" : total >= 75 ? "breathing" : total >= 55 ? "crowded" : "suffocated";
	return { total, breakdown, grade };
}

/**
 * Renders a markdown audit report for an analysis.
 * @param {Object} analysis Full analysis (with score attached or not).
 * @returns {string} Markdown report.
 */
export function report(analysis) {
	const s = analysis.score || score(analysis);
	const m = analysis.measurements;
	const c = analysis.classification;
	const lines = [];

	lines.push(`# White Fire Audit — score ${s.total}/100 (${s.grade})`);
	lines.push("");
	lines.push(`> "The white fire is as holy as the black fire." This audit measures the void.`);
	lines.push("");
	lines.push(`## The void`);
	lines.push(`- Whitespace ratio: **${pct(m.ratio)}** (${fmt(m.whitespaceArea)}px² of ${fmt(m.viewportArea)}px²)`);
	lines.push(`- Intentional space: **${pct(c.intentionalShare)}** (${fmt(c.intentionalPx)}px designed, ${fmt(c.accidentalPx)}px accidental)`);
	lines.push(`- Rhythm: ${analysis.rhythm.consistent ? "**consistent**" : "**broken**"} (cv ${analysis.rhythm.cv}, ${pct(analysis.rhythm.alignedShare)} on-beat)`);
	lines.push(`- Horizontal balance: ${m.horizontal.balanced ? "balanced" : `off by ${fmt(Math.abs(m.horizontal.avgLeft - m.horizontal.avgRight))}px`}`);
	lines.push("");
	lines.push(`## Score breakdown`);
	lines.push(`- Whitespace ratio: ${s.breakdown.whitespaceRatio}/30`);
	lines.push(`- Intentionality: ${s.breakdown.intentionality}/30`);
	lines.push(`- Rhythm: ${s.breakdown.rhythm}/25`);
	lines.push(`- Rests: ${s.breakdown.rests}/15`);
	lines.push("");

	if (c.findings.length > 0) {
		lines.push(`## Accidental gaps (${c.findings.length})`);
		for (const f of c.findings) lines.push(`- ${f}`);
		lines.push("");
	} else {
		lines.push(`## Accidental gaps`);
		lines.push(`- None. Every emptiness is designed.`);
		lines.push("");
	}

	const recs = (analysis.rests || []).filter((r) => !r.matches);
	if (recs.length > 0) {
		lines.push(`## Pauses to fix (${recs.length})`);
		for (const r of recs) {
			lines.push(
				`- '${r.between[0]}' → '${r.between[1]}': currently ${r.currentRest} ` +
				`(off by ${pct(r.currentDeviation)}), should be **${r.recommendedRest}** (${r.recommendedPx}px)`
			);
		}
		lines.push("");
	}

	const cr = analysis.constraints;
	if (cr && cr.results && cr.results.length > 0) {
		const failed = cr.results.filter((r) => !r.ok);
		lines.push(`## Constraints (${cr.results.length - failed.length}/${cr.results.length} satisfied)`);
		for (const r of cr.results) {
			lines.push(`- ${r.ok ? "✓" : "✗"} \`${r.source}\` — ${r.message}`);
		}
		lines.push("");
	}

	return lines.join("\n");
}

function fmt(n) {
	return `${Math.round(n * 10) / 10}`;
}
