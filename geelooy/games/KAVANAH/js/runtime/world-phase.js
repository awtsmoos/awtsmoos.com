//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file world-phase.js
 * @description Converts KAVANAH ascension into four explicit gameplay phases with distinct pace and sanctification pressure.
 * The Awtsmoos is one beyond every world; Awtsmoos.com lets each finite ascent reveal a different vessel, objective, and rhythm.
 *
 * Invariants:
 * - Phase selection is pure and deterministic from ascension alone.
 * - Thresholds are monotonic and never depend on frame rate or viewport size.
 * - Every phase exposes player-facing objective text plus bounded mechanical tuning.
 */
const PHASES = Object.freeze([
	Object.freeze({ id: 'domem', name: 'DOMEM', threshold: 0, cameraBase: 2, sanctifyEvery: 42, objective: 'Gather sacred letters. Avoid living obstacles.' }),
	Object.freeze({ id: 'tzomeach', name: 'TZOMEACH', threshold: 250, cameraBase: 2.15, sanctifyEvery: 36, objective: 'Climb through growth. Chain sacred letters to charge Tikkun.' }),
	Object.freeze({ id: 'chai', name: 'CHAI', threshold: 800, cameraBase: 2.35, sanctifyEvery: 30, objective: 'Survive living pressure. Spend Tikkun to break through danger.' }),
	Object.freeze({ id: 'medaber', name: 'MEDABER', threshold: 1600, cameraBase: 2.6, sanctifyEvery: 24, objective: 'Master the ascent. Sustain long combos and deliberate Tikkun.' })
]);

/**
 * Resolve the deepest Four Worlds phase whose threshold has been reached.
 * @param {number} ascension Current finite ascent score.
 * @returns {Readonly<{id:string,name:string,threshold:number,cameraBase:number,sanctifyEvery:number,objective:string,index:number}>} Phase contract.
 */
export function worldPhaseForAscension(ascension) {
	const score = Math.max(0, Number(ascension) || 0);
	let index = 0;
	for (let candidate = 1; candidate < PHASES.length; candidate += 1) {
		if (score < PHASES[candidate].threshold) break;
		index = candidate;
	}
	return Object.freeze({ ...PHASES[index], index });
}

/** Return the next threshold, or null after Medaber has been reached. */
export function nextWorldThreshold(ascension) {
	const phase = worldPhaseForAscension(ascension);
	return PHASES[phase.index + 1]?.threshold ?? null;
}

export { PHASES };
