// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameplaySaveSchema.js
 * @description Creates, migrates, and applies one stable aggregate gameplay record.
 * The Awtsmoos renews every state without becoming stored; Awtsmoos.com keeps
 * position, checkpoint, stats, inventory, consumables, loot claims, and vertical memory in plain data.
 */

import {
	minimalMeadowSaveCheckpoint,
	minimalMeadowSavePlainObject,
	minimalMeadowSavePosition,
	minimalMeadowSaveStats
} from './MinimalMeadowGameplaySaveValues.js';

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
	if (Number(value.version || 0)
		!== MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION) return null;
	const position = minimalMeadowSavePosition(value.position);
	const stats = minimalMeadowSaveStats(value.stats);
	if (!position || !stats) return null;
	return Object.freeze({
		checkpoint: minimalMeadowSavePosition(value.checkpoint) || position,
		consumable: minimalMeadowSavePlainObject(value.consumable),
		inventory: minimalMeadowSavePlainObject(value.inventory),
		loot: minimalMeadowSavePlainObject(value.loot),
		position,
		savedAt: String(value.savedAt || ''),
		stats,
		verticalSlice: minimalMeadowSavePlainObject(value.verticalSlice),
		version: MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION
	});
}

export function applyMinimalMeadowGameplaySave(
	runtime,
	coreMechanics,
	save,
	mode = 'full'
) {
	if (!save) return false;
	if (save.inventory) runtime.inventory?.restore?.(save.inventory);
	coreMechanics.consumables.restore(save.consumable || {});
	coreMechanics.loot.restore(save.loot || {});
	if (mode === 'handoff') return true;
	Object.assign(runtime.playerStats, save.stats);
	applyPosition(runtime, save.position);
	runtime.movementRecovery?.checkpoint?.(save.checkpoint);
	runtime.verticalSlice?.restore?.(save.verticalSlice);
	runtime.bus?.emit?.('profile:state', { ...runtime.playerStats });
	return true;
}

function applyPosition(runtime, position) {
	Object.assign(runtime.state, position, {
		groundY: position.y,
		grounded: true,
		renderY: position.y,
		velY: 0
	});
	runtime.model?.position?.set?.(
		position.x,
		position.y,
		position.z
	);
}
