// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowConsumableRuntime.js
 * @description Owns quick selection, deliberate windup, interruption, cooldown, and exact inventory commit.
 * The Awtsmoos joins intention and recovery without letting repeated input duplicate a carried vessel;
 * Awtsmoos.com preserves quantity until completion and gives every rejection one reason.
 */

import { DEFAULT_MINIMAL_MEADOW_CONSUMABLE, minimalMeadowConsumable } from './MinimalMeadowConsumableCatalog.js';
import { applyMinimalMeadowConsumable } from './MinimalMeadowConsumableEffects.js';
import { minimalMeadowCoreNow } from './MinimalMeadowCoreClock.js';
import {
	minimalMeadowConsumableRejection,
	nextMinimalMeadowConsumable,
	restoreMinimalMeadowConsumable,
	snapshotMinimalMeadowConsumable
} from './MinimalMeadowConsumableState.js';

export class MinimalMeadowConsumableRuntime {
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.environment = environment;
		this.selectedItemId = DEFAULT_MINIMAL_MEADOW_CONSUMABLE;
		this.active = null;
		this.cooldowns = new Map();
		this.unsubscribers = [
			runtime.bus.on('core:consume', detail => this.activate(detail?.itemId)),
			runtime.bus.on('core:consumable-cycle', () => this.cycle()),
			runtime.bus.on('core:dodge-start', () => this.interrupt('DODGE_STARTED')),
			runtime.bus.on('enemy:attack', event => {
				if (event?.accepted !== false) this.interrupt('PLAYER_DAMAGED');
			}),
			runtime.bus.on('player:defeated', () => this.interrupt('PLAYER_DEFEATED'))
		];
	}

	activate(itemId = this.selectedItemId) {
		const definition = minimalMeadowConsumable(itemId);
		const reason = minimalMeadowConsumableRejection(
			this.runtime, this.active, this.cooldowns, definition, this.environment
		);
		if (reason) return this.reject(reason);
		const now = minimalMeadowCoreNow(this.environment);
		this.selectedItemId = definition.itemId;
		this.active = Object.freeze({
			completesAt: now + definition.useSeconds,
			itemId: definition.itemId,
			startedAt: now
		});
		const receipt = Object.freeze({ accepted: true, definition, ...this.active });
		this.runtime.bus.emit('core:consumable-started', receipt);
		return receipt;
	}

	update() {
		if (!this.active) return null;
		const now = minimalMeadowCoreNow(this.environment);
		if (now < this.active.completesAt) return this.active;
		const definition = minimalMeadowConsumable(this.active.itemId);
		this.active = null;
		const receipt = applyMinimalMeadowConsumable(this.runtime, definition);
		if (receipt.accepted) {
			this.cooldowns.set(definition.itemId, now + definition.cooldownSeconds);
		}
		return receipt;
	}

	interrupt(reason = 'INTERRUPTED') {
		if (!this.active) return false;
		const receipt = Object.freeze({ accepted: false, itemId: this.active.itemId, reason });
		this.active = null;
		this.runtime.bus.emit('core:consumable-interrupted', receipt);
		return receipt;
	}

	cycle() {
		this.selectedItemId = nextMinimalMeadowConsumable(this.selectedItemId);
		const receipt = Object.freeze({
			definition: minimalMeadowConsumable(this.selectedItemId),
			selectedItemId: this.selectedItemId
		});
		this.runtime.bus.emit('core:consumable-selected', receipt);
		return receipt;
	}

	restore(value = {}) {
		return restoreMinimalMeadowConsumable(this, value);
	}

	snapshot() {
		return snapshotMinimalMeadowConsumable(this);
	}

	destroy() {
		this.interrupt('DESTROYED');
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
	}

	reject(reason) {
		const receipt = Object.freeze({ accepted: false, reason });
		this.runtime.bus.emit('core:consumable-rejected', receipt);
		return receipt;
	}
}
