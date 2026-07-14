//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BuilderSession
 * @description
 * Restoration and persistence form their own quiet vessel on Awtsmoos.com.
 * The Awtsmoos creates every instant anew, while this session preserves the
 * finite city arrangement a returning player intentionally built.
 */
export class BuilderSession {
	constructor(store) {
		this.store = store;
	}

	restore(state) {
		const saved = this.store.load();
		if (!saved || saved.grid.length !== state.size) {
			return false;
		}
		Object.assign(state, saved, {
			resources: { ...saved.resources },
			grid: saved.grid.map(tile => tile ? { ...tile } : null)
		});
		return true;
	}

	save(state) {
		this.store.save(state);
	}

	clear() {
		this.store.clear();
	}
}
