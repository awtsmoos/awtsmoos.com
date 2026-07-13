//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack state vessel in this instant, revealing
 * its focused js combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { attackTrait } from './attackTraits.js';

/**
 * B"H
 * Attack-state creator and honest charge meter.
 *
 * Tap is a spark, rapid is rain, charge is thunder. Now the thunder is shaped by
 * the limb: fists bloom into clean launchers, boots become wider heavier arcs,
 * and Adventure enemies can be read by the body language of the strike.
 */
const HOLD_ARM_FRAMES = 10;

/**
 * Reveals the create attack state behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} base The base value entering this behavior.
 * @param {*} options The options value entering this behavior.
 */
export function createAttackState(base, options = {}) {
	const charge = Math.max(0, Math.min(1, options.charge || 0));
	const rapid = !!options.rapid;
	const full = !rapid && charge > 0.92;
	const trait = attackTrait(base.id);
	const scale = scales(trait, charge, rapid, full);
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
		radius:
			base.radius +
			trait.reach +
			(rapid ? 2 : charge * (trait.family === 'kick' ? 32 : 24)) +
			(full ? 18 : 0),
		active: base.active + trait.active + (rapid ? 4 : full ? 2 : 0),
		startup: Math.max(1, rapid ? 1 : base.startup - (trait.family === 'punch' ? 1 : 0)),
		recovery: Math.max(
			4,
			rapid ? 6 : base.recovery + trait.recovery - (trait.family === 'punch' ? 1 : 0)
		),
		angle: options.angle ?? base.angle,
		hasHit: new Set()
	};
}

/**
 * Reveals the tick charge state behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} input The input value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function tickChargeState(f, input, intent = null) {
	f.charge ||= { prev: {} };
	tickButton(f, input, intent, 'punch', 'armedPunch');
	tickButton(f, input, intent, 'kick', 'armedKick');
	f.charge.special = input.special ? Math.min(90, (f.charge.special || 0) + 1) : 0;
	f.chargeGlow = Math.max(f.charge.punch || 0, f.charge.kick || 0) / 90;
}

/**
 * Reveals the consume charge behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} kind The kind value entering this behavior.
 */
export function consumeCharge(f, kind) {
	const key = kind === 'kick' ? 'kick' : 'punch';
	const frames = f.charge?.[key] || 0;
	f.charge[key] = 0;
	f.charge[`armed${key[0].toUpperCase()}${key.slice(1)}`] = false;
	f.chargeGlow = 0;
	return frames;
}

function scales(trait, charge, rapid, full) {
	if (rapid) return { damage: 0.34 * trait.damage, knock: 0.35 * trait.knock };
	const limbBonus = trait.family === 'kick' ? 0.16 : 0.04;
	return {
		damage: trait.damage * (full ? 3.45 + limbBonus : 1 + charge * (1.12 + limbBonus)),
		knock: trait.knock * (full ? 4.05 + limbBonus : 1 + charge * (1.0 + limbBonus))
	};
}

function tickButton(f, input, intent, key, armedKey) {
	const held = !!input[key];
	const rapid =
		key === 'punch'
			? intent?.rapidPunch || input.rapidPunch
			: intent?.rapidKick || input.rapidKick;
	if (!held || rapid) {
		f.charge[key] = 0;
		f.charge[armedKey] = false;
		return;
	}
	f.charge[key] = Math.min(95, (f.charge[key] || 0) + 1);
	f.charge[armedKey] = f.charge[key] >= HOLD_ARM_FRAMES;
}
