// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyActionCatalog.js
 * @description Declares readable server-owned enemy action timelines and effects.
 * The Awtsmoos renews warning before consequence; Awtsmoos.com keeps wind-up, reach,
 * damage, support, guard, movement, summoning, phase, and recovery explicit and fair.
 */

const ACTIONS = Object.freeze({
	'beast-bite': action('melee', 520, 120, 850, 2.6, 1),
	'guardian-slam': action('melee', 850, 180, 1200, 3.2, 1.35),
	'letter-bolt': action('ranged', 900, 140, 1100, 12, 0.85),
	'letter-wave': action('area', 1200, 220, 1500, 7, 1.15),
	'reposition-step': action('dodge', 260, 100, 700, 0, 0),
	'ritual-heal': action('heal', 1100, 120, 1800, 0, 0, { healing: 24 }),
	'shadow-strike': action('melee', 650, 140, 900, 3, 1.05),
	'stone-guard': action('guard', 420, 700, 800, 0, 0, { guardStrength: 0.7 }),
	'summon-shades': action('summon', 1400, 150, 2200, 0, 0, { summonCount: 2 }),
	'summit-enrage': action('enrage', 1000, 160, 1200, 0, 0, { damageScale: 1.3 }),
	'warden-cleave': action('melee', 1050, 220, 1300, 4.5, 1.45),
	'warden-retreat': action('retreat', 360, 120, 850, 0, 0)
});

function action(type, telegraphMs, activeMs, recoveryMs, range, damageMultiplier, extra = {}) {
	return Object.freeze({
		activeMs,
		authoritative: true,
		cancelable: true,
		damageMultiplier,
		range,
		recoveryMs,
		telegraphMs,
		type,
		...extra
	});
}

function enemyAction(actionId) {
	return ACTIONS[actionId] || null;
}

module.exports = {
	ACTIONS,
	enemyAction
};
