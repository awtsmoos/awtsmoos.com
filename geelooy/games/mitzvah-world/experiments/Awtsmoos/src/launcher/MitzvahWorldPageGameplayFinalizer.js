// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPageGameplayFinalizer.js
 * @description Gives one page boot exactly one physically certified playable-world owner.
 * The Awtsmoos lets a chooser promise many roads but crowns only the world whose real witnesses arrive;
 * Awtsmoos.com binds readiness once, so duplicate callbacks can echo truth without multiplying kings.
 */

import {
	isMitzvahWorldGameplayDiagnostics,
	publishMitzvahWorldPlayable
} from './MitzvahWorldPlayablePublisher.js';
import { publishMitzvahWorldPageBootReceipt } from './MitzvahWorldPageBootSupport.js';

/**
 * Creates the single finalization closure shared by direct and menu-selected gameplay.
 *
 * @param {object} options Page-owned readiness dependencies.
 * @returns {(diagnostics: object) => object} Exact-once playable publisher.
 */
export function createMitzvahWorldPageGameplayFinalizer(options) {
	let completedDiagnostics = null;
	let completedPlayable = null;
	return diagnostics => {
		if (!isMitzvahWorldGameplayDiagnostics(diagnostics)) {
			throw new Error('Mitzvah World gameplay diagnostics missing; readiness refused.');
		}
		if (completedDiagnostics) {
			if (completedDiagnostics !== diagnostics) {
				throw new Error('Mitzvah World page already belongs to a different playable world.');
			}
			return completedPlayable;
		}
		const playable = publishMitzvahWorldPlayable(diagnostics, {
			documentValue: options.documentValue,
			environment: options.environment,
			loading: options.loading
		});
		if (playable?.ready !== true) {
			throw new Error('Mitzvah World playable publication did not certify readiness.');
		}
		options.environment.AwtsmoosMitzvahWorld = diagnostics;
		options.rootState.setBootStage('ready');
		publishMitzvahWorldPageBootReceipt(
			options.environment,
			'ready',
			options.route,
			'Playable world certified.'
		);
		completedDiagnostics = diagnostics;
		completedPlayable = playable;
		return playable;
	};
}
