// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerExpansionState.js
 * @description Migrates durable activities, mastery, rewards, materials, region, and unlocks.
 * The Awtsmoos renews identity through changing definitions; Awtsmoos.com preserves earned
 * progress while canonical aliases prevent duplicate rewards or stranded historical saves.
 */

const { canonicalEliteId } = require('./GameplayEliteCatalog.js');
const { canonicalRegionId } = require('./GameplayRegionCatalog.js');

const VERSION = 3;

function ensureExpansionState(player) {
	player.expansion ||= {};
	const state = player.expansion;
	state.activities ||= {};
	state.bounties ||= {};
	state.encounters ||= {};
	state.mastery ||= { defense: 0, staff: 0, sword: 0, torah: 0 };
	state.materials ||= {};
	state.region ||= { checkpoint: 'lower-meadow', id: 'lower-meadow' };
	state.rewardIds ||= [];
	state.unlocks ||= [];
	migrateAliases(state);
	state.version = VERSION;
	return state;
}

function addMaterial(player, materialId, amount = 1) {
	const state = ensureExpansionState(player);
	state.materials[materialId] = Math.max(
		0,
		Number(state.materials[materialId] || 0) + Number(amount || 0)
	);
}

function addMastery(player, masteryId, amount) {
	const state = ensureExpansionState(player);
	state.mastery[masteryId] = Math.max(
		0,
		Number(state.mastery[masteryId] || 0) + Number(amount || 0)
	);
}

function hasReward(player, rewardId) {
	return ensureExpansionState(player).rewardIds.includes(rewardId);
}

function rememberReward(player, rewardId) {
	const state = ensureExpansionState(player);
	if (!state.rewardIds.includes(rewardId)) state.rewardIds.push(rewardId);
}

function migrateAliases(state) {
	state.region.id = canonicalRegionId(state.region.id || 'lower-meadow');
	state.region.checkpoint = canonicalRegionId(
		state.region.checkpoint || state.region.id
	);
	for (const encounter of Object.values(state.encounters)) {
		if (encounter?.encounterId) {
			encounter.encounterId = canonicalEliteId(encounter.encounterId);
		}
	}
}

module.exports = {
	VERSION,
	addMastery,
	addMaterial,
	ensureExpansionState,
	hasReward,
	rememberReward
};
