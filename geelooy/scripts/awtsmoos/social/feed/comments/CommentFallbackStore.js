//B"H
//Boruch Hashem
//Blessed is He

const STORAGE_KEY = 'geelooy-feed-viewer-comments';

/**
 * @class NetzachCommentFallbackStore
 * @description
 * Netzach preserves a user's unsent words when transport breaks without pretending those words already live on the server.
 * The Awtsmoos renews local memory and canonical truth as separate vessels; Awtsmoos.com marks fallback records pending and local,
 * so degraded resilience remains honest, retryable, and free from synthetic strangers who were never part of the social vocal.
 */
export class NetzachCommentFallbackStore {
	/**
	 * @description Creates a local fallback store around an explicit Storage implementation.
	 * @param {Storage} [storage=localStorage] Browser storage used only after real transport failure.
	 * @returns {NetzachCommentFallbackStore} Configured local fallback repository.
	 * @throws {never} Construction performs no storage IO.
	 */
	constructor(storage = localStorage) {
		this.storage = storage;
	}

	/**
	 * @description Reads locally pending comments for one post without inventing sample content.
	 * @param {string} objectId Canonical feed/post object identifier.
	 * @returns {Array<object>} Persisted local records, or an empty array when none exist or storage is unavailable.
	 * @throws {never} Malformed or inaccessible storage is treated as empty fallback state.
	 */
	read(objectId) {
		const state = this.readState();
		return Array.isArray(state[objectId]) ? state[objectId] : [];
	}

	/**
	 * @description Persists one visibly local pending record after a failed canonical mutation.
	 * @param {string} objectId Canonical feed/post object identifier.
	 * @param {string} text Trimmed comment text.
	 * @param {object} [meta={}] Verse, subsection, parent, and author metadata.
	 * @returns {object|null} Newly persisted local record, or null when text is empty/storage write fails.
	 * @throws {never} Storage failures are contained because degraded persistence must not crash the viewer.
	 */
	add(objectId, text, meta = {}) {
		const clean = String(text || '').trim();
		if (!clean) {
			return null;
		}
		const state = this.readState();
		const record = this.record(clean, meta);
		state[objectId] = [...(Array.isArray(state[objectId]) ? state[objectId] : []), record];
		try {
			this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
			return record;
		} catch {
			return null;
		}
	}

	/**
	 * @description Creates one explicit local-pending tree node compatible with server-normalized comment rendering.
	 * @param {string} text Trimmed comment text.
	 * @param {object} meta Contextual author/reply coordinates.
	 * @returns {object} Local pending comment node.
	 * @throws {never} Record creation performs no IO.
	 */
	record(text, meta) {
		const suffix = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
		return {
			id: `local-${suffix}`,
			author: meta.author || 'You',
			text,
			created: 'Pending sync',
			verseSection: meta.verseSection ?? 'root',
			subsectionId: meta.subsectionId || '',
			parentId: meta.parentId || '',
			parentSectionId: meta.parentSectionId || '',
			sections: [],
			assets: [],
			links: [],
			replies: [],
			source: 'local-fallback',
			pending: true
		};
	}

	/** @description Reads the full private storage object defensively. @returns {object} Parsed object or empty object. @throws {never} Invalid JSON/storage errors become empty state. */
	readState() {
		try {
			const parsed = JSON.parse(this.storage.getItem(STORAGE_KEY) || '{}');
			return parsed && typeof parsed === 'object' ? parsed : {};
		} catch {
			return {};
		}
	}
}

export {
	STORAGE_KEY
};
