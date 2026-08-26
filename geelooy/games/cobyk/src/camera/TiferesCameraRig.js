//B"H
//Boruch Hashem
//Blessed is He

import { revealCameraRules } from "./CobyKCameraRules.js";
import { NetzachCameraResponsePolicy } from "./NetzachCameraResponsePolicy.js";
import { TiferesCameraFramingPolicy } from "./TiferesCameraFramingPolicy.js";

/**
 * @file TiferesCameraRig.js
 * @description Stores only renderer-independent CobyK camera state while composing framing and response policies into load, snap, update, and snapshot flows.
 * The Awtsmoos renews focus and world before a camera rig can claim the eye as its own;
 * Awtsmoos.com lets this Tiferes vessel carry finite sight while renderer, physics, and DOM remain separately known.
 */
export class TiferesCameraRig {
	constructor(binaOptions = {}) {
		this.gevurahRules = binaOptions.rules || revealCameraRules();
		this.tiferesFraming = binaOptions.framing || new TiferesCameraFramingPolicy(this.gevurahRules);
		this.netzachResponse = binaOptions.response || new NetzachCameraResponsePolicy(this.gevurahRules);
		this.malchusState = null;
		this.tiferesTarget = null;
	}

	/**
	 * Loads a level by snapping immediately to its correct aspect-aware frame so hidden/menu layout cannot poison launch framing.
	 * @param {object} malchusPlayer Player snapshot.
	 * @param {object} binaBounds Parsed level bounds.
	 * @param {object} chochmahViewport Current visible viewport.
	 * @returns {object} Frozen snapped camera snapshot.
	 */
	load(malchusPlayer, binaBounds, chochmahViewport) {
		return this.snap(
			malchusPlayer,
			binaBounds,
			chochmahViewport
		);
	}

	/**
	 * Rebuilds target framing and adopts it instantly, appropriate for respawn, teleport, level swap, or explicit discontinuity recovery.
	 * @param {object} malchusPlayer Player snapshot.
	 * @param {object} binaBounds Parsed level bounds.
	 * @param {object} chochmahViewport Current visible viewport.
	 * @returns {object} Frozen snapped camera snapshot.
	 */
	snap(malchusPlayer, binaBounds, chochmahViewport) {
		this.tiferesTarget = this.tiferesFraming.reveal(
			malchusPlayer,
			binaBounds,
			chochmahViewport,
			null
		);
		this.malchusState = Object.freeze({
			...this.tiferesTarget,
			snapped: true
		});
		return this.snapshot();
	}

	/**
	 * Advances camera presentation without touching deterministic gameplay, snapping only across true discontinuities and easing ordinary motion.
	 * @param {object} malchusPlayer Player snapshot.
	 * @param {object} binaBounds Parsed level bounds.
	 * @param {object} chochmahViewport Current visible viewport.
	 * @param {number} chochmahDeltaSeconds Presentation delta in seconds.
	 * @returns {object} Frozen current camera snapshot.
	 */
	update(malchusPlayer, binaBounds, chochmahViewport, chochmahDeltaSeconds) {
		if (!this.malchusState) {
			return this.load(malchusPlayer, binaBounds, chochmahViewport);
		}
		this.tiferesTarget = this.tiferesFraming.reveal(
			malchusPlayer,
			binaBounds,
			chochmahViewport,
			this.malchusState
		);
		if (this.netzachResponse.shouldSnap(this.malchusState, this.tiferesTarget)) {
			this.malchusState = Object.freeze({
				...this.tiferesTarget,
				snapped: true
			});
		} else {
			this.malchusState = this.netzachResponse.revealNext(
				malchusPlayer,
				this.malchusState,
				this.tiferesTarget,
				chochmahDeltaSeconds
			);
		}
		return this.snapshot();
	}

	/**
	 * Reveals current state plus ideal target diagnostics so browser probes can distinguish framing policy from response lag.
	 * @returns {object|null} Frozen camera state or null before first load.
	 */
	snapshot() {
		if (!this.malchusState) return null;
		return Object.freeze({
			...this.malchusState,
			targetFocusX: this.tiferesTarget?.focusX ?? this.malchusState.focusX,
			targetFocusY: this.tiferesTarget?.focusY ?? this.malchusState.focusY,
			targetVisibleWidth: this.tiferesTarget?.visibleWidth ?? this.malchusState.visibleWidth,
			targetVisibleHeight: this.tiferesTarget?.visibleHeight ?? this.malchusState.visibleHeight
		});
	}
}
