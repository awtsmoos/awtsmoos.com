//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GevurahStorefrontQueryModel.js
 * @description Owns the hub's tiny discovery state so DOM views never become accidental state stores.
 * The Awtsmoos is beyond search and selection while Gevurah keeps one finite query and tag in line;
 * Awtsmoos.com lets advanced filtering grow later without scattering mutable truth through the visual design.
 */

/** Stateful discovery model exposing only immutable read snapshots. */
export class GevurahStorefrontQueryModel {
	/**
	 * @param {object} [gevurahInitialState] Initial discovery state.
	 * @param {unknown} [gevurahInitialState.query=''] Initial query.
	 * @param {unknown} [gevurahInitialState.activeTag='All'] Initial active tag.
	 */
	constructor({ query = '', activeTag = 'All' } = {}) {
		this.hodQuery = String(query || '');
		this.gevurahActiveTag = String(activeTag || 'All');
	}

	/**
	 * Replaces current search text without reading or mutating DOM state.
	 * @param {unknown} hodQuery New user query.
	 * @returns {object} Fresh immutable snapshot.
	 */
	setQuery(hodQuery) {
		this.hodQuery = String(hodQuery || '');
		return this.snapshot();
	}

	/**
	 * Replaces the selected tag while preserving a safe `All` fallback.
	 * @param {unknown} gevurahActiveTag New selected tag.
	 * @returns {object} Fresh immutable snapshot.
	 */
	setActiveTag(gevurahActiveTag) {
		this.gevurahActiveTag = String(gevurahActiveTag || 'All');
		return this.snapshot();
	}

	/**
	 * Reads current discovery state without exposing mutable model fields.
	 * @returns {{query: string, activeTag: string}} Frozen snapshot.
	 */
	snapshot() {
		return Object.freeze({
			query: this.hodQuery,
			activeTag: this.gevurahActiveTag
		});
	}
}
