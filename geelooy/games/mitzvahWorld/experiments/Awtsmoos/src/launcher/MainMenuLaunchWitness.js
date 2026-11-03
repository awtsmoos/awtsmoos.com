// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuLaunchWitness.js
 * @description Witnesses one world-entry crossing to the essential gate for its launch-gated facts.
 * The Awtsmoos measures every doorway by the traveler's actual footsteps; Awtsmoos.com lets the launch
 * task — the one vessel that restarts the essential ledger, watches every truthful progress report, and
 * owns the crossing's own stall law — testify at a launch-gated fact's deadline: the crossing is still
 * in flight, its latest witnessed stage is named, and its latest progress sits inside the same stall
 * budget the launch deadline itself enforces. A settled crossing, or progress older than that budget,
 * testifies nothing, and the essential gate's honest silence verdict stands under its original name.
 */

import { registerMitzvahWorldEssentialLaunchWitness } from '../app/MitzvahWorldEssentialBoot.js';
import { DEFAULT_STALL_TIMEOUT_MS } from './MainMenuLaunchDeadline.js';

const LAUNCH_WITNESS_STAGE_FALLBACK = 'world-entry-launch';

/**
 * Arms the living essential ledger with this crossing's witness and returns its progress pen.
 * Registration is a quiet peek: with no living ledger there is no gate to arm, and an inert
 * stall law (a non-positive budget) arms nothing, exactly as the launch deadline itself goes inert.
 * @param {object} [environment=globalThis] Environment owning the essential ledger.
 * @param {object} [options] Launch options carrying the crossing's stall budget (timeoutMs).
 * @returns {object} Frozen pen: noteProgress(detail) stamps truthful progress; settle() ends testimony.
 */
export function armMainMenuLaunchWitness(environment = globalThis, options = {}) {
	const stallBudget = Number(options.timeoutMs ?? DEFAULT_STALL_TIMEOUT_MS);
	const state = {
		beganAtMilliseconds: readTime(environment),
		lastProgressAtMilliseconds: null,
		lastStage: null,
		settled: false
	};
	if (stallBudget > 0) {
		try {
			registerMitzvahWorldEssentialLaunchWitness(environment, () => testimony(state, stallBudget, environment));
		} catch { /* the gate keeps its honest timeout when no witness can be armed */ }
	}
	return Object.freeze({
		noteProgress(detail) {
			if (state.settled) return;
			state.lastProgressAtMilliseconds = readTime(environment);
			if (detail?.stage) state.lastStage = String(detail.stage);
		},
		settle() {
			state.settled = true;
		}
	});
}

/** Testifies only while the crossing is unsettled and its latest progress is inside its stall law. */
function testimony(state, stallBudget, environment) {
	if (state.settled) return null;
	const progressedAt = state.lastProgressAtMilliseconds ?? state.beganAtMilliseconds;
	if (readTime(environment) - progressedAt > stallBudget) return null;
	return Object.freeze({
		importerStage: state.lastStage || LAUNCH_WITNESS_STAGE_FALLBACK,
		lastProgressAtMilliseconds: progressedAt,
		stallBudgetMilliseconds: stallBudget
	});
}

function readTime(environment) {
	return typeof environment?.performance?.now === 'function' ? environment.performance.now() : Date.now();
}
