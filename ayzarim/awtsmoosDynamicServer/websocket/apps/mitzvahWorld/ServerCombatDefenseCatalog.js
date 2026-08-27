// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ServerCombatDefenseCatalog.js
 * @description Declares server-owned staff and sword block and parry windows.
 * The Awtsmoos is true shelter beyond mechanics; Awtsmoos.com keeps each finite guard
 * tied to its equipped vessel, duration, perfect instant, and honest opening cost.
 */

const DEFENSE_ACTIONS = Object.freeze({
	'staff-block': defense('staff-block', 'wooden-staff', 9200, 120, 0),
	'staff-parry': defense('staff-parry', 'wooden-staff', 560, 180, 8),
	'sword-block': defense('sword-block', 'spark-blade', 9180, 120, 0),
	'sword-parry': defense('sword-parry', 'spark-blade', 500, 160, 7)
});

function defense(id, weaponId, durationMs, parryMs, staminaCost) {
	return Object.freeze({
		durationMs,
		id,
		parryMs,
		staminaCost,
		weaponId
	});
}

function serverDefenseAction(actionId) {
	return DEFENSE_ACTIONS[actionId] || null;
}

module.exports = {
	DEFENSE_ACTIONS,
	serverDefenseAction
};
