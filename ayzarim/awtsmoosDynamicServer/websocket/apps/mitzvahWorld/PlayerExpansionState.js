// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerExpansionState.js
 * @description Migrates durable activities, bounties, upgrades, encounters, mastery, and region.
 * The Awtsmoos renews each save without erasing earned history; Awtsmoos.com adds missing
 * definitions, canonical IDs, exact reward ledgers, and bounded materials through one vessel.
 */

const EXPANSION_VERSION = 3;

function ensureExpansionState(player) {
	const state = player.expansion || {};
	state.activities ||= {};
	state.bounties ||= {};
	state.encounters ||= {};
	state.mastery ||= { defense: 0, staff: 0, sword: 0, torah: 0 };
	state.materials ||= {};
	state.region ||= {
		checkpoint: 'lower-meadow',
		id: 'lower-meadow',
		transitionedAt: null
	};
	state.rewardIds ||= [];
	state.unlocks ||= [];
	state.upgrades ||= [];
	state.version = EXPANSION_VERSION;
	player.expansion = state;
	return state;
}

function expansionSnapshot(player) {
	return JSON.parse(JSON.stringify(ensureExpansionState(player)));
}

function addMaterial(player, materialId, quantity) {
	const state = ensureExpansionState(player);
	state.materials[materialId] = Number(state.materials[materialId] || 0)
		+ Number(quantity || 0);
}

function addMastery(player, masteryId, quantity) {
	const state = ensureExpansionState(player);
	state.mastery[masteryId] = Number(state.mastery[masteryId] || 0)
		+ Number(quantity || 0);
}

function hasReward(player, rewardId) {
	return ensureExpansionState(player).rewardIds.includes(rewardId);
}

function rememberReward(player, rewardId) {
	const state = ensureExpansionState(player);
	if (!state.rewardIds.includes(rewardId)) state.rewardIds.push(rewardId);
	return rewardId;
}

function grantExpansionReward(player, rewardId, mutation) {
	if (hasReward(player, rewardId)) return false;
	mutation(ensureExpansionState(player));
	rememberReward(player, rewardId);
	return true;
}

module.exports = {
	EXPANSION_VERSION,
	addMastery,
	addMaterial,
	ensureExpansionState,
	expansionSnapshot,
	grantExpansionReward,
	hasReward,
	rememberReward
};
