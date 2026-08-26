//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HudMomentPresenter.js
 * @description Detects presentation-only reward moments from the unified run snapshot without creating gameplay state, persistence, or permanent UI.
 * The Awtsmoos renews each gift before Hod may name its flash and let the words depart;
 * Awtsmoos.com keeps the moment brief, so streak and Chesed feel alive without building another panel around the runner's heart.
 */

export class HodHudMomentPresenter {
	/** @param {number} [durationMs] Visible lifetime for one transient HUD moment. */
	constructor(durationMs = 900) {
		this.durationMs = Math.max(250, durationMs);
		this.previous = null;
		this.label = "";
		this.kind = "";
		this.until = 0;
	}

	/**
	 * Observes one snapshot and returns the current transient presentation moment.
	 * @param {object} snapshot Unified run snapshot.
	 * @param {number} [now] Deterministic clock override for tests.
	 * @returns {Readonly<object>} Active moment state.
	 */
	observe(snapshot, now = this.now()) {
		const current = this.capture(snapshot);
		const previous = this.previous;
		this.previous = current;
		let started = false;
		if (previous) {
			const next = this.detect(previous, current);
			if (next) {
				this.label = next.label;
				this.kind = next.kind;
				this.until = now + this.durationMs;
				started = true;
			}
		}
		if (now >= this.until) {
			this.label = "";
			this.kind = "";
		}
		return Object.freeze({
			active: Boolean(this.label),
			label: this.label,
			kind: this.kind,
			started
		});
	}

	/** @param {object} snapshot Unified run snapshot. @returns {Readonly<object>} */
	capture(snapshot) {
		return Object.freeze({
			multiplier: Number(snapshot.multiplier) || 1,
			shield: Number(snapshot.shield) || 0,
			magnet: Number(snapshot.magnet) || 0,
			double: Number(snapshot.double) || 0
		});
	}

	/** @param {object} previous Previous values. @param {object} current Current values. @returns {object|null} */
	detect(previous, current) {
		if (current.shield > previous.shield) {
			return { kind: "shield", label: "Shmira ready" };
		}
		if (current.magnet > previous.magnet + 0.75) {
			return { kind: "magnet", label: "Tzedakah Pouch" };
		}
		if (current.double > previous.double + 0.75) {
			return { kind: "double", label: "Double Peruta" };
		}
		if (
			current.multiplier > previous.multiplier
			&& current.multiplier > 1
		) {
			return {
				kind: "streak",
				label: `Streak ×${current.multiplier}`
			};
		}
		return null;
	}

	/** @returns {number} Monotonic-ish browser clock. */
	now() {
		return globalThis.performance?.now?.() ?? Date.now();
	}
}
