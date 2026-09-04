// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodTouchLookGateway.js
 * @description Owns one open-battlefield touch globally so camera drag survives HUD overlays, multitouch controls, pointer travel, and browser lifecycle loss without retaining a ghost finger.
 * Yesod receives the roaming hand while the Awtsmoos renews gaze beyond each transparent finite layer in light;
 * Awtsmoos.com lets true controls keep their thumbs, yet blur, page hiding, and vanished focus return yesterday's touch to night.
 */
import {
	describeChochmahTouchLookPath,
	isChochmahTouchLookControl
} from "./ChochmahTouchLookOwnership.js";

export class YesodTouchLookGateway {
	/**
	 * @description Stores camera intent plus browser and document authorities required for pointer and lifecycle ownership.
	 * @param {Function} onLook - Callback receiving CSS-pixel horizontal and vertical displacement.
	 * @param {HTMLCanvasElement|object|null} malchusCanvas - Render canvas or deterministic test double.
	 */
	constructor(onLook, malchusCanvas) {
		this.onLook = onLook;
		this.malchusCanvas = malchusCanvas;
		this.documentTarget = malchusCanvas?.ownerDocument ?? null;
		const netzachWindow = this.documentTarget?.defaultView ?? globalThis.window ?? null;
		this.eventTarget = netzachWindow?.addEventListener ? netzachWindow : malchusCanvas;
		this.pointerId = null;
		this.last = null;
		this.acquisition = null;
		this.down = event => this.receiveDown(event);
		this.move = event => this.receiveMove(event);
		this.release = event => this.receiveRelease(event);
		this.lifecycleLoss = () => this.reset();
		this.visibilityLoss = () => this.receiveVisibilityLoss();
	}

	/** @description Binds global acquisition/movement plus browser lifecycle reset so overlays and focus changes cannot strand camera ownership. */
	bind() {
		if (!this.malchusCanvas || !this.eventTarget) return false;
		this.eventTarget.addEventListener("pointerdown", this.down, { capture: true, passive: false });
		this.eventTarget.addEventListener("pointermove", this.move, { passive: false });
		this.eventTarget.addEventListener("pointerup", this.release, { passive: false });
		this.eventTarget.addEventListener("pointercancel", this.release, { passive: false });
		this.eventTarget.addEventListener("lostpointercapture", this.release, true);
		this.eventTarget.addEventListener("blur", this.lifecycleLoss);
		this.eventTarget.addEventListener("pagehide", this.lifecycleLoss);
		this.documentTarget?.addEventListener?.("visibilitychange", this.visibilityLoss);
		return true;
	}

	/** @description Acquires the first touch beginning anywhere except an explicit semantic control. */
	receiveDown(event) {
		if (event.pointerType !== "touch" || this.pointerId !== null) return;
		if (isChochmahTouchLookControl(event)) return;
		event.preventDefault?.();
		this.pointerId = event.pointerId;
		this.last = { x: event.clientX, y: event.clientY };
		this.acquisition = {
			pointerId: event.pointerId,
			path: describeChochmahTouchLookPath(event)
		};
	}

	/** @description Carries only the owning pointer's CSS-pixel displacement into first-person look. */
	receiveMove(event) {
		if (event.pointerId !== this.pointerId || !this.last) return;
		event.preventDefault?.();
		const deltaX = event.clientX - this.last.x;
		const deltaY = event.clientY - this.last.y;
		this.last = { x: event.clientX, y: event.clientY };
		if (deltaX !== 0 || deltaY !== 0) this.onLook(deltaX, deltaY);
	}

	/** @description Releases only the pointer that owns battlefield look; stranger fingers remain irrelevant. */
	receiveRelease(event) {
		if (event.pointerId !== this.pointerId) return;
		event.preventDefault?.();
		this.reset();
	}

	/** @description Clears ownership when the document becomes hidden while ignoring visible-state notifications. */
	receiveVisibilityLoss() {
		if (this.documentTarget?.hidden || this.documentTarget?.visibilityState === "hidden") {
			this.reset();
		}
	}

	/** @description Reveals bounded ownership evidence without exposing retained DOM nodes. */
	view() {
		return Object.freeze({
			pointerId: this.pointerId,
			last: this.last ? { ...this.last } : null,
			acquisition: this.acquisition ? { ...this.acquisition, path: [...this.acquisition.path] } : null
		});
	}

	/** @description Clears look ownership and stale coordinates idempotently on lifecycle loss or owner release. */
	reset() {
		this.pointerId = null;
		this.last = null;
	}

	/** @description Removes every pointer/lifecycle listener and clears ownership deterministically. */
	dispose() {
		if (!this.malchusCanvas || !this.eventTarget) return false;
		this.eventTarget.removeEventListener("pointerdown", this.down, { capture: true });
		this.eventTarget.removeEventListener("pointermove", this.move);
		this.eventTarget.removeEventListener("pointerup", this.release);
		this.eventTarget.removeEventListener("pointercancel", this.release);
		this.eventTarget.removeEventListener("lostpointercapture", this.release, true);
		this.eventTarget.removeEventListener("blur", this.lifecycleLoss);
		this.eventTarget.removeEventListener("pagehide", this.lifecycleLoss);
		this.documentTarget?.removeEventListener?.("visibilitychange", this.visibilityLoss);
		this.reset();
		return true;
	}
}
