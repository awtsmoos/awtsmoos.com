// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShliachProfileStore.js
 * @description Coordinates local profile rules, wallet observation, derived stats, and sync.
 * The Awtsmoos renews mutable state beneath pure laws; Awtsmoos.com keeps one small
 * coordinator while allocation, activation, expiry, and remote replacement stay testable.
 */

import {
	SHLIACH_ATTRIBUTES,
	SHLIACH_POWERUPS,
	applyShliachPowerups,
	deriveShliachStats
} from './ShliachProfileCatalog.js';
import {
	activateShliachPowerup,
	allocateShliachAttribute,
	createShliachProfileState,
	removeExpiredShliachPowerups,
	synchronizeShliachProfile
} from './ShliachProfileRules.js';

export class ShliachProfileStore {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
		this.inventory = options.inventory || null;
		this.state = createShliachProfileState(options.state);
		this.listeners = new Set();
		this.inventoryUnsubscribe = this.inventory?.onChange(() => {
			if (this.state.perutas == null) this.publish();
		});
	}

	onChange(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	allocate(attributeId, points = 1) {
		allocateShliachAttribute(this.state, attributeId, points);
		return this.publish();
	}

	activate(powerupId) {
		activateShliachPowerup(
			this.state,
			this.inventory,
			powerupId,
			this.clock()
		);
		return this.publish();
	}

	synchronize(payload) {
		synchronizeShliachProfile(this.state, payload);
		return this.publish();
	}

	snapshot() {
		removeExpiredShliachPowerups(this.state, this.clock());
		const base = deriveShliachStats(
			this.state.attributes,
			this.state.level
		);
		return structuredClone({
			...this.state,
			attributesCatalog: SHLIACH_ATTRIBUTES,
			derived: applyShliachPowerups(
				base,
				this.state.activePowerups
			),
			perutas: this.perutas(),
			powerupsCatalog: SHLIACH_POWERUPS
		});
	}

	perutas() {
		if (Number.isFinite(this.state.perutas)) return this.state.perutas;
		const stack = this.inventory?.snapshot().items.find(item => (
			item.itemId === 'perutas'
		));
		return stack?.quantity || 0;
	}

	publish() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot);
		return snapshot;
	}

	destroy() {
		this.inventoryUnsubscribe?.();
		this.listeners.clear();
	}
}
