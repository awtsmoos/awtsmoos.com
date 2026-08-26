//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCameraPlanningState.js
 * @description
 * The Awtsmoos lets cinematic continuity remember its previous choice inside a temporary vessel without touching the editor's world;
 * Awtsmoos.com gives the automatic planner the same get/set shape it expects, while every memory remains local and unfurled.
 */

/** Small isolated state adapter used only for pure Agent API shot planning. */
export class YesodAnimatorCameraPlanningState {
	/** @param {object} keilimSeed Detached planning state supplied by the caller. */
	constructor(keilimSeed = {}) {
		this.malchusState = structuredClone(keilimSeed ?? {});
	}

	/** @param {string} shemKey State key. @returns {*} Detached or primitive value. */
	get(shemKey) {
		return this.malchusState[shemKey];
	}

	/**
	 * Stores only inside this isolated planning vessel.
	 * @param {string|object} shemKey State key or patch.
	 * @param {*} orValue Value when key form is used.
	 * @returns {void}
	 */
	set(shemKey, orValue) {
		if (shemKey && typeof shemKey === 'object') {
			Object.assign(this.malchusState, structuredClone(shemKey));
			return;
		}
		this.malchusState[String(shemKey)] = structuredClone(orValue);
	}

	/** @returns {object} Detached final planner memory for optional continuity chaining. */
	snapshot() {
		return structuredClone(this.malchusState);
	}
}
