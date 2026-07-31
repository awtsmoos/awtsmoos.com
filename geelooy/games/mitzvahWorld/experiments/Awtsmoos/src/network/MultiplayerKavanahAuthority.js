// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerKavanahAuthority.js
 * @description Reconciles local preparation with server start, motion, release, and cancellation.
 * The Awtsmoos lets prediction remain responsive while final timing bows to authority;
 * Awtsmoos.com serializes cast identity, bounded motion, release, failure, and waiting deeds.
 */

import {
	updateMultiplayerKavanahMovement
} from './MultiplayerKavanahMovement.js';
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
		this.movementElapsed = 0;
		this.pendingRelease = Promise.resolve(null);
		this.pendingStart = Promise.resolve(null);
		this.serverState = null;
		this.unsubscribers = [];
	}

	start() {
		this.unsubscribers = [
			this.runtime.bus.on('combat:kavanah-start', receipt => {
				this.begin(receipt);
			}),
			this.runtime.bus.on('combat:kavanah-release', () => {
				this.release();
			}),
			this.runtime.bus.on('combat:kavanah-cancel', receipt => {
				this.cancel(receipt?.reason);
			})
		];
		return this;
	}

	begin(receipt = {}) {
		this.pendingStart = this.client.mmorpg.rpg
			.startKavanah(receipt.actionId)
			.then(response => acceptMultiplayerKavanah(
				this,
				response,
				'combat:kavanah-authority-start'
			))
			.catch(error => failMultiplayerKavanah(this, error, 'start'));
		return this.pendingStart;
	}

	release() {
		this.pendingRelease = this.pendingStart
			.then(() => this.releaseServerState())
			.catch(error => failMultiplayerKavanah(this, error, 'release'));
		return this.pendingRelease;
	}

	cancel(reason = 'cancelled') {
		return this.pendingStart.then(() => {
			if (!this.serverState?.active) return null;
			return this.client.mmorpg.rpg.cancelKavanah(reason)
				.then(response => acceptMultiplayerKavanah(
					this,
					response,
					'combat:kavanah-authority-cancel'
				));
		}).catch(error => failMultiplayerKavanah(this, error, 'cancel'));
	}

	update(deltaSeconds) {
		updateMultiplayerKavanahMovement(
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

	releaseServerState() {
		if (!this.serverState?.castId) {
			throw new Error('SERVER_KAVANAH_CAST_MISSING');
		}
		return this.client.mmorpg.rpg
			.releaseKavanah(this.serverState.castId)
			.then(response => acceptMultiplayerKavanah(
				this,
				response,
				'combat:kavanah-authority-release'
			));
	}

	stop() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
		this.serverState = null;
	}
}
