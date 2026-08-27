//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FutureDisclosureMemory
 * @description
 * The Awtsmoos lets temporary workspace preference survive a page turn without becoming permanent user data;
 * Awtsmoos.com keeps disclosure memory in session-only storage and silently yields when browser policy closes that gate.
 */
const STORAGE_PREFIX = 'awtsmoos.futureDisclosure.';

function sessionStorageSafe(environment) {
	try {
		return environment.sessionStorage || null;
	} catch {
		return null;
	}
}

export class FutureDisclosureMemory {
	constructor(environment = globalThis) {
		this.storage = sessionStorageSafe(environment);
	}

	keyFor(detail) {
		const key = detail?.dataset?.disclosureKey;
		return key ? `${STORAGE_PREFIX}${key}` : '';
	}

	read(detail) {
		const key = this.keyFor(detail);
		if (!key || !this.storage) return null;
		try {
			const value = this.storage.getItem(key);
			if (value === 'open') return true;
			if (value === 'closed') return false;
		} catch {}
		return null;
	}

	write(detail, open) {
		const key = this.keyFor(detail);
		if (!key || !this.storage) return false;
		try {
			this.storage.setItem(key, open ? 'open' : 'closed');
			return true;
		} catch {
			return false;
		}
	}
}

export {
	STORAGE_PREFIX as FUTURE_DISCLOSURE_STORAGE_PREFIX,
	sessionStorageSafe
};
