// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerSupportAuthority.js
	* @description Converts one active support generation into authoritative casts.
	* The Awtsmoos lets compassion appear locally while consequence waits for server truth;
	* Awtsmoos.com silences stopped generations and never duplicates the listening doorway.
	*/

export class MultiplayerSupportAuthority {
	constructor(client, runtime, kavanahAuthority) {
		this.client = client;
		this.kavanahAuthority = kavanahAuthority;
		this.runtime = runtime;
		this.sequence = 0;
		this.unsubscribers = [];
		this.generation = 0;
	}

	start() {
		if (this.unsubscribers.length) return this;
		const generation = ++this.generation;
		this.unsubscribers = [
			this.runtime.bus.on('combat:cast-complete', receipt => {
				if (receipt?.supportKind === 'cleanse') {
					this.castSelfCleanse(receipt, generation);
				}
			})
		];
		return this;
	}

	async castSelfCleanse(receipt = {}, generation = this.generation) {
		try {
			const kavanah = await this.kavanahAuthority.waitForAction(receipt.actionId);
			if (!this.active(generation)) return null;
			const response = await this.client.mmorpg.rpg.supportCast({
				actionId: receipt.actionId,
				castInstanceId: this.nextToken(receipt.actionId),
				elapsedMs: kavanah?.kavanah?.elapsedMilliseconds || 0,
				targetPlayerId: this.client.playerId
			});
			return this.accept(response, 'combat:support-authority', generation);
		} catch (error) {
			return this.fail(error, 'support', generation);
		}
	}

	async groupCounter(creatureId, actionId = 'guarded-thought') {
		const generation = this.generation;
		if (!this.active(generation)) return null;
		try {
			const response = await this.client.mmorpg.rpg.groupCounter({
				actionId,
				castInstanceId: this.nextToken(actionId),
				creatureId,
				elapsedMs: 0
			});
			return this.accept(response, 'combat:group-counter-authority', generation);
		} catch (error) {
			return this.fail(error, 'group-counter', generation);
		}
	}

	accept(response, eventName, generation) {
		if (!this.active(generation)) return null;
		const payload = response?.payload || response || {};
		this.runtime.bus.emit(eventName, payload);
		return payload;
	}

	fail(error, phase, generation) {
		if (!this.active(generation)) return null;
		this.runtime.bus.emit('combat:support-authority-failed', {
			error: error?.message || String(error),
			phase
		});
		throw error;
	}

	nextToken(actionId) {
		this.sequence += 1;
		return `${this.client.playerId}:${actionId}:${this.sequence}`;
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
		return true;
	}
}
