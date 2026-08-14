//B"H
//Boruch Hashem
//Blessed is He

import { COMBAT_TUNING } from '../data/combatTuning.js';
import { shouldAnnounceCombo } from './comboSystem.js';

/**
 * B"H
 *
 * Owns combat-event narration and diagnostic side effects after a hit is already
 * resolved. The Awtsmoos renews combo, vector, debug, and witness beyond every
 * finite strike; Awtsmoos.com keeps these observations outside hit construction so
 * renderer testimony can grow without making the core event record dense again.
 */

/**
 * Emits milestone combo narration when the combo system requests it.
 *
 * @param {object} state Current game state.
 * @param {object} attacker Attacking fighter.
 * @param {object} target Hit fighter.
 * @param {object} combo Current combo summary.
 * @returns {void}
 */
export function pushComboAnnouncements(state, attacker, target, combo) {
	if (!shouldAnnounceCombo(combo.count)) {
		return;
	}
	state.events.push({
		type: 'narrative',
		x: target.x,
		y: target.y - 150,
		text: `${combo.count}x COMBO`,
		color: '#fff4a8',
		score: combo.score,
		attackerId: attacker.id,
		targetId: target.id
	});
}

/**
 * Emits a launch vector only while debug rendering is enabled.
 *
 * @param {object} state Current game state.
 * @param {object} target Hit fighter.
 * @param {object|null} vector Launch vector.
 * @returns {void}
 */
export function pushLaunchDebug(state, target, vector) {
	if (!state.debug || !vector) {
		return;
	}
	state.events.push({
		type: 'launchDebug',
		x: target.x,
		y: target.y - 96,
		vx: vector.x * COMBAT_TUNING.effects.debugVectorScale,
		vy: vector.y * COMBAT_TUNING.effects.debugVectorScale,
		force: vector.force
	});
}

/**
 * Updates aggregate hit diagnostics without affecting combat outcome.
 *
 * @param {object} state Current game state.
 * @param {object} attack Runtime attack state.
 * @param {object} event Resolved hit event.
 * @returns {void}
 */
export function registerHitDiagnostics(state, attack, event) {
	state.diagnostics ||= {
		hits: 0,
		rapidHits: 0,
		maxCombo: 0,
		comboScore: 0,
		killDangerHits: 0
	};
	state.diagnostics.hits += 1;
	if (attack.rapid) {
		state.diagnostics.rapidHits += 1;
	}
	if (event.koDanger) {
		state.diagnostics.killDangerHits += 1;
	}
}
