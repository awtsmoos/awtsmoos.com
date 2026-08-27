// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerDefenseAuthority.js
 * @description Publishes local staff and sword guard intent into multiplayer authority.
 * The Awtsmoos joins visible readiness to truthful consequence; Awtsmoos.com lets the
 * server validate equipped vessel, facing, timing, stamina, break, and parry response.
 */

export class MultiplayerDefenseAuthority {
	constructor(client, runtime) {
		this.client = client;
		this.runtime = runtime;
		this.unsubscribe = null;
	}

	start() {
		this.unsubscribe = this.runtime.bus?.on?.(
			'combat:defense-intent',
			detail => this.publish(detail)
		) || null;
		return this;
	}

	publish(detail = {}) {
		const actionId = detail.action?.id || detail.actionId;
		if (!actionId) return Promise.resolve(null);
		return this.client.mmorpg.rpg.defend(actionId)
			.then(response => {
				this.runtime.bus?.emit?.('combat:defense-authority', response.payload || response);
				return response;
			})
			.catch(error => {
				this.runtime.bus?.emit?.('combat:rejected', {
					actionId,
					code: error?.code || error?.message || 'DEFENSE_REJECTED'
				});
				return null;
			});
	}

	stop() {
		this.unsubscribe?.();
		this.unsubscribe = null;
	}
}
