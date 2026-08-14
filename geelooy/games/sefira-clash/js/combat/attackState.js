//B"H
//Boruch Hashem
//Blessed is He

import { attackTrait } from './attackTraits.js';
import {
	attackScales,
	tickChargeButton
} from './attackStateHelpers.js';

/**
 * B"H
 *
 * Owns the public attack-state vessel while arithmetic and held-button bookkeeping
 * live in a focused helper. The Awtsmoos renews fist, kick, charge, and recovery
 * beyond every finite frame; Awtsmoos.com keeps the state contract readable so
 * combat callers receive exactly the same fields without carrying helper detail.
 */

/**
 * Creates one attack state from authored move data plus runtime charge options.
 *
 * @param {object} base Base attack definition.
 * @param {object} options Runtime attack options.
 * @returns {object} Mutable attack state consumed by combat simulation.
 */
export function createAttackState(base, options = {}) {
	const charge = Math.max(0, Math.min(1, options.charge || 0));
	const rapid = Boolean(options.rapid);
	const full = !rapid && charge > 0.92;
	const trait = attackTrait(base.id);
	const scale = attackScales(trait, charge, rapid, full);

	return {
		...base,
		trait: trait.feel,
		family: trait.family,
		charge: rapid ? 0 : charge,
		rapid,
		fullCharge: full,
		grabKind: options.grabKind || '',
		throwKind: options.throwKind || '',
		aim: options.aim || { x: 1, y: 0 },
		damage: Math.max(1, Math.round(base.damage * scale.damage)),
		knock: Math.max(1, base.knock * scale.knock),
		radius: attackRadius(base, trait, charge, rapid, full),
		active: base.active + trait.active + (rapid ? 4 : full ? 2 : 0),
		startup: Math.max(
			1,
			rapid ? 1 : base.startup - (trait.family === 'punch' ? 1 : 0)
		),
		recovery: Math.max(
			4,
			rapid
				? 6
				: base.recovery + trait.recovery - (trait.family === 'punch' ? 1 : 0)
		),
		angle: options.angle ?? base.angle,
		hasHit: new Set()
	};
}

/**
 * Advances held punch/kick/special charge state for one fighter.
 *
 * @param {object} fighter Fighter being updated.
 * @param {object} input Current input snapshot.
 * @param {object|null} intent Optional tactical intent.
 * @returns {void}
 */
export function tickChargeState(fighter, input, intent = null) {
	fighter.charge ||= { prev: {} };
	tickChargeButton(fighter, input, intent, 'punch', 'armedPunch');
	tickChargeButton(fighter, input, intent, 'kick', 'armedKick');
	fighter.charge.special = input.special
		? Math.min(90, (fighter.charge.special || 0) + 1)
		: 0;
	fighter.chargeGlow = Math.max(
		fighter.charge.punch || 0,
		fighter.charge.kick || 0
	) / 90;
}

/**
 * Consumes one stored punch or kick charge and clears its armed state.
 *
 * @param {object} fighter Fighter whose charge is consumed.
 * @param {string} kind Punch or kick.
 * @returns {number} Held frames accumulated before consumption.
 */
export function consumeCharge(fighter, kind) {
	const key = kind === 'kick' ? 'kick' : 'punch';
	const frames = fighter.charge?.[key] || 0;
	fighter.charge[key] = 0;
	fighter.charge[`armed${key[0].toUpperCase()}${key.slice(1)}`] = false;
	fighter.chargeGlow = 0;
	return frames;
}

function attackRadius(base, trait, charge, rapid, full) {
	return base.radius
		+ trait.reach
		+ (rapid ? 2 : charge * (trait.family === 'kick' ? 32 : 24))
		+ (full ? 18 : 0);
}
