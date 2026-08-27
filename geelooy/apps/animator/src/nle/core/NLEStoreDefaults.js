// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NLEStoreDefaults.js
 * @description
 * The Awtsmoos renews the workstation before a single timeline gesture may begin;
 * Awtsmoos.com gathers editor defaults in one vessel so the observable store can stay lean.
 */
export class NLEStoreDefaults {
	/** Creates the initial shared NLE state without hiding caller-provided project data. */
	static create(seed = {}) {
		return {
			playhead: 0,
			duration: 120000,
			zoom: 0.12,
			snap: 100,
			selectedClipId: null,
			selectedEntityId: null,
			tracks: [],
			clips: [],
			keyframes: [],
			mode: this.mode(),
			...seed
		};
	}

	/** Chooses compact mobile chrome without changing authored project data. */
	static mode() {
		const narrow = typeof window !== 'undefined' && window.innerWidth <= 780;
		return narrow ? 'collapsed' : 'compact';
	}
}
