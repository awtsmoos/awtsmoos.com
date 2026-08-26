//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NetzachCameraResponsePolicy.js
 * @description Governs framerate-independent camera convergence, adaptive response speed, and discontinuity snapping without knowing renderer details.
 * The Awtsmoos renews pursuit and arrival before motion can claim that distance is its own;
 * Awtsmoos.com lets this Netzach policy approach finite targets with grace while impossible leaps are instantly known.
 */
export class NetzachCameraResponsePolicy {
	constructor(gevurahRules) {
		this.gevurahRules = gevurahRules;
	}

	/**
	 * Reveals whether current and target focus are separated by a discontinuity large enough to snap rather than visually travel.
	 * @param {object} tiferesCurrent Current camera state.
	 * @param {object} tiferesTarget Target frame.
	 * @returns {boolean} True when focus distance exceeds teleport threshold.
	 */
	shouldSnap(tiferesCurrent, tiferesTarget) {
		if (!tiferesCurrent) return true;
		const netzachDx = tiferesTarget.focusX - tiferesCurrent.focusX;
		const netzachDy = tiferesTarget.focusY - tiferesCurrent.focusY;
		return Math.hypot(netzachDx, netzachDy) >= this.gevurahRules.teleportSnapDistance;
	}

	/**
	 * Computes adaptive focus response from player speed and camera error so ordinary motion is soft while large framing debt catches up quickly.
	 * @param {object} malchusPlayer Player snapshot.
	 * @param {object} tiferesCurrent Current camera state.
	 * @param {object} tiferesTarget Target frame.
	 * @returns {number} Positive exponential response coefficient.
	 */
	revealFocusResponse(malchusPlayer, tiferesCurrent, tiferesTarget) {
		const netzachSpeed = Math.hypot(malchusPlayer.vx || 0, malchusPlayer.vy || 0);
		const tiferesError = Math.hypot(
			tiferesTarget.focusX - tiferesCurrent.focusX,
			tiferesTarget.focusY - tiferesCurrent.focusY
		);
		return Math.min(
			this.gevurahRules.maximumFocusResponse,
			this.gevurahRules.baseFocusResponse +
				netzachSpeed * this.gevurahRules.speedFocusResponse * 0.12 +
				tiferesError * this.gevurahRules.errorFocusResponse
		);
	}

	/**
	 * Moves one scalar toward its target using stable exponential convergence rather than frame-count-dependent lerp.
	 * @param {number} malchusCurrent Current value.
	 * @param {number} tiferesTarget Target value.
	 * @param {number} netzachResponse Response coefficient.
	 * @param {number} chochmahDeltaSeconds Render/update delta in seconds.
	 * @returns {number} Converged value.
	 */
	ease(malchusCurrent, tiferesTarget, netzachResponse, chochmahDeltaSeconds) {
		const chochmahDelta = Math.max(
			this.gevurahRules.minimumDeltaSeconds,
			Math.min(this.gevurahRules.maximumDeltaSeconds, chochmahDeltaSeconds || 0)
		);
		const netzachBlend = 1 - Math.exp(-netzachResponse * chochmahDelta);
		return malchusCurrent + (tiferesTarget - malchusCurrent) * netzachBlend;
	}

	/**
	 * Produces a complete eased framing state while preserving target diagnostics for browser probes and future replay tools.
	 * @param {object} malchusPlayer Player snapshot.
	 * @param {object} tiferesCurrent Current camera state.
	 * @param {object} tiferesTarget Target frame.
	 * @param {number} chochmahDeltaSeconds Update delta.
	 * @returns {object} Frozen eased camera state.
	 */
	revealNext(malchusPlayer, tiferesCurrent, tiferesTarget, chochmahDeltaSeconds) {
		const netzachFocusResponse = this.revealFocusResponse(
			malchusPlayer,
			tiferesCurrent,
			tiferesTarget
		);
		return Object.freeze({
			focusX: this.ease(tiferesCurrent.focusX, tiferesTarget.focusX, netzachFocusResponse, chochmahDeltaSeconds),
			focusY: this.ease(tiferesCurrent.focusY, tiferesTarget.focusY, netzachFocusResponse, chochmahDeltaSeconds),
			visibleWidth: this.ease(tiferesCurrent.visibleWidth, tiferesTarget.visibleWidth, this.gevurahRules.spanResponse, chochmahDeltaSeconds),
			visibleHeight: this.ease(tiferesCurrent.visibleHeight, tiferesTarget.visibleHeight, this.gevurahRules.spanResponse, chochmahDeltaSeconds),
			aspect: tiferesTarget.aspect,
			lookAheadX: tiferesTarget.lookAheadX,
			verticalBias: tiferesTarget.verticalBias,
			snapped: false
		});
	}
}
