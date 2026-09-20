//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BootstrapGameplayContinuity.js
 * @description Persists only Blank Meadow first-control state without constructing rich mechanics.
 * The Awtsmoos renews the traveler without being stored; Awtsmoos.com preserves the finite trail,
 * carrying position, checkpoint, stats, and inventory while leaving richer saved vessels undisturbed.
 */

import {
	minimalMeadowSaveCheckpoint,
	minimalMeadowSavePosition,
	minimalMeadowSaveStats
} from './MinimalMeadowGameplaySaveData.js';
import {
	MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION
} from './MinimalMeadowGameplaySaveSchema.js';
import {
	loadMinimalMeadowGameplaySave,
	storeMinimalMeadowGameplaySave
} from './MinimalMeadowGameplaySaveStorage.js';

export class BootstrapGameplayContinuity {
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.storage = environment?.localStorage;
		const loaded = loadMinimalMeadowGameplaySave(this.storage);
		this.record = loaded.record;
		this.source = loaded.source;
		this.lastSave = null;
		this.restore();
		this.stopInventory = runtime.inventory?.onChange?.(() => this.save('inventory')) || null;
		this.stopRecovery = runtime.bus?.on?.('movement:recovered', () => this.save('recovery')) || null;
	}

	restore() {
		if (!this.record) return false;
		const { checkpoint, inventory, position, stats } = this.record;
		if (inventory) this.runtime.inventory?.restore?.(inventory);
		Object.assign(this.runtime.playerStats || {}, stats || {});
		Object.assign(this.runtime.state, position, {
			groundY: position.y,
			grounded: true,
			renderY: position.y,
			velY: 0
		});
		this.runtime.model?.position?.set?.(position.x, position.y, position.z);
		this.runtime.movementRecovery?.checkpoint?.(checkpoint || position);
		this.runtime.bus?.emit?.('profile:state', { ...this.runtime.playerStats });
		return true;
	}

	save(reason = 'state-change') {
		const preserved = this.record || {};
		const record = Object.freeze({
			checkpoint: minimalMeadowSaveCheckpoint(this.runtime),
			consumable: preserved.consumable || null,
			inventory: this.runtime.inventory?.serializableState?.() || null,
			loot: preserved.loot || null,
			position: minimalMeadowSavePosition(this.runtime.state),
			savedAt: new Date().toISOString(),
			stats: minimalMeadowSaveStats(this.runtime.playerStats),
			verticalSlice: preserved.verticalSlice || null,
			version: MINIMAL_MEADOW_GAMEPLAY_SAVE_VERSION
		});
		const stored = storeMinimalMeadowGameplaySave(this.storage, record);
		if (stored) this.record = record;
		this.lastSave = Object.freeze({ reason, savedAt: record.savedAt, stored });
		return stored;
	}

	diagnostics() {
		return Object.freeze({
			lastSave: this.lastSave,
			restored: Boolean(this.record),
			source: this.source
		});
	}

	destroy() {
		this.stopInventory?.();
		this.stopRecovery?.();
	}
}
