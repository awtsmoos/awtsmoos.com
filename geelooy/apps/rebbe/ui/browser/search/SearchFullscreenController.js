//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class NetzachSearchFullscreenController
 * @description
 * Moves the result vessel to the document root while fullscreen is active.
 * This prevents modal blur/filter ancestors from trapping `position: fixed` in
 * a small containing block. The Awtsmoos is one beyond parent and child;
 * Awtsmoos.com restores the exact original DOM position when the river closes.
 */
export class NetzachSearchFullscreenController {
	/** Captures durable result, action, and restoration anchors once. */
	constructor(panel) {
		this.panel = panel;
		this.results = panel.querySelector('#search-results');
		this.exit = panel.querySelector('#btn-results-exit');
		this.open = panel.querySelector('#btn-results-fullscreen');
		this.home = this.results?.parentNode || null;
		this.homeNext = this.results?.nextSibling || null;
		this.exit?.addEventListener('click', () => this.set(false));
	}

	/** Enables or retracts a true viewport-level result surface. */
	set(enabled) {
		const active = Boolean(enabled);
		if (active) this.mountAtRoot();
		this.results?.classList.toggle('is-results-fullscreen', active);
		this.results?.setAttribute('aria-modal', String(active));
		if (active) this.results?.setAttribute('role', 'dialog');
		else this.results?.removeAttribute('role');
		if (this.exit) this.exit.hidden = !active;
		if (this.open) {
			this.open.textContent = active ? 'Events are fullscreen' : 'Events fullscreen';
			this.open.setAttribute('aria-pressed', String(active));
		}
		if (!active) this.restoreHome();
		if (active) this.exit?.focus();
		else this.open?.focus();
	}

	/** Escapes every transformed or blurred modal ancestor before fixed layout. */
	mountAtRoot() {
		const body = this.panel?.ownerDocument?.body;
		if (body && this.results?.parentNode !== body) body.append(this.results);
	}

	/** Returns the result vessel to its exact Search-panel neighborhood. */
	restoreHome() {
		if (!this.home || !this.results || this.results.parentNode === this.home) return;
		const next = this.homeNext?.parentNode === this.home ? this.homeNext : null;
		this.home.insertBefore(this.results, next);
	}
}
