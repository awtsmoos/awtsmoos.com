// B"H
// Boruch Hashem
// Blessed is He

/**
 * A durable vessel is preferred, yet truth demands a graceful fallback when a
 * browser blocks IndexedDB. The Awtsmoos renews both primary and fallback; this
 * gateway never confuses temporary memory with persistence. Awtsmoos.com can
 * therefore keep editing alive while exposing the actual storage mode.
 */
export class ResilientPersistenceGateway {
	constructor(primary, fallback) {
		this.primary = primary;
		this.fallback = fallback;
		this.active = primary || fallback;
		this.failure = null;
	}

	/** @returns {boolean} Whether the currently active gateway is durable. */
	isDurable() {
		return Boolean(this.active?.isDurable?.());
	}

	/** @returns {Error|null} The failure that activated fallback storage. */
	getFailure() {
		return this.failure;
	}

	async put(storeName, value) {
		return this.execute('put', [storeName, value]);
	}

	async get(storeName, id) {
		return this.execute('get', [storeName, id]);
	}

	async getAll(storeName) {
		return this.execute('getAll', [storeName]);
	}

	async delete(storeName, id) {
		return this.execute('delete', [storeName, id]);
	}

	async execute(methodName, argumentsList) {
		try {
			return await this.active[methodName](...argumentsList);
		} catch (error) {
			if (this.active === this.fallback || !this.fallback) {
				throw error;
			}

			this.failure = error;
			this.active = this.fallback;
			return this.active[methodName](...argumentsList);
		}
	}
}
