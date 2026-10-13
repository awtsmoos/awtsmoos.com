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
		// B"H — Yaakov 2026-10-13: user-adjustable zoom. 1.0 = default framing,
		// <1 zooms in (tighter), >1 zooms out (wider). Persisted per device.
		this.malchusZoom = this.revealStoredZoom();
	}

	/** @returns {number} Zoom multiplier restored from device storage, or 1. */
	revealStoredZoom() {
		try {
			const tiferesStored = globalThis.localStorage?.getItem("cobyk-camera-zoom");
			const tiferesZoom = Number(tiferesStored);
			if (Number.isFinite(tiferesZoom) && tiferesZoom >= 0.4 && tiferesZoom <= 3) {
				return tiferesZoom;
			}
		} catch (_) { /* storage unavailable */ }
		return 1;
	}

	/** Persists the current zoom multiplier. @returns {void} */
	persistZoom() {
		try {
			globalThis.localStorage?.setItem("cobyk-camera-zoom", String(this.malchusZoom));
		} catch (_) { /* storage unavailable */ }
	}

	/**
	 * Adjusts the zoom multiplier and persists it.
	 * @param {number} chochmahFactor Multiplicative factor (e.g. 1.25 to zoom out).
	 * @returns {number} New zoom multiplier.
	 */
	zoomBy(chochmahFactor) {
		const tiferesFactor = Number(chochmahFactor);
		if (!Number.isFinite(tiferesFactor) || tiferesFactor <= 0) return this.malchusZoom;
		this.malchusZoom = Math.max(0.4, Math.min(3, this.malchusZoom * tiferesFactor));
		this.persistZoom();
		return this.malchusZoom;
	}

	/** @returns {number} Current zoom multiplier. */
	revealZoom() {
		return this.malchusZoom;
	}

	/**
	 * Scales a framing target by the user zoom, re-clamping focus to level bounds
	 * for the new span so zooming out never shows beyond the world edge.
	 * @param {object} tiferesTarget Unscaled framing target.
	 * @param {object} binaBounds Parsed level bounds.
	 * @returns {object} Frozen zoom-adjusted framing target.
	 */
	applyZoom(tiferesTarget, binaBounds) {
		if (!tiferesTarget || this.malchusZoom === 1) return tiferesTarget;
		const tiferesWidth = tiferesTarget.visibleWidth * this.malchusZoom;
		const tiferesHeight = tiferesTarget.visibleHeight * this.malchusZoom;
		const chochmahViewport = this.tiferesFraming.chochmahViewport;
		return Object.freeze({
			...tiferesTarget,
			focusX: chochmahViewport.clampFocus(
				tiferesTarget.focusX, binaBounds.minX, binaBounds.maxX, tiferesWidth
			),
			focusY: chochmahViewport.clampFocus(
				tiferesTarget.focusY, binaBounds.minY, binaBounds.maxY, tiferesHeight
			),
			visibleWidth: tiferesWidth,
			visibleHeight: tiferesHeight
		});
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
		this.tiferesTarget = this.applyZoom(
			this.tiferesFraming.reveal(
				malchusPlayer,
				binaBounds,
				chochmahViewport,
				null
			),
			binaBounds
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
		this.tiferesTarget = this.applyZoom(
			this.tiferesFraming.reveal(
				malchusPlayer,
				binaBounds,
				chochmahViewport,
				this.malchusState
			),
			binaBounds
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
			zoom: this.malchusZoom,
			targetFocusX: this.tiferesTarget?.focusX ?? this.malchusState.focusX,
			targetFocusY: this.tiferesTarget?.focusY ?? this.malchusState.focusY,
			targetVisibleWidth: this.tiferesTarget?.visibleWidth ?? this.malchusState.visibleWidth,
			targetVisibleHeight: this.tiferesTarget?.visibleHeight ?? this.malchusState.visibleHeight
		});
	}
}
