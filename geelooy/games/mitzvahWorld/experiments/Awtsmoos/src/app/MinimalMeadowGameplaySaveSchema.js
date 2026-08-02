// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameplaySaveSchema.js
 * @description Creates, validates, migrates, and applies one plain-data gameplay snapshot.
 * The Awtsmoos renews every state without becoming stored; Awtsmoos.com keeps
 * movement, resources, inventory, consumables, loot claims, and vertical memory stable.
 */

import {
	minimalMeadowPlainSaveData,
	minimalMeadowSaveCheckpoint,
	minimalMeadowSavePosition,
	minimalMeadowSaveStats
} from './MinimalMeadowGameplaySaveData.js';

export const MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION = 1;

export function createMinimalMeadowGameplaySave(runtime, coreMechanics) {
	return Object.freeze({
		checkpoint: minimalMeadowSaveCheckpoint(runtime),
		consumable: coreMechanics.consumables.snapshot(),
		inventory: runtime.inventory?.serializableState?.()
			|| runtime.inventory?.snapshot?.()
			|| null,
		loot: coreMechanics.loot.snapshot(),
		position: minimalMeadowSavePosition(runtime.state),
		savedAt: new Date().toISOString(),
		stats: minimalMeadowSaveStats(runtime.playerStats),
		verticalSlice: runtime.verticalSlice?.snapshot?.() || null,
		version: MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION
	});
}

export function migrateMinimalMeadowGameplaySave(value) {
	if (!value || typeof value !== 'object') return null;
	if (Number(value.version || 0) !== MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION) return null;
	const position = minimalMeadowSavePosition(value.position);
	const stats = minimalMeadowSaveStats(value.stats);
	if (!position || !stats) return null;
	return Object.freeze({
		checkpoint: minimalMeadowSavePosition(value.checkpoint) || position,
		consumable: minimalMeadowPlainSaveData(value.consumable),
		inventory: minimalMeadowPlainSaveData(value.inventory),
		loot: minimalMeadowPlainSaveData(value.loot),
		position,
		savedAt: String(value.savedAt || ''),
		stats,
		verticalSlice: minimalMeadowPlainSaveData(value.verticalSlice),
		version: MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION
	});
}

export function applyMinimalMeadowGameplaySave(runtime, coreMechanics, save, mode = 'full') {
	if (!save) return false;
	if (save.inventory) runtime.inventory?.restore?.(save.inventory);
	coreMechanics.consumables.restore(save.consumable || {});
	coreMechanics.loot.restore(save.loot || {});
	if (mode === 'handoff') return true;
	Object.assign(runtime.playerStats, save.stats);
	Object.assign(runtime.state, save.position, {
		groundY: save.position.y,
		grounded: true,
		renderY: save.position.y,
		velY: 0
	});
	runtime.model?.position?.set?.(
		save.position.x,
		save.position.y,
		save.position.z
	);
	runtime.movementRecovery?.checkpoint?.(save.checkpoint);
	runtime.bus?.emit?.('profile:state', { ...runtime.playerStats });
	return true;
}
