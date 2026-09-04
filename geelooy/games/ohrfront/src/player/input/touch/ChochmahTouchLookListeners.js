//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahTouchLookListeners.js
 * @description Binds native look TouchEvents to document capture while keeping window lifecycle loss separate from gameplay contact delivery.
 * The Awtsmoos renews document and window as distinct vessels whose boundaries no browser should confuse;
 * Awtsmoos.com catches the living touch where the DOM receives it, while blur and pagehide still dissolve yesterday's view.
 */
export class ChochmahTouchLookListeners {
	/**
	 * @param {object} authorities - Touch, lifecycle, document, and handler authorities.
	 */
	constructor(authorities) {
		Object.assign(this, authorities);
		this.touchOptions = { capture: true, passive: false };
	}

	/** @description Binds document-capture touch delivery plus window/document lifecycle loss. */
	bind() {
		if (!this.touchTarget?.addEventListener) return false;
		this.touchTarget.addEventListener("touchstart", this.start, this.touchOptions);
		this.touchTarget.addEventListener("touchmove", this.move, this.touchOptions);
		this.touchTarget.addEventListener("touchend", this.release, this.touchOptions);
		this.touchTarget.addEventListener("touchcancel", this.release, this.touchOptions);
		this.lifecycleTarget?.addEventListener?.("blur", this.lifecycleLoss);
		this.lifecycleTarget?.addEventListener?.("pagehide", this.lifecycleLoss);
		this.documentTarget?.addEventListener?.("visibilitychange", this.visibilityLoss);
		return true;
	}

	/** @description Removes exactly the listeners installed by bind(). */
	dispose() {
		if (!this.touchTarget?.removeEventListener) return false;
		this.touchTarget.removeEventListener("touchstart", this.start, true);
		this.touchTarget.removeEventListener("touchmove", this.move, true);
		this.touchTarget.removeEventListener("touchend", this.release, true);
		this.touchTarget.removeEventListener("touchcancel", this.release, true);
		this.lifecycleTarget?.removeEventListener?.("blur", this.lifecycleLoss);
		this.lifecycleTarget?.removeEventListener?.("pagehide", this.lifecycleLoss);
		this.documentTarget?.removeEventListener?.("visibilitychange", this.visibilityLoss);
		return true;
	}
}
