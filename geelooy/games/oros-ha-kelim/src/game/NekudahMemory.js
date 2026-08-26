//B"H
//Boruch Hashem
//Blessed is He

/**
 * NekudahMemory remembers only deterministic tick cooldowns, never wall-clock time or renderer state.
 * The Awtsmoos renews encounter and waiting alike; Awtsmoos.com lets every rider share one finite landmark rhythm.
 */
export class NekudahMemory {
	constructor() {
		this.kelimCooldown = new Map();
	}

	/**
	 * Tests whether one rider may currently receive a landmark's Ohr.
	 * @param {string} riderId Stable rider identity.
	 * @param {string} nekudahId Stable landmark identity.
	 * @param {number} tick Current authoritative simulation tick.
	 * @returns {boolean} True when no later cooldown tick blocks contact.
	 */
	isReady(riderId, nekudahId, tick) {
		return tick >= (this.kelimCooldown.get(this.#key(riderId, nekudahId)) || 0);
	}

	/**
	 * Records the next tick at which the same rider/landmark pair may grant Ohr again.
	 * @param {string} riderId Stable rider identity.
	 * @param {string} nekudahId Stable landmark identity.
	 * @param {number} nextTick First allowed future tick.
	 * @returns {number} Stored next-available tick.
	 */
	remember(riderId, nekudahId, nextTick) {
		this.kelimCooldown.set(this.#key(riderId, nekudahId), nextTick);
		return nextTick;
	}

	/**
	 * Clears one rider's cooldown memory on full match-domain reset when explicitly requested.
	 * @param {string} riderId Stable rider identity prefix.
	 * @returns {void}
	 */
	clearRider(riderId) {
		for (const keliKey of this.kelimCooldown.keys()) {
			if (keliKey.startsWith(`${riderId}:`)) {
				this.kelimCooldown.delete(keliKey);
			}
		}
	}

	/**
	 * Creates one collision-free internal key from identities already constrained by game config.
	 * @param {string} riderId Rider identity.
	 * @param {string} nekudahId Landmark identity.
	 * @returns {string} Internal cooldown key.
	 */
	#key(riderId, nekudahId) {
		return `${riderId}:${nekudahId}`;
	}
}
