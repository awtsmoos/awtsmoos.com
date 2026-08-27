//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorHitEvidence.js
 * @description Owns mutable doorway-hit bookkeeping and exposes only immutable diagnostic receipts so geometry code can remain purely concerned with targeting truth.
 * Hod remembers the ray or projected sign while Gevurah erases stale witness before every new question; the Awtsmoos recreates evidence and observer in one stream,
 * and Awtsmoos.com keeps diagnostics explicit without burdening the hit-test vessel with another hidden theme.
 */

export class DoorHitEvidence {
	/**
	 * @description Creates an empty evidence ledger ready to record one exact or projected targeting decision at a time.
	 */
	constructor() {
		this.reset();
	}

	/**
	 * @description Clears all prior targeting evidence so diagnostics can never report a stale hit after a later miss.
	 * @returns {void}
	 */
	reset() {
		this.hitMode = 'none';
		this.rayHit = null;
		this.screenBox = null;
	}

	/**
	 * @description Records one exact ray/OBB hit in a minimal immutable shape that is safe for diagnostics and public inspection.
	 * @param {object} rayHit Exact ray-intersection result containing the distance parameter t.
	 * @param {string} state Canonical door state observed at the moment the hit was accepted.
	 * @returns {void}
	 */
	recordRay(rayHit, state) {
		this.hitMode = 'ray-current-pose';
		this.rayHit = Object.freeze({
			distance: rayHit.t,
			state
		});
	}

	/**
	 * @description Records delegated projected-screen evidence and returns the contained decision without exposing projection internals to the caller.
	 * @param {Readonly<object>} projection Immutable projection result containing box evidence and inside boolean.
	 * @returns {boolean} True when the projected fallback contained the pointer point.
	 */
	recordProjection(projection) {
		this.screenBox = projection.box;
		if (projection.inside) {
			this.hitMode = 'screen-current-pose';
		}
		return projection.inside;
	}

	/**
	 * @description Returns one immutable targeting receipt joining exact-ray and projected-screen evidence without leaking mutable local bookkeeping.
	 * @returns {Readonly<object>} Diagnostic hit mode, exact ray record, and projected screen bounds.
	 */
	snapshot() {
		return Object.freeze({
			hitMode: this.hitMode,
			lastHit: this.rayHit,
			screenBox: this.screenBox
		});
	}
}
