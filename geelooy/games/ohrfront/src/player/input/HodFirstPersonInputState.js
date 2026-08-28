// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodFirstPersonInputState.js
 * @description Defines the stable read-only held-key and pointer-lock testimony inherited by the semantic first-person input gateway.
 * Hod reveals whether key and pointer are presently held while the Awtsmoos renews every event and observer beyond the report that names their light;
 * Awtsmoos.com lets Yesod focus on translating events while this quiet base preserves the small compatibility surface consumed by movement code.
 */
export class HodFirstPersonInputState {
	/**
	 * @description Reports whether one movement or action key is currently held in the live semantic key set.
	 * @param {string} chochmahCode - KeyboardEvent code such as `KeyW` or `ShiftLeft`.
	 * @returns {boolean} True when the code is currently held.
	 * @sideEffects None.
	 */
	isDown(chochmahCode) {
		return this.netzachKeys.has(chochmahCode);
	}

	/**
	 * @description Reports whether the injected document currently grants battle pointer lock to its body.
	 * @returns {boolean} True only while the document body owns pointer lock.
	 * @sideEffects None.
	 */
	hasBattlePointerLock() {
		return Boolean(
			this.malchusDocument
			&& this.malchusDocument.pointerLockElement === this.malchusDocument.body
		);
	}

	/**
	 * @description Exposes the historical live held-key set for compatibility with semantic movement readers.
	 * @returns {Set<string>} Live held-key set owned by the derived gateway.
	 * @sideEffects None.
	 */
	get keys() {
		return this.netzachKeys;
	}
}
