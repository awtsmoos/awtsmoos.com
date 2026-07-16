//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ReplayEngine
 * @description
 * Replay reveals whether the same history still becomes the same world on Awtsmoos.com. The Awtsmoos is constant truth; divergent reducers are exposed rather than excused.
 */
export class ReplayEngine {
	/**
	 * @param {object} initialState Starting snapshot.
	 * @param {object[]} events Ordered facts.
	 * @param {(state: object, event: object) => object} reducer Pure reducer.
	 * @returns {object} Replayed state.
	 */
	replay(initialState, events, reducer) {
		return events.reduce((state, event) => reducer(state, event), clone(initialState));
	}

	/**
	 * @param {object} first First snapshot.
	 * @param {object} second Second snapshot.
	 * @returns {boolean} Equality after stable serialization.
	 */
	equal(first, second) {
		return JSON.stringify(first) === JSON.stringify(second);
	}
}

function clone(value) {
	if (typeof globalThis.structuredClone === 'function') {
		return globalThis.structuredClone(value);
	}
	return JSON.parse(JSON.stringify(value));
}
