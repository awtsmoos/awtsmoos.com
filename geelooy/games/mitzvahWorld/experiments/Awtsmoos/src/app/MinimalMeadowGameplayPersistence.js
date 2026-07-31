// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameplayPersistence.js
 * @description Restores once, rebinds after rich hydration, coalesces interval writes, and flushes stable state.
 * The Awtsmoos recreates all continuity without being bound by memory; Awtsmoos.com keeps
 * position, checkpoint, stats, inventory, consumables, loot claims, and vertical memory in one witness.
 */

import {
	applyMinimalMeadowGameplaySave,
	createMinimalMeadowGameplaySave
} from './MinimalMeadowGameplaySaveSchema.js';
import {
	bindMinimalMeadowPersistenceInventory,
	destroyMinimalMeadowPersistenceBindings,
	installMinimalMeadowPersistenceBindings,
	minimalMeadowPersistenceStorage
} from './MinimalMeadowGameplayPersistenceBindings.js';
import {
	loadMinimalMeadowGameplaySave,
	storeMinimalMeadowGameplaySave
} from './MinimalMeadowGameplaySaveStorage.js';

const AUTO_SAVE_SECONDS = 2;

export class MinimalMeadowGameplayPersistence {
	constructor(runtime, coreMechanics, environment = globalThis) {
		this.runtime = runtime;
		this.coreMechanics = coreMechanics;
		this.environment = environment;
		this.storage = minimalMeadowPersistenceStorage(environment);
		this.elapsed = 0;
		this.lastSave = null;
		this.source = 'empty';
		this.inventoryUnsubscribe = null;
		this.unsubscribers = [];
		const loaded = loadMinimalMeadowGameplaySave(this.storage);
		this.lastSave = loaded.record;
		this.source = loaded.source;
		if (loaded.record) this.restore('full');
		installMinimalMeadowPersistenceBindings(this);
	}

	update(deltaSeconds) {
		this.elapsed += Math.max(0, Number(deltaSeconds) || 0);
		if (this.elapsed < AUTO_SAVE_SECONDS) return false;
		this.elapsed = 0;
		return this.save('interval');
	}

	save(reason = 'manual') {
		const record = createMinimalMeadowGameplaySave(
			this.runtime,
			this.coreMechanics
		);
		const stored = storeMinimalMeadowGameplaySave(
			this.storage,
			record
		);
		if (stored) this.lastSave = record;
		const receipt = Object.freeze({
			reason,
			savedAt: record.savedAt,
			stored
		});
		this.runtime.bus.emit('gameplay:save-receipt', receipt);
		return receipt;
	}

	restore(mode = 'full') {
		if (!this.lastSave) return false;
		const restored = applyMinimalMeadowGameplaySave(
			this.runtime,
			this.coreMechanics,
			this.lastSave,
			mode
		);
		this.runtime.bus.emit('gameplay:restore-receipt', {
			mode,
			restored,
			source: this.source
		});
		return restored;
	}

	bindInventory() {
		bindMinimalMeadowPersistenceInventory(this);
	}

	snapshot() {
		return Object.freeze({
			hasSave: Boolean(this.lastSave),
			lastSavedAt: this.lastSave?.savedAt || null,
			source: this.source,
			storageAvailable: Boolean(this.storage)
		});
	}

	destroy() {
		this.save('destroy');
		destroyMinimalMeadowPersistenceBindings(this);
	}
}
