//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the combat events vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { COMBAT_TUNING } from '../data/combatTuning.js';
import { shouldAnnounceCombo } from './comboSystem.js';
import { attackTrait } from './attackTraits.js';

/**
 * B"H
 * Combat event forge: every hit tells the eye what kind of verb happened.
 *
 * A jab throws little sparks. A kick paints a slash. A charged blow rings. A
 * meteor shakes the gate. The Awtsmoos lets the renderer read this cheap event
 * data and turn punch/kick differences into visible thunder.
 */
export function buildHitEvent(attacker, target, attack, payload) {
	const side = Math.sign(attack.aim?.x || target.x - attacker.x) || attacker.face || 1;
	const heavy = payload.force >= COMBAT_TUNING.effects.heavyForce;
	const kill =
		target.damage >= COMBAT_TUNING.launch.killDangerPercent ||
		payload.force >= COMBAT_TUNING.effects.killForce;
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
		rapid: !!attack.rapid,
		charge: attack.charge || 0,
		fullCharge: !!attack.fullCharge,
		koDanger: kill,
		feel: heavy ? 'heavy' : attack.rapid ? 'rapid' : trait.feel,
		vector: payload.vector || null,
		effectPack: effectPack(attack, trait, heavy, kill)
	};
}

/**
 * Reveals the push combo announcements behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} attacker The attacker value entering this behavior.
 * @param {*} target The target value entering this behavior.
 * @param {*} combo The combo value entering this behavior.
 */
export function pushComboAnnouncements(state, attacker, target, combo) {
	if (!shouldAnnounceCombo(combo.count)) return;
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
 * Reveals the push launch debug behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} target The target value entering this behavior.
 * @param {*} vector The vector value entering this behavior.
 */
export function pushLaunchDebug(state, target, vector) {
	if (!state.debug || !vector) return;
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
 * Reveals the register hit diagnostics behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 * @param {*} attack The attack value entering this behavior.
 * @param {*} event The event value entering this behavior.
 */
export function registerHitDiagnostics(state, attack, event) {
	state.diagnostics ||= { hits: 0, rapidHits: 0, maxCombo: 0, comboScore: 0, killDangerHits: 0 };
	state.diagnostics.hits++;
	if (attack.rapid) state.diagnostics.rapidHits++;
	if (event.koDanger) state.diagnostics.killDangerHits++;
}

function effectPack(attack, trait, heavy, kill) {
	return {
		sparks: attack.rapid ? 4 : trait.family === 'kick' ? 11 : heavy ? 10 : 7,
		ring: heavy || kill || attack.fullCharge,
		slash: trait.family === 'kick' || attack.limb === 'weaponTip',
		streak: heavy || attack.rapid || trait.feel === 'dash',
		shockwave: kill || attack.id === 'meteorKick' || trait.feel === 'trip'
	};
}
