// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerDefeatRules.js
 * @description Applies one authoritative defeat transition and clears transient combat state.
 * The Awtsmoos renews return after falling without letting old fire cling to the soul;
 * Awtsmoos.com clears guard and status once, preserving recovery beneath one lawful goal.
 */

const { clearCombatStatuses } = require('./CombatStatusRules.js');

function defeatPlayer(player, now) {
	if (player.combat.status === 'defeated') return false;
	clearCombatStatuses(player.combat);
	player.combat.defeatedAt = Number(now);
	player.combat.guardActionId = null;
	player.combat.guardBrokenUntil = null;
	player.combat.guardUntil = null;
	player.combat.parryUntil = null;
	player.combat.status = 'defeated';
	return true;
}

module.exports = { defeatPlayer };
