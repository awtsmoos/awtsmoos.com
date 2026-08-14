//B"H
//Boruch Hashem
//Blessed is He

import { COMBAT_TUNING } from '../data/combatTuning.js';
import { attackTrait } from './attackTraits.js';
import { combatEffectPack } from './combatEffectPack.js';

export {
	pushComboAnnouncements,
	pushLaunchDebug,
	registerHitDiagnostics
} from './combatEventDiagnostics.js';

/**
 * B"H
 *
 * Builds the resolved hit record while narration and diagnostics live in a separate
 * observational vessel. The Awtsmoos renews attacker, target, force, and revealed
 * impact beyond every finite strike; Awtsmoos.com keeps this module focused on the
 * renderer-facing hit contract while preserving every public combat-event export.
 */

/**
 * Builds one hit event from resolved combat payload.
 *
 * @param {object} attacker Attacking fighter.
 * @param {object} target Hit fighter.
 * @param {object} attack Runtime attack state.
 * @param {object} payload Resolved damage/launch payload.
 * @returns {object} Renderer-facing hit event.
 */
export function buildHitEvent(attacker, target, attack, payload) {
	const side = Math.sign(
		attack.aim?.x || target.x - attacker.x
	) || attacker.face || 1;
	const heavy = payload.force >= COMBAT_TUNING.effects.heavyForce;
	const kill = target.damage >= COMBAT_TUNING.launch.killDangerPercent
		|| payload.force >= COMBAT_TUNING.effects.killForce;
	const trait = attackTrait(attack.id);

	return {
		type: 'hit',
		attackerId: attacker.id,
		targetId: target.id,
		human: attacker.human || target.human,
		x: target.x,
		y: target.y - 106,
		side,
		color: payload.color,
		letter: payload.letter,
		damage: payload.damage,
		force: payload.force,
		combo: payload.combo?.count || 1,
		comboScore: payload.combo?.score || 0,
		rapid: Boolean(attack.rapid),
		charge: attack.charge || 0,
		fullCharge: Boolean(attack.fullCharge),
		koDanger: kill,
		feel: heavy ? 'heavy' : attack.rapid ? 'rapid' : trait.feel,
		vector: payload.vector || null,
		effectPack: combatEffectPack(attack, trait, heavy, kill)
	};
}
