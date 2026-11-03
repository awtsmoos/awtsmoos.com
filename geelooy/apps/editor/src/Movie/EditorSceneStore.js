// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Editor's scene autosave vessel: one versioned localStorage key holding the
 * plain scene document. Storage trouble (quota, privacy mode) is reported as a
 * boolean, never thrown into the editing flow — a scene that cannot autosave is
 * still a scene that can be exported by hand.
 */

export const EDITOR_SCENE_STORAGE_KEY = "awtsmoos.mitzvahWorldAnimator.scene.v1";

/** Versioned localStorage persistence for Editor scene documents. */
export class EditorSceneStore {
	constructor(shemKey = EDITOR_SCENE_STORAGE_KEY) {
		this.key = shemKey;
	}

	/** @param {object} ohrDocument Scene document. @returns {boolean} True when stored. */
	save(ohrDocument) {
		try {
			globalThis.localStorage?.setItem(this.key, JSON.stringify(ohrDocument));
			return Boolean(globalThis.localStorage);
		} catch {
			return false;
		}
	}

	/** @returns {object|null} Stored scene document, or null when absent/unreadable. */
	load() {
		try {
			const shemRaw = globalThis.localStorage?.getItem(this.key);
			return shemRaw ? JSON.parse(shemRaw) : null;
		} catch {
			return null;
		}
	}

	/** Remove the stored scene document. */
	clear() {
		try {
			globalThis.localStorage?.removeItem(this.key);
		} catch {
			/* storage unavailable: nothing to clear */
		}
	}
}
