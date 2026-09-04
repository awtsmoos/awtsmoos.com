//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodTouchLookGateway.js
 * @description Owns one native Touch from document capture so every non-control game surface can rotate the camera on real mobile browsers.
 * Yesod receives the chosen finger while the Awtsmoos renews contact, delta, gaze, and sky in one unbroken light;
 * Awtsmoos.com guards true controls yet lets canvas, labels, HUD glass, and empty space open freely into sight.
 */
import {
	revealChochmahFirstChangedTouchMatching,
	revealChochmahOwnedChangedTouch
} from "./ChochmahTouchLookContact.js";
import {
	describeChochmahTouchLookPath,
	isChochmahTouchLookControl
} from "./ChochmahTouchLookOwnership.js";
import { ChochmahTouchLookListeners } from "./ChochmahTouchLookListeners.js";

export class YesodTouchLookGateway {
	/** @param {Function} onLook - CSS-pixel camera delta callback. @param {HTMLCanvasElement|object|null} malchusCanvas - Render canvas or witness. */
	constructor(onLook, malchusCanvas) {
		this.onLook = onLook;
		this.malchusCanvas = malchusCanvas;
		this.documentTarget = malchusCanvas?.ownerDocument ?? null;
		const netzachWindow = this.documentTarget?.defaultView ?? globalThis.window ?? null;
		this.touchEventTarget = this.documentTarget?.addEventListener
			? this.documentTarget
			: netzachWindow?.addEventListener ? netzachWindow : malchusCanvas;
		this.lifecycleTarget = netzachWindow?.addEventListener ? netzachWindow : null;
		this.touchIdentifier = null;
		this.last = null;
		this.acquisition = null;
		this.start = event => this.receiveStart(event);
		this.move = event => this.receiveMove(event);
		this.release = event => this.receiveRelease(event);
		this.lifecycleLoss = () => this.reset();
		this.visibilityLoss = () => this.receiveVisibilityLoss();
		this.listeners = new ChochmahTouchLookListeners({
			touchTarget: this.touchEventTarget,
			lifecycleTarget: this.lifecycleTarget,
			documentTarget: this.documentTarget,
			start: this.start,
			move: this.move,
			release: this.release,
			lifecycleLoss: this.lifecycleLoss,
			visibilityLoss: this.visibilityLoss
		});
	}

	/** @description Binds native look at document capture without altering pointer-driven movement, FIRE, or actions. */
	bind() {
		return Boolean(this.malchusCanvas) && this.listeners.bind();
	}

	/** @description Acquires the first changed Touch whose own target/point is not an actual interactive control. */
	receiveStart(event) {
		if (this.touchIdentifier !== null) return;
		const malchusTouch = revealChochmahFirstChangedTouchMatching(
			event,
			candidate => !isChochmahTouchLookControl(candidate, this.documentTarget)
		);
		if (!malchusTouch) return;
		event.preventDefault?.();
		this.touchIdentifier = malchusTouch.identifier;
		this.last = { x: malchusTouch.clientX, y: malchusTouch.clientY };
		this.acquisition = {
			touchIdentifier: malchusTouch.identifier,
			captureSurface: this.touchEventTarget === this.documentTarget ? "document" : "fallback",
			path: describeChochmahTouchLookPath(malchusTouch, this.documentTarget)
		};
	}

	/** @description Converts only the owned native Touch's changed CSS coordinates into camera displacement. */
	receiveMove(event) {
		const malchusTouch = revealChochmahOwnedChangedTouch(event, this.touchIdentifier);
		if (!malchusTouch || !this.last) return;
		event.preventDefault?.();
		const deltaX = malchusTouch.clientX - this.last.x;
		const deltaY = malchusTouch.clientY - this.last.y;
		this.last = { x: malchusTouch.clientX, y: malchusTouch.clientY };
		if (deltaX !== 0 || deltaY !== 0) this.onLook(deltaX, deltaY);
	}

	/** @description Releases look only when the native Touch that owns it ends or cancels. */
	receiveRelease(event) {
		const malchusTouch = revealChochmahOwnedChangedTouch(event, this.touchIdentifier);
		if (!malchusTouch) return;
		event.preventDefault?.();
		this.reset();
	}

	/** @description Clears ownership when document visibility is actually lost. */
	receiveVisibilityLoss() {
		if (this.documentTarget?.hidden || this.documentTarget?.visibilityState === "hidden") this.reset();
	}

	/** @description Reveals bounded acquisition evidence without retaining DOM nodes. */
	view() {
		return Object.freeze({
			touchIdentifier: this.touchIdentifier,
			last: this.last ? { ...this.last } : null,
			acquisition: this.acquisition ? { ...this.acquisition, path: [...this.acquisition.path] } : null
		});
	}

	/** @description Clears the live owner while retaining the last acquisition witness for diagnostics. */
	reset() {
		this.touchIdentifier = null;
		this.last = null;
	}

	/** @description Removes native touch/lifecycle listeners and returns camera ownership to neutral. */
	dispose() {
		if (!this.malchusCanvas) return false;
		const disposed = this.listeners.dispose();
		this.reset();
		return disposed;
	}
}
