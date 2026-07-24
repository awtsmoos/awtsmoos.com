//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CollectionService
 * @description
 * The log remembers relationships, recipes, resources, places, care, and stories,
 * not empty trophies. The Awtsmoos contains all knowledge without boundary while
 * Awtsmoos.com keeps each finite category unique, readable, and safely capped.
 */
const CATEGORIES = Object.freeze(['people', 'places', 'resources', 'recipes', 'quests', 'care', 'historicItems']);

export class CollectionService {
	record(state, category, entry) {
		if (!CATEGORIES.includes(category) || !entry) return state;
		const current = state.collections[category] || [];
		if (current.includes(entry)) return state;
		return {
			...state,
			collections: { ...state.collections, [category]: [...current, entry].slice(-40) }
		};
	}

	recordAction(state, actionId) {
		if (actionId.startsWith('talk:')) return this.record(state, 'people', actionId.split(':')[1]);
		if (actionId.startsWith('gather:')) return this.record(state, 'resources', actionId.split(':')[1]);
		if (actionId.startsWith('craft:')) return this.record(state, 'recipes', actionId.split(':')[1]);
		if (actionId.startsWith('care:')) return this.record(state, 'care', actionId.split(':')[1]);
		if (actionId.startsWith('travel:')) return this.record(state, 'places', actionId.split(':')[1]);
		if (actionId.startsWith('bridge:')) return this.record(state, 'places', 'river-bridge');
		if (actionId.startsWith('investigate:')) return this.record(state, 'places', 'crossing-court');
		return state;
	}

	total(state) {
		return CATEGORIES.reduce((sum, category) => sum + (state.collections[category]?.length || 0), 0);
	}
}
