// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowConsumableRuntime.js
 * @description Owns quick selection, active windup, cooldown memory, subscriptions, restore, and snapshots.
 * The Awtsmoos joins intention and recovery without letting repeated input duplicate a carried vessel;
 * Awtsmoos.com delegates mutation while one runtime keeps identity, time, interruption, and teardown coherent.
 */

import {
	DEFAULT_MINIMAL_MEADOW_CONSUMABLE,
	minimalMeadowConsumable
} from './MinimalMeadowConsumableCatalog.js';
import {
	activateMinimalMeadowConsumable,
	cycleMinimalMeadowConsumable,
	interruptMinimalMeadowConsumable,
	updateMinimalMeadowConsumable
} from './MinimalMeadowConsumableOperations.js';
import {
	minimalMeadowCoreDelayRemaining,
	minimalMeadowCoreNow
} from './MinimalMeadowCoreClock.js';

export class MinimalMeadowConsumableRuntime {
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.environment = environment;
		this.selectedItemId = DEFAULT_MINIMAL_MEADOW_CONSUMABLE;
		this.active = null;
		this.cooldowns = new Map();
		this.unsubscribers = createSubscriptions(this);
	}

	activate(itemId = this.selectedItemId) {
		return activateMinimalMeadowConsumable(this, itemId);
	}

	update() {
		return updateMinimalMeadowConsumable(this);
	}

	interrupt(reason = 'INTERRUPTED') {
		return interruptMinimalMeadowConsumable(this, reason);
	}

	cycle() {
		return cycleMinimalMeadowConsumable(this);
	}

	restore(value = {}) {
		if (minimalMeadowConsumable(value.selectedItemId)) {
			this.selectedItemId = value.selectedItemId;
		}
		return this.snapshot();
	}

	snapshot() {
		const now = minimalMeadowCoreNow(this.environment);
		return Object.freeze({
			active: this.active ? Object.freeze({ ...this.active }) : null,
			cooldownRemaining: minimalMeadowCoreDelayRemaining(
				this.cooldowns.get(this.selectedItemId),
				now
			),
			quantity: this.runtime.inventory?.quantity?.(
				this.selectedItemId
			) || 0,
			selectedItemId: this.selectedItemId
		});
	}

	destroy() {
		this.interrupt('DESTROYED');
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
	}
}

function createSubscriptions(controller) {
	const runtime = controller.runtime;
	return [
		runtime.bus.on('core:consume', detail => {
			controller.activate(detail?.itemId);
		}),
		runtime.bus.on('core:consumable-cycle', () => controller.cycle()),
		runtime.bus.on('core:dodge-start', () => {
			controller.interrupt('DODGE_STARTED');
		}),
		runtime.bus.on('enemy:attack', event => {
			if (event?.accepted !== false) {
				controller.interrupt('PLAYER_DAMAGED');
			}
		}),
		runtime.bus.on('player:defeated', () => {
			controller.interrupt('PLAYER_DEFEATED');
		})
	];
}
