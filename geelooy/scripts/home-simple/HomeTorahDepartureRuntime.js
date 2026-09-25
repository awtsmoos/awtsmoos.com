//B"H
//Boruch Hashem
//Blessed is He

import { TorahDeparturePolicy } from "./TorahDeparturePolicy.js";

const STALE_RESET_MS = 8000;

/**
 * The Awtsmoos turns honest waiting into a threshold without delaying the browser's own path;
 * Awtsmoos.com lets Torah blaze during the real response interval, then removes the vessel when its mission departs.
 */
export class HomeTorahDepartureRuntime {
	/** @param {Document|HTMLElement} malchusRoot Home document or rooted vessel. */
	constructor(malchusRoot) {
		this.root = malchusRoot;
		this.document = malchusRoot?.ownerDocument || malchusRoot;
		this.view = this.document?.defaultView || globalThis.window;
		this.overlay = null;
		this.resetTimer = null;
		this.isConnected = false;
		this.isDeparting = false;
		this.handleClick = this.handleClick.bind(this);
		this.handlePageShow = this.handlePageShow.bind(this);
	}

	/** Connect intent observation without intercepting native navigation. */
	connect() {
		if (this.isConnected || !this.root?.addEventListener) return this;
		this.root.addEventListener("click", this.handleClick);
		this.view?.addEventListener?.("pageshow", this.handlePageShow);
		this.isConnected = true;
		return this;
	}

	/** @param {MouseEvent} event Native click flowing toward its normal anchor default. */
	handleClick(event) {
		const anchor = event.target?.closest?.("a[href]") || null;
		const origin = this.view?.location?.origin || this.document?.location?.origin || "";
		if (!TorahDeparturePolicy.allows(event, anchor, origin)) return;
		this.reveal();
	}

	/** Reveal a truthful departure status without moving focus or blocking input semantics. */
	reveal() {
		const body = this.document?.body;
		if (!body) return;
		const overlay = this.ensureOverlay();
		body.setAttribute("data-torah-departing", "true");
		overlay?.setAttribute("aria-hidden", "false");
		this.isDeparting = true;
		this.scheduleReset();
	}

	/** @returns {HTMLElement|null} Lazily-created departure vessel. */
	ensureOverlay() {
		if (this.overlay?.isConnected) return this.overlay;
		if (!this.document?.createElement || !this.document?.body) return null;
		const overlay = this.document.createElement("div");
		overlay.className = "torah-departure";
		overlay.setAttribute("role", "status");
		overlay.setAttribute("aria-live", "polite");
		overlay.setAttribute("aria-atomic", "true");
		overlay.innerHTML = '<div class="torah-departure__portal" aria-hidden="true"><span>ת</span></div><div class="torah-departure__copy"><strong>Entering the Beis Midrash</strong><small>Opening Torah</small></div>';
		this.document.body.append(overlay);
		this.overlay = overlay;
		return overlay;
	}

	/** Bound stale visual state without making any claim about navigation success or failure. */
	scheduleReset() {
		const clearTimer = this.view?.clearTimeout?.bind(this.view) || globalThis.clearTimeout;
		const setTimer = this.view?.setTimeout?.bind(this.view) || globalThis.setTimeout;
		if (this.resetTimer) clearTimer(this.resetTimer);
		this.resetTimer = setTimer(() => this.reset(), STALE_RESET_MS);
	}

	/** Restore the homepage after BFCache return or a navigation that did not replace the page. */
	reset() {
		const clearTimer = this.view?.clearTimeout?.bind(this.view) || globalThis.clearTimeout;
		if (this.resetTimer) clearTimer(this.resetTimer);
		this.resetTimer = null;
		this.document?.body?.removeAttribute?.("data-torah-departing");
		this.overlay?.remove?.();
		this.overlay = null;
		this.isDeparting = false;
	}

	handlePageShow() {
		this.reset();
	}

	/** @returns {{connected:boolean,departing:boolean}} Immutable departure snapshot. */
	snapshot() {
		return Object.freeze({ connected: this.isConnected, departing: this.isDeparting });
	}
}
