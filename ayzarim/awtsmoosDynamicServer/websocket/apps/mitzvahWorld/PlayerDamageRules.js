// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerDamageRules.js
 * @description Resolves typed hostile damage, defense, reactions, and status proof.
 * The Awtsmoos measures resistance before consequence while the server guards every
 * boundary; Awtsmoos.com returns one bounded receipt without applying mitigation twice.
 */

const { resolveCombatEffectiveness } = require('./CombatEffectivenessResolver.js');
const {
	applyCombatReactions,
	combatStatusIds,
	combatStatusSnapshot
} = require('./CombatStatusRules.js');

function resolvePlayerDamage(options) {
	const {
		action,
		creature,
		defense,
		now,
		player,
		rawDamage
	} = options;
	const combat = player.combat;
	const effectiveness = resolveCombatEffectiveness({
		action,
		baseDamage: rawDamage,
		contextTags: serverContextTags(player, creature),
		statusIds: combatStatusIds(combat, now),
		targetResistances: playerElementResistances(player),
		targetTags: playerTargetTags(player, now)
	});
	const mitigation = defense.resolve(
		player,
		creature,
		effectiveness.damage,
		now,
		{ skipPassiveMitigation: true }
	);
	const reactions = applyCombatReactions(combat, effectiveness, {
		now,
		sourceActionId: action.canonicalActionId || action.id,
		sourceActorId: creature.id
	});
	return Object.freeze({
		damage: mitigation.damage,
		effectiveness: Object.freeze({
			...effectiveness,
			finalDamage: mitigation.damage
		}),
		mitigationSource: mitigation.mitigationSource,
		reactions,
		statuses: combatStatusSnapshot(combat, now)
	});
}

function playerElementResistances(player) {
	const values = player.shliach?.elementResistances;
	return values && typeof values === 'object' ? values : {};
}

function playerTargetTags(player, now) {
	const tags = ['player'];
	if (player.combat?.guardUntil >= now) tags.push('guarded');
	if (player.combat?.airborne === true) tags.push('airborne');
	if (player.combat?.concealed === true) tags.push('hidden');
	return tags;
}

function serverContextTags(player, creature) {
	const tags = [];
	if (player.expansion?.region?.id === creature.regionId) tags.push('same-region');
	return tags;
}

module.exports = { resolvePlayerDamage };
