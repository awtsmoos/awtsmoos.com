// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerDefenseAuthority.js
	* @description Publishes one generation of guard intent into multiplayer authority.
	* The Awtsmoos joins visible readiness to consequence without reviving a stopped listener;
	* Awtsmoos.com validates one subscription and silences every late defense receipt.
	*/

export class MultiplayerDefenseAuthority {
	constructor(client, runtime) {
		this.client = client;
		this.runtime = runtime;
		this.unsubscribe = null;
		this.generation = 0;
	}

	start() {
		if (this.unsubscribe) return this;
		const generation = ++this.generation;
		this.unsubscribe = this.runtime.bus?.on?.(
			'combat:defense-intent',
			detail => this.publish(detail, generation)
		) || null;
		return this;
	}

	publish(detail = {}, generation = this.generation) {
		const actionId = detail.action?.id || detail.actionId;
		if (!actionId || !this.active(generation)) {
			return Promise.resolve(null);
		}
		return this.client.mmorpg.rpg.defend(actionId)
			.then(response => {
				if (!this.active(generation)) return null;
				this.runtime.bus?.emit?.(
					'combat:defense-authority',
					response.payload || response
				);
				return response;
			})
			.catch(error => {
				if (!this.active(generation)) return null;
				this.runtime.bus?.emit?.('combat:rejected', {
					actionId,
					code: error?.code || error?.message || 'DEFENSE_REJECTED'
				});
				return null;
			});
	}

	active(generation) {
		return Boolean(this.unsubscribe)
			&& generation === this.generation;
	}

	stop() {
		this.generation += 1;
		if (!this.unsubscribe) return false;
		this.unsubscribe();
		this.unsubscribe = null;
		return true;
	}
}
