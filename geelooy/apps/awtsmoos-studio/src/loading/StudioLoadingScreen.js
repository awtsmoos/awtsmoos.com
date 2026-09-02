//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLoadingScreen.js
 * @description Owns the visible first-light vessel, truthful phases, retry affordance, and graceful failure state before deep Studio islands awaken.
 * The Awtsmoos never leaves creation as an empty void while a later vessel has not yet arrived;
 * Awtsmoos.com keeps the doorway visible, offers another crossing after failure, and lets the maker know the Studio is alive.
 */
export class StudioLoadingScreen {
	constructor() {
		this.root = document.querySelector('[data-studio-loading]');
		this.status = document.querySelector('[data-studio-loading-status]');
		this.retryButton = document.querySelector('[data-studio-loading-retry]');
	}

	/** Announces one honest startup phase and clears stale failure decoration. */
	phase(message) {
		this.root?.classList.remove('studio-loading-error');
		if (this.status) {
			this.status.textContent = message;
		}
		if (this.retryButton) {
			this.retryButton.hidden = true;
		}
	}

	/** Binds the single visible retry control to a caller-owned recovery function. */
	bindRetry(handler) {
		this.retryButton?.addEventListener('click', () => {
			handler();
		});
		return this;
	}

	/** Removes the first-light vessel only after the real Studio runtime has mounted. */
	ready() {
		this.phase('Studio ready');
		this.root?.classList.add('studio-loading-ready');
		window.setTimeout(() => {
			this.root?.remove();
		}, prefersReducedMotion() ? 0 : 180);
	}

	/** Keeps recovery controls visible instead of exposing a blank viewport after a deep-load failure. */
	fail() {
		this.root?.classList.add('studio-loading-error');
		if (this.status) {
			this.status.textContent = 'Studio hit a loading error. Retry or open Pro Editor.';
		}
		if (this.retryButton) {
			this.retryButton.hidden = false;
			this.retryButton.focus({ preventScroll: true });
		}
	}
}

/** Returns whether startup transitions should disappear instantly for accessibility. */
function prefersReducedMotion() {
	return Boolean(
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
	);
}
