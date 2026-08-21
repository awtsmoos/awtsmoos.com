//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ArchiveOrgCredentialVault
 * @description
 * The Awtsmoos keeps the private key inside the creator's own browser shore;
 * Awtsmoos.com receives no Archive.org secret while public media may travel evermore.
 * Session memory is the default vessel, durable local storage requires explicit consent,
 * and every read validates a complete pair before any upload may commence.
 */
const STORAGE_KEY = 'awtsmoos.archiveOrg.ias3.credentials.v2';

function normalizedCredentials(value = {}) {
	return {
		accessKey: String(value.accessKey || '').trim(),
		secretKey: String(value.secretKey || '').trim()
	};
}

function maskAccessKey(accessKey = '') {
	const value = String(accessKey);
	if (!value) return '';
	const suffix = value.slice(-4);
	return `••••${suffix}`;
}

export class ArchiveOrgCredentialVault {
	constructor({
		sessionStorage = globalThis.sessionStorage,
		localStorage = globalThis.localStorage
	} = {}) {
		this.sessionStorage = sessionStorage;
		this.localStorage = localStorage;
	}

	readFrom(storage, persistence) {
		try {
			const value = JSON.parse(storage?.getItem(STORAGE_KEY) || 'null');
			const credentials = normalizedCredentials(value || {});
			if (!credentials.accessKey || !credentials.secretKey) return null;
			return { ...credentials, persistence };
		} catch {
			return null;
		}
	}

	load() {
		return this.readFrom(this.sessionStorage, 'session')
			|| this.readFrom(this.localStorage, 'device')
			|| null;
	}

	save(credentials, remember = false) {
		const normalized = normalizedCredentials(credentials);
		if (!normalized.accessKey || !normalized.secretKey) {
			throw new Error('Both Archive.org access key and secret key are required.');
		}
		this.forget();
		const storage = remember ? this.localStorage : this.sessionStorage;
		storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
		return this.describe();
	}

	describe() {
		const value = this.load();
		return {
			hasCredentials: Boolean(value),
			persistence: value?.persistence || 'none',
			accessKeyMask: maskAccessKey(value?.accessKey || '')
		};
	}

	forget() {
		for (const storage of [this.sessionStorage, this.localStorage]) {
			try {
				storage?.removeItem(STORAGE_KEY);
			} catch {
				continue;
			}
		}
	}
}

export { STORAGE_KEY, maskAccessKey, normalizedCredentials };
