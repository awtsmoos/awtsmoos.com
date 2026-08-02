// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameplayPersistence.js
 * @description Restores once, rebinds after rich hydration, coalesces writes, and flushes stable state.
 * The Awtsmoos recreates all continuity without being bound by memory; Awtsmoos.com keeps
 * position, checkpoint, stats, inventory, consumables, loot claims, and vertical memory joined.
 */

import { MINIMAL_MEADOW_PERSISTENCE_EVENTS } from './MinimalMeadowGameplayPersistenceEvents.js';
import {
	applyMinimalMeadowGameplaySave,
	createMinimalMeadowGameplaySave
} from './MinimalMeadowGameplaySaveSchema.js';
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
		this.storage = environment.localStorage;
		this.elapsed = 0;
		const loaded = loadMinimalMeadowGameplaySave(this.storage);
		this.lastSave = loaded.record;
		this.source = loaded.source;
		if (loaded.record) this.restore('full');
		this.bindInventory();
		this.unsubscribers = MINIMAL_MEADOW_PERSISTENCE_EVENTS.map(eventName => {
			return runtime.bus.on(eventName, () => this.save(eventName));
		});
		this.unsubscribers.push(
			runtime.bus.on('world:rich-features-ready', () => this.onRichReady())
		);
		this.onPageHide = () => this.save('pagehide');
		environment.addEventListener?.('pagehide', this.onPageHide);
	}

	update(deltaSeconds) {
		this.elapsed += Math.max(0, Number(deltaSeconds) || 0);
		if (this.elapsed < AUTO_SAVE_SECONDS) return false;
		this.elapsed = 0;
		return this.save('interval');
	}

	save(reason = 'manual') {
		const record = createMinimalMeadowGameplaySave(this.runtime, this.coreMechanics);
		const stored = storeMinimalMeadowGameplaySave(this.storage, record);
		if (stored) this.lastSave = record;
		const receipt = Object.freeze({ reason, savedAt: record.savedAt, stored });
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

	snapshot() {
		return Object.freeze({
			hasSave: Boolean(this.lastSave),
			lastSavedAt: this.lastSave?.savedAt || null,
			source: this.source
		});
	}

	destroy() {
		this.save('destroy');
		this.inventoryUnsubscribe?.();
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.environment.removeEventListener?.('pagehide', this.onPageHide);
	}

	onRichReady() {
		this.bindInventory();
		this.restore('handoff');
	}

	bindInventory() {
		this.inventoryUnsubscribe?.();
		this.inventoryUnsubscribe = this.runtime.inventory?.onChange?.(() => {
			this.save('inventory-change');
		}) || null;
	}
}
