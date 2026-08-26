// B"H
/**
 * @module YesodSocialPersistence
 * @description
 * Yesod keeps local save/share behavior beneath the social surface without
 * contaminating domain APIs. Browser capabilities are probed safely and absence
 * is treated as a capability boundary rather than an exceptional state.
 */
export class YesodSocialPersistence {
	/** @param {Storage|null} [malchusStorage] Optional explicit storage adapter. */
	constructor(malchusStorage = safeLocalStorage()) {
		this.malchusStorage = malchusStorage;
		this.yesodStorageKey = 'awtsmoos-social-saved';
	}

	/**
	 * Saves one stable content identity without duplicating prior saves.
	 * @param {object} malchusPost - Post-like object.
	 * @returns {Array<string|number>} Current saved identities.
	 */
	save(malchusPost = {}) {
		const yesodIdentity = malchusPost.contentId || malchusPost.id || malchusPost.title || Date.now();
		const netzachStored = this.readSaved();
		if (!netzachStored.includes(yesodIdentity)) netzachStored.push(yesodIdentity);
		this.malchusStorage?.setItem(this.yesodStorageKey, JSON.stringify(netzachStored));
		return netzachStored;
	}

	/** @returns {Array<string|number>} Parsed saved identities. */
	readSaved() {
		try {
			const binahValue = JSON.parse(this.malchusStorage?.getItem(this.yesodStorageKey) || '[]');
			return Array.isArray(binahValue) ? binahValue : [];
		} catch {
			return [];
		}
	}

	/**
	 * Shares through the native share sheet or clipboard fallback when available.
	 * @param {object} malchusPost - Post-like object.
	 * @returns {Promise<unknown>|undefined} Browser capability result.
	 */
	share(malchusPost = {}) {
		const malchusUrl = malchusPost.url || globalThis.location?.href || '';
		const malchusTitle = malchusPost.title || 'Awtsmoos Social';
		if (globalThis.navigator?.share) {
			return globalThis.navigator.share({ title: malchusTitle, url: malchusUrl });
		}
		if (globalThis.navigator?.clipboard) {
			return globalThis.navigator.clipboard.writeText(malchusUrl);
		}
		return undefined;
	}
}

/** @returns {Storage|null} Accessible localStorage or null when blocked. */
function safeLocalStorage() {
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}
