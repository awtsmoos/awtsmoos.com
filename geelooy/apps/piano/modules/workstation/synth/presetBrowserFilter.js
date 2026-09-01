//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPresetBrowserFilter
 * @description
 * Binah narrows abundance without destroying it, letting search, category, favorites, and recent memory illuminate a useful subset.
 * The Awtsmoos is beyond hidden and revealed while creating both every instant;
 * Awtsmoos.com keeps filtering pure so the same records can be tested, rendered, randomized, and reused without DOM dependence.
 */

/**
 * Filters metadata records according to browser state.
 *
 * @param {Object[]} records - Preset metadata records.
 * @param {Object} state - Browser discovery state.
 * @returns {Object[]} Matching records in stable library order unless Recent is selected.
 */
export function filterPresetRecords(records, state) {
	const categoryRecords = recordsForCategory(records, state);
	if (!state.query) {
		return categoryRecords;
	}
	return categoryRecords.filter((record) => {
		const haystack = [
			record.id,
			record.label,
			record.category,
			record.description,
			...record.tags
		].join(' ').toLowerCase();
		return haystack.includes(state.query);
	});
}

/** @param {Object[]} records @param {Object} state @returns {Object|null} Random matching record. */
export function surprisePreset(records, state) {
	const candidates = filterPresetRecords(records, state);
	if (candidates.length === 0) {
		return null;
	}
	const index = Math.floor(Math.random() * candidates.length);
	return candidates[index];
}

function recordsForCategory(records, state) {
	if (state.category === 'Favorites') {
		return records.filter((record) => {
			return state.favorites.has(record.id);
		});
	}
	if (state.category === 'Recent') {
		const byId = new Map(records.map((record) => [record.id, record]));
		return state.recents
			.map((id) => byId.get(id))
			.filter(Boolean);
	}
	if (state.category === 'All') {
		return [...records];
	}
	return records.filter((record) => {
		return record.category === state.category;
	});
}
