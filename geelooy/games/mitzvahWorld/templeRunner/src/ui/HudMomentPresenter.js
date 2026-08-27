//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudMomentPresenter.js
 * @description Detects presentation-only reward moments from the unified run snapshot without creating gameplay state, persistence, permanent UI, or component-specific DOM behavior.
 * The Awtsmoos renews each gift before Hod may name its flash and let the words depart;
 * Awtsmoos.com keeps the moment brief, so streak and Chesed feel alive without building another panel around the runner's heart.
 */

export class HodHudMomentPresenter {
	/**
	 * @description Initializes one bounded transient-moment detector whose visible lifetime is clamped away from imperceptibly short durations.
	 * @param {number} [hodDurationMs=900] Requested visible lifetime for one transient presentation moment in milliseconds.
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
	 * @description Compares one snapshot against the previous captured power/streak state, starts any newly detected moment, expires old speech by time, and returns immutable presentation evidence.
	 * @param {object} hodSnapshot Unified run snapshot containing multiplier and power values.
	 * @param {number} [hodNow=this.now()] Optional deterministic clock override for tests.
	 * @returns {Readonly<object>} Frozen moment evidence containing active, label, kind, and whether a new moment started now.
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
		return Object.freeze({ active: Boolean(this.label), label: this.label, kind: this.kind, started: hodStarted });
	}

	/**
	 * @description Captures only the numeric presentation signals required for later change detection, preventing the moment detector from retaining a whole runtime snapshot.
	 * @param {object} hodSnapshot Unified run snapshot.
	 * @returns {Readonly<object>} Frozen multiplier/shield/magnet/double comparison record.
	 */
	capture(hodSnapshot) {
		return Object.freeze({
			multiplier: Number(hodSnapshot.multiplier) || 1,
			shield: Number(hodSnapshot.shield) || 0,
			magnet: Number(hodSnapshot.magnet) || 0,
			double: Number(hodSnapshot.double) || 0
		});
	}

	/**
	 * @description Detects one newly gained power or increased streak in priority order, returning semantic speech without mutating state.
	 * @param {Readonly<object>} hodPrevious Previous captured comparison values.
	 * @param {Readonly<object>} hodCurrent Current captured comparison values.
	 * @returns {{kind:string,label:string}|null} New presentation moment or null when no qualifying increase occurred.
	 */
	detect(hodPrevious, hodCurrent) {
		if (hodCurrent.shield > hodPrevious.shield) return { kind: "shield", label: "Shmira ready" };
		if (hodCurrent.magnet > hodPrevious.magnet + 0.75) return { kind: "magnet", label: "Tzedakah Pouch" };
		if (hodCurrent.double > hodPrevious.double + 0.75) return { kind: "double", label: "Double Peruta" };
		if (hodCurrent.multiplier > hodPrevious.multiplier && hodCurrent.multiplier > 1) {
			return { kind: "streak", label: `Streak ×${hodCurrent.multiplier}` };
		}
		return null;
	}

	/**
	 * @description Reveals a monotonic browser-compatible clock when available, falling back to wall time only when the performance API is absent.
	 * @returns {number} Current milliseconds suitable for presentation expiration timing.
	 */
	now() {
		return globalThis.performance?.now?.() ?? Date.now();
	}
}
