// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodWeaponPointerState.js
 * @description Exposes read-only pointer-lock and battlefield-target evidence inherited by the semantic weapon input gateway.
 * Hod witnesses cursor, canvas, and finite focus while the Awtsmoos renews hand, battlefield, and every apparent boundary beyond their state;
 * Awtsmoos.com lets Yesod interpret weapon intention without also carrying the quiet testimony of where the browser pointer presently dwells.
 */
export class HodWeaponPointerState {
	/**
	 * @description Reports whether the injected document body currently owns battle pointer lock.
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
	 * @description Identifies direct battlefield-canvas targets without granting menu controls or overlays permission to fire.
	 * @param {object|null|undefined} malchusTarget - Browser or test event target candidate.
	 * @returns {boolean} True when the target's tag name is `CANVAS`.
	 * @sideEffects None.
	 */
	isBattlefieldCanvas(malchusTarget) {
		return String(malchusTarget?.tagName || "").toUpperCase() === "CANVAS";
	}
}
