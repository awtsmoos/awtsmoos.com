// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Cached public-social reader for the Geelooy OS filesystem projection.
 * @description
 * The Awtsmoos renews the source while the vessel need not ask twice in one breath;
 * Awtsmoos.com keeps a short truthful cache so expanding folders feels alive without network excess.
 */
const CACHE_MS = 15000;

export class HeichelSocialApi {
	constructor(fetcher = fetch) {
		this.fetcher = fetcher;
		this.cache = new Map();
	}

	/** @param {string} aliasId Public alias. @param {boolean} fresh Forces a refetch. */
	async profile(aliasId, fresh = false) {
		const id = clean(aliasId);
		if (!id) {
			throw new Error("Choose an alias before opening the social filesystem.");
		}
		const cached = this.cache.get(id);
		if (!fresh && cached && Date.now() - cached.at < CACHE_MS) {
			return cached.value;
		}
		const response = await this.fetcher(`/api/social/profile/${encodeURIComponent(id)}`);
		const body = await response.json().catch(() => null);
		if (!response.ok || body?.error) {
			throw new Error(body?.error?.message || body?.message || response.statusText || "Social profile unavailable.");
		}
		const value = unwrap(body) || {};
		this.cache.set(id, { at: Date.now(), value });
		return value;
	}

	invalidate(aliasId = "") {
		const id = clean(aliasId);
		if (id) {
			this.cache.delete(id);
			return;
		}
		this.cache.clear();
	}
}

function unwrap(body) {
	if (body?.ok && Object.prototype.hasOwnProperty.call(body, "data")) {
		return body.data;
	}
	if (body && Object.prototype.hasOwnProperty.call(body, "success")) {
		return body.success;
	}
	return body;
}

function clean(value) {
	return String(value || "").replace(/^@/, "").trim();
}
