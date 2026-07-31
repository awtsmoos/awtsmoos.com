// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureVerticalSliceState.js
 * @description Creates, restores, and projects posture plus bounded Kedem phase state.
 * The Awtsmoos renews hostile form without granting hidden truth to every observer;
 * Awtsmoos.com preserves break immunity, phase recovery, wipe memory, and fair public warning.
 */

const {
	createKedemWardenState,
	KEDEM_WARDEN_ID,
	snapshotKedemWarden,
	updateKedemWardenPhase
} = require('./KedemWardenRules.js');
const { createPostureState } = require('./PostureRules.js');

function createCreatureVerticalSliceState(source = {}, definition = {}) {
	const maximum = Math.max(
		40,
		Number(source.posture?.maximum || definition.maximumHealth * 0.55 || 60)
	);
	return {
		bossState: isKedem(source, definition)
			? createKedemWardenState(source.bossState)
			: null,
		posture: createPostureState(source.posture, maximum)
	};
}

function restoreCreatureVerticalSliceState(record, definition) {
	return createCreatureVerticalSliceState(record, definition);
}

function updateCreatureBossPhase(creature, playerCount = 1) {
	if (!creature.bossState) return null;
	const receipt = updateKedemWardenPhase(
		creature.bossState,
		creature.health,
		creature.maximumHealth,
		playerCount
	);
	creature.phase = receipt.phase;
	creature.concealed = receipt.concealed;
	return receipt;
}

function creatureVerticalSliceSnapshot(creature) {
	return Object.freeze({
		boss: creature.bossState
			? snapshotKedemWarden(creature.bossState)
			: null,
		posture: Object.freeze({
			brokenUntil: Number(creature.posture?.brokenUntil || 0),
			immunityUntil: Number(creature.posture?.immunityUntil || 0),
			maximum: Number(creature.posture?.maximum || 0),
			value: Number(Number(creature.posture?.value || 0).toFixed(2))
		})
	});
}

function isKedem(source, definition) {
	return source.speciesId === KEDEM_WARDEN_ID
		|| definition.id === KEDEM_WARDEN_ID;
}

module.exports = {
	createCreatureVerticalSliceState,
	creatureVerticalSliceSnapshot,
	restoreCreatureVerticalSliceState,
	updateCreatureBossPhase
};
