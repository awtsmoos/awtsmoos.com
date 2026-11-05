//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudMomentPresenter.js
 * @description Detects presentation-only reward moments from the unified run snapshot, giving earned Ruach Rush priority without creating gameplay state or permanent UI.
 * The Awtsmoos renews each gift before Hod may name its flash and let the words depart;
 * Awtsmoos.com lets earned Ruach speak first, while streak and Chesed remain brief lights around the runner's heart.
 */

export class HodHudMomentPresenter {
	/**
	 * @description Initializes one bounded transient-moment detector whose visible lifetime is clamped away from imperceptibly short durations.
	 * @param {number} [hodDurationMs=900] Requested visible lifetime in milliseconds.
	 * @returns {void}
	 */
	constructor(hodDurationMs = 900) {
		this.durationMs = Math.max(250, hodDurationMs);
		this.previous = null;
		this.label = "";
		this.kind = "";
		this.until = 0;
	}

	/**
	 * @description Compares one snapshot against prior power/streak evidence, starts newly detected speech, expires old speech, and returns immutable presentation evidence.
	 * @param {object} hodSnapshot Unified run snapshot containing multiplier and power values.
	 * @param {number} [hodNow=this.now()] Optional deterministic clock override for tests.
	 * @returns {Readonly<object>} Frozen active/label/kind/started evidence.
	 */
	observe(hodSnapshot, hodNow = this.now()) {
		const hodCurrent = this.capture(hodSnapshot);
		const hodPrevious = this.previous;
		this.previous = hodCurrent;
		let hodStarted = false;
		if (hodPrevious) {
			const hodNext = this.detect(hodPrevious, hodCurrent);
			if (hodNext) {
				this.label = hodNext.label;
				this.kind = hodNext.kind;
				this.until = hodNow + this.durationMs;
				hodStarted = true;
			}
		}
		if (hodNow >= this.until) {
			this.label = "";
			this.kind = "";
		}
		return Object.freeze({
			active: Boolean(this.label),
			label: this.label,
			kind: this.kind,
			started: hodStarted
		});
	}

	/**
	 * @description Captures only numeric comparison signals, including separate earned Rush time, instead of retaining a whole runtime snapshot.
	 * @param {object} hodSnapshot Unified run snapshot.
	 * @returns {Readonly<object>} Frozen multiplier/rush/shield/magnet/double comparison record.
	 */
	capture(hodSnapshot) {
		return Object.freeze({
			multiplier: Number(hodSnapshot.multiplier) || 1,
			rush: Number(hodSnapshot.rush) || 0,
			shield: Number(hodSnapshot.shield) || 0,
			magnet: Number(hodSnapshot.magnet) || 0,
			double: Number(hodSnapshot.double) || 0
		});
	}

	/**
	 * @description Detects one newly gained earned/road power or streak in priority order, letting mastery Rush outrank its simultaneous ×4 streak speech.
	 * @param {Readonly<object>} hodPrevious Previous captured values.
	 * @param {Readonly<object>} hodCurrent Current captured values.
	 * @returns {{kind:string,label:string}|null} New presentation moment or null when no qualifying increase occurred.
	 */
	detect(hodPrevious, hodCurrent) {
		if (hodCurrent.rush > hodPrevious.rush + 0.75) {
			return { kind: "rush", label: "Ruach Rush" };
		}
		if (hodCurrent.shield > hodPrevious.shield) {
			return { kind: "shield", label: "Shmira ready" };
		}
		if (hodCurrent.magnet > hodPrevious.magnet + 0.75) {
			return { kind: "magnet", label: "Tzedakah Pouch" };
		}
		if (hodCurrent.double > hodPrevious.double + 0.75) {
			return { kind: "double", label: "Double Peruta" };
		}
		if (
			hodCurrent.multiplier > hodPrevious.multiplier
			&& hodCurrent.multiplier > 1
		) {
			return {
				kind: "streak",
				label: `Streak ×${hodCurrent.multiplier}`
			};
		}
		return null;
	}

	/**
	 * @description Reveals a monotonic browser-compatible clock, falling back to wall time only when the performance API is absent.
	 * @returns {number} Current milliseconds suitable for presentation expiration timing.
	 */
	now() {
		return globalThis.performance?.now?.() ?? Date.now();
	}
}
