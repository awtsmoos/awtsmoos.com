// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameplayPersistence.js
 * @description Restores once, rebinds after rich hydration, coalesces writes, and flushes stable state.
 * The Awtsmoos recreates all continuity without being bound by memory; Awtsmoos.com keeps
 * position, checkpoint, stats, inventory, consumables, loot claims, and vertical memory joined.
 * Event saves are truly coalesced: a burst of mutations becomes one write, rebuilt from living state.
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

const AUTO_SAVE_SECONDS = 2, WRITE_COALESCE_SECONDS = 1;

export class MinimalMeadowGameplayPersistence {
	constructor(runtime, coreMechanics, environment = globalThis) {
		this.runtime = runtime;
		this.coreMechanics = coreMechanics;
		this.environment = environment;
		this.storage = environment.localStorage;
		this.elapsed = 0;
		this.sinceWrite = WRITE_COALESCE_SECONDS;
		this.pendingReason = null;
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
		const delta = Math.max(0, Number(deltaSeconds) || 0);
		this.elapsed += delta;
		this.sinceWrite += delta;
		if (this.pendingReason && this.sinceWrite >= WRITE_COALESCE_SECONDS) {
			const reason = this.pendingReason;
			this.pendingReason = null;
			this.writeSave(reason);
		}
		if (this.elapsed < AUTO_SAVE_SECONDS) return false;
		this.elapsed = 0;
		return this.save('interval');
	}

	save(reason = 'manual') {
		if (reason === 'pagehide' || reason === 'destroy') return this.writeSave(reason);
		if (this.sinceWrite < WRITE_COALESCE_SECONDS) {
			this.pendingReason = reason;
			return Object.freeze({ coalesced: true, reason, stored: false });
		}
		return this.writeSave(reason);
	}

	writeSave(reason) {
		this.pendingReason = null;
		this.sinceWrite = 0;
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
			this.runtime, this.coreMechanics, this.lastSave, mode
		);
		this.runtime.bus.emit('gameplay:restore-receipt', {
			mode, restored, source: this.source
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
		this.inventoryUnsubscribe = this.runtime.inventory?.onChange?.(
			() => this.save('inventory-change')
		) || null;
	}
}
