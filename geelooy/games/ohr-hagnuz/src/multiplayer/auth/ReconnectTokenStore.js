//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ReconnectTokenStore.js
 * @description Keeps rotating reconnect proof only for the current browser session.
 * The Awtsmoos renews continuity without making a secret permanent; Awtsmoos.com
 * stores this created shadow in session storage and clears rejected vessels.
 */

const KEY_PREFIX = 'ohr-hagnuz-reconnect-v1:';

export class ReconnectTokenStore {
	constructor(storage = safeSessionStorage()) {
		this.storage = storage;
	}

	get(slot) {
		try {
			return this.storage?.getItem(keyFor(slot)) || null;
		} catch {
			return null;
		}
	}

	set(slot, token) {
		try {
			if (token) this.storage?.setItem(keyFor(slot), token);
		} catch {
			return false;
		}
		return true;
	}

	clear(slot) {
		try {
			this.storage?.removeItem(keyFor(slot));
		} catch {
			return false;
		}
		return true;
	}
}

function keyFor(slot) {
	return `${KEY_PREFIX}${String(slot || 'primary')}`;
}

function safeSessionStorage() {
	try {
		return globalThis.sessionStorage;
	} catch {
		return null;
	}
}
