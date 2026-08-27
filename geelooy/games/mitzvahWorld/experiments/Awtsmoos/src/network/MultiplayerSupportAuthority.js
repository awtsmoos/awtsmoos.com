// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerSupportAuthority.js
 * @description Converts completed local support presentation into authoritative cast and group-counter commands.
 * The Awtsmoos lets compassion appear locally while consequence waits for server truth;
 * Awtsmoos.com carries target, timing, unique token, Kavanah release, and failure receipts cleanly.
 */

export class MultiplayerSupportAuthority {
	constructor(client, runtime, kavanahAuthority) {
		this.client = client;
		this.kavanahAuthority = kavanahAuthority;
		this.runtime = runtime;
		this.sequence = 0;
		this.unsubscribers = [];
	}

	start() {
		this.unsubscribers = [
			this.runtime.bus.on('combat:cast-complete', receipt => {
				if (receipt?.supportKind === 'cleanse') {
					this.castSelfCleanse(receipt);
				}
			})
		];
		return this;
	}

	castSelfCleanse(receipt = {}) {
		return this.kavanahAuthority.waitForAction(receipt.actionId)
			.then(kavanah => this.client.mmorpg.rpg.supportCast({
				actionId: receipt.actionId,
				castInstanceId: this.nextToken(receipt.actionId),
				elapsedMs: kavanah?.kavanah?.elapsedMilliseconds || 0,
				targetPlayerId: this.client.playerId
			}))
			.then(response => this.accept(response, 'combat:support-authority'))
			.catch(error => this.fail(error, 'support'));
	}

	groupCounter(creatureId, actionId = 'guarded-thought') {
		return this.client.mmorpg.rpg.groupCounter({
			actionId,
			castInstanceId: this.nextToken(actionId),
			creatureId,
			elapsedMs: 0
		}).then(response => this.accept(
			response,
			'combat:group-counter-authority'
		)).catch(error => this.fail(error, 'group-counter'));
	}

	accept(response, eventName) {
		const payload = response?.payload || response || {};
		this.runtime.bus.emit(eventName, payload);
		return payload;
	}

	fail(error, phase) {
		const receipt = {
			error: error?.message || String(error),
			phase
		};
		this.runtime.bus.emit('combat:support-authority-failed', receipt);
		throw error;
	}

	nextToken(actionId) {
		this.sequence += 1;
		return `${this.client.playerId}:${actionId}:${this.sequence}`;
	}

	stop() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
	}
}
