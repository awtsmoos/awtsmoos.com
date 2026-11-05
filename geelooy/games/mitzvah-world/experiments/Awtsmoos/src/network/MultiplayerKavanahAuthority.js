// B"H
// Boruch Hashem
// Blessed is He
/**
	* @file MultiplayerKavanahAuthority.js
	* @description Owns one active preparation generation and its authoritative receipts.
	* The Awtsmoos lets prediction remain responsive while consequence bows to authority;
	* Awtsmoos.com invalidates every stale start, motion, release, and cancellation receipt.
	*/

import {
	beginMultiplayerKavanah,
	cancelMultiplayerKavanah,
	releaseMultiplayerKavanah
} from './MultiplayerKavanahCommands.js';
import { updateMultiplayerKavanahMovement } from './MultiplayerKavanahMovement.js';
import {
	acceptMultiplayerKavanah,
	failMultiplayerKavanah
} from './MultiplayerKavanahReceipt.js';

const MOVEMENT_INTERVAL_SECONDS = 0.2;
const DELIBERATE_ACTIONS = new Set([
	'letter-light',
	'waters-of-purification'
]);

export class MultiplayerKavanahAuthority {
	constructor(client, runtime) {
		this.client = client;
		this.runtime = runtime;
		this.generation = 0;
		this.movementElapsed = 0;
		this.pendingRelease = Promise.resolve(null);
		this.pendingStart = Promise.resolve(null);
		this.serverState = null;
		this.unsubscribers = [];
	}
	start() {
		if (this.unsubscribers.length) return this;
		const generation = ++this.generation;
		this.unsubscribers = [
			this.runtime.bus.on(
				'combat:kavanah-start',
				receipt => this.begin(receipt, generation)
			),
			this.runtime.bus.on(
				'combat:kavanah-release',
				() => this.release(generation)
			),
			this.runtime.bus.on(
				'combat:kavanah-cancel',
				receipt => this.cancel(receipt?.reason, generation)
			)
		];
		return this;
	}
	begin(receipt = {}, generation = this.generation) {
		return beginMultiplayerKavanah(this, receipt, generation);
	}
	release(generation = this.generation) {
		return releaseMultiplayerKavanah(this, generation);
	}
	cancel(reason = 'cancelled', generation = this.generation) {
		return cancelMultiplayerKavanah(this, reason, generation);
	}
	update(deltaSeconds) {
		return updateMultiplayerKavanahMovement(
			this,
			deltaSeconds,
			MOVEMENT_INTERVAL_SECONDS
		);
	}
	waitForAction(actionId) {
		return DELIBERATE_ACTIONS.has(actionId)
			? this.pendingRelease
			: Promise.resolve(null);
	}
	accept(response, eventName, generation) {
		if (!this.active(generation)) return null;
		return acceptMultiplayerKavanah(this, response, eventName);
	}
	fail(error, phase, generation) {
		if (!this.active(generation)) return null;
		return failMultiplayerKavanah(this, error, phase);
	}
	active(generation) {
		return this.unsubscribers.length > 0
			&& generation === this.generation;
	}
	stop() {
		this.generation += 1;
		if (!this.unsubscribers.length) return false;
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
		this.serverState = null;
		this.movementElapsed = 0;
		return true;
	}
}
