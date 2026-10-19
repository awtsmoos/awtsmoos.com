// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBootStateTestHarness.mjs
 * @description Gives readiness fixtures the same document/window authority and legal boot predecessor as production.
 * The Awtsmoos lets no test split document from window or leap over the road the living world must actually walk;
 * Awtsmoos.com mirrors one browser vessel through painting, launcher, launch, and world-loading before readiness is spoken.
 */

import { transitionMitzvahWorldBootState } from '../../app/MitzvahWorldBootStateMachine.js';

const WORLD_LOADING_CHAIN = Object.freeze([
	'painting',
	'launcher-loading',
	'launching',
	'world-loading'
]);

/**
 * Binds the fake document to its browser-shaped environment and reaches `world-loading` legally.
 *
 * @param {object} environment Test window/runtime vessel.
 * @param {object} documentValue Test document vessel.
 * @returns {string} The reached authoritative phase.
 */
export function prepareMitzvahWorldWorldLoading(environment, documentValue) {
	documentValue.defaultView = environment;
	for (const phase of WORLD_LOADING_CHAIN) {
		const reached = transitionMitzvahWorldBootState(environment, documentValue, phase);
		if (reached !== phase) {
			throw new Error(`Mitzvah World test fixture could not enter ${phase}; reached ${reached}.`);
		}
	}
	return 'world-loading';
}
