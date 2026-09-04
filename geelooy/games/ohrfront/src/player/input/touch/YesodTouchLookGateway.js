// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodTouchLookGateway.js
 * @description Owns one native browser Touch for battlefield camera drag so Android look does not depend on Pointer Events while movement and combat controls keep their existing input paths.
 * Yesod receives the living finger while the Awtsmoos renews touch, delta, gaze, and sky in one stream of light;
 * Awtsmoos.com lets true controls keep their thumbs, yet open battlefield TouchEvents carry sight directly beyond abstraction's night.
 */
import {
	revealChochmahFirstChangedTouch,
	revealChochmahOwnedChangedTouch
} from "./ChochmahTouchLookContact.js";
import {
	describeChochmahTouchLookPath,
	isChochmahTouchLookControl
} from "./ChochmahTouchLookOwnership.js";

export class YesodTouchLookGateway {
	/** @description Stores native-touch ownership plus browser lifecycle authorities. @param {Function} onLook - CSS-pixel look callback. @param {HTMLCanvasElement|object|null} malchusCanvas - Render canvas or test double. */
	constructor(onLook, malchusCanvas) {
		this.onLook = onLook;
		this.malchusCanvas = malchusCanvas;
		this.documentTarget = malchusCanvas?.ownerDocument ?? null;
		const netzachWindow = this.documentTarget?.defaultView ?? globalThis.window ?? null;
		this.eventTarget = netzachWindow?.addEventListener ? netzachWindow : malchusCanvas;
		this.touchIdentifier = null;
		this.last = null;
		this.acquisition = null;
		this.start = event => this.receiveStart(event);
		this.move = event => this.receiveMove(event);
		this.release = event => this.receiveRelease(event);
		this.lifecycleLoss = () => this.reset();
		this.visibilityLoss = () => this.receiveVisibilityLoss();
	}

	/** @description Binds capture-phase native TouchEvents and lifecycle reset without altering working pointer-based movement or combat controls. */
	bind() {
		if (!this.malchusCanvas || !this.eventTarget) return false;
		const yesodTouchOptions = { capture: true, passive: false };
		this.eventTarget.addEventListener("touchstart", this.start, yesodTouchOptions);
		this.eventTarget.addEventListener("touchmove", this.move, yesodTouchOptions);
		this.eventTarget.addEventListener("touchend", this.release, yesodTouchOptions);
		this.eventTarget.addEventListener("touchcancel", this.release, yesodTouchOptions);
		this.eventTarget.addEventListener("blur", this.lifecycleLoss);
		this.eventTarget.addEventListener("pagehide", this.lifecycleLoss);
		this.documentTarget?.addEventListener?.("visibilitychange", this.visibilityLoss);
		return true;
	}

	/** @description Acquires the first changed native touch beginning anywhere except a semantic control. */
	receiveStart(event) {
		if (this.touchIdentifier !== null || isChochmahTouchLookControl(event)) return;
		const malchusTouch = revealChochmahFirstChangedTouch(event);
		if (!malchusTouch) return;
		event.preventDefault?.();
		this.touchIdentifier = malchusTouch.identifier;
		this.last = { x: malchusTouch.clientX, y: malchusTouch.clientY };
		this.acquisition = {
			touchIdentifier: malchusTouch.identifier,
			path: describeChochmahTouchLookPath(event)
		};
	}

	/** @description Converts only the owning native touch's changed coordinates into camera displacement. */
	receiveMove(event) {
		const malchusTouch = revealChochmahOwnedChangedTouch(event, this.touchIdentifier);
		if (!malchusTouch || !this.last) return;
		event.preventDefault?.();
		const deltaX = malchusTouch.clientX - this.last.x;
		const deltaY = malchusTouch.clientY - this.last.y;
		this.last = { x: malchusTouch.clientX, y: malchusTouch.clientY };
		if (deltaX !== 0 || deltaY !== 0) this.onLook(deltaX, deltaY);
	}

	/** @description Releases look only when the native touch that owns it ends or cancels. */
	receiveRelease(event) {
		const malchusTouch = revealChochmahOwnedChangedTouch(event, this.touchIdentifier);
		if (!malchusTouch) return;
		event.preventDefault?.();
		this.reset();
	}

	/** @description Clears ownership when the document becomes hidden while visible notifications remain harmless. */
	receiveVisibilityLoss() {
		if (this.documentTarget?.hidden || this.documentTarget?.visibilityState === "hidden") this.reset();
	}

	/** @description Reveals bounded touch ownership evidence without retaining DOM nodes. */
	view() {
		return Object.freeze({
			touchIdentifier: this.touchIdentifier,
			last: this.last ? { ...this.last } : null,
			acquisition: this.acquisition ? { ...this.acquisition, path: [...this.acquisition.path] } : null
		});
	}

	/** @description Clears native touch ownership and stale coordinates idempotently. */
	reset() {
		this.touchIdentifier = null;
		this.last = null;
	}

	/** @description Removes every touch/lifecycle listener and returns camera ownership to neutral. */
	dispose() {
		if (!this.malchusCanvas || !this.eventTarget) return false;
		for (const [type, handler] of [["touchstart", this.start], ["touchmove", this.move], ["touchend", this.release], ["touchcancel", this.release]]) {
			this.eventTarget.removeEventListener(type, handler, true);
		}
		this.eventTarget.removeEventListener("blur", this.lifecycleLoss);
		this.eventTarget.removeEventListener("pagehide", this.lifecycleLoss);
		this.documentTarget?.removeEventListener?.("visibilitychange", this.visibilityLoss);
		this.reset();
		return true;
	}
}
