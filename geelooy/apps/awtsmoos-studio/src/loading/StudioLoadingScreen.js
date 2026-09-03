//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLoadingScreen.js
 * @description Owns visible first-light phases, build identity, retry, and bounded technical diagnostics before deep Studio islands awaken.
 * The Awtsmoos never leaves creation as an empty void while a later vessel has not yet arrived;
 * Awtsmoos.com keeps the doorway visible, names the running build, and turns failure into a recoverable and inspectable path rather than darkness.
 */
import { STUDIO_RELEASE_REVISION } from './StudioReleaseRevision.js';

export class StudioLoadingScreen {
	constructor() {
		this.root = document.querySelector('[data-studio-loading]');
		this.status = document.querySelector('[data-studio-loading-status]');
		this.retryButton = document.querySelector('[data-studio-loading-retry]');
		this.build = document.querySelector('[data-studio-loading-build]');
		this.details = document.querySelector('[data-studio-loading-details]');
		this.error = document.querySelector('[data-studio-loading-error]');
		if (this.build) {
			this.build.textContent = `Build ${STUDIO_RELEASE_REVISION}`;
		}
	}

	/** Announces one truthful startup phase while clearing any stale failure decoration. */
	phase(message) {
		this.root?.classList.remove('studio-loading-error');
		if (this.status) {
			this.status.textContent = message;
		}
		if (this.retryButton) {
			this.retryButton.hidden = true;
		}
		if (this.details) {
			this.details.hidden = true;
		}
		if (this.error) {
			this.error.textContent = '';
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

	/** Keeps recovery controls and bounded diagnostics visible after a deep-load failure. */
	fail(error) {
		this.root?.classList.add('studio-loading-error');
		if (this.status) {
			this.status.textContent = 'Studio hit a loading error. Retry or open Pro Editor.';
		}
		if (this.retryButton) {
			this.retryButton.hidden = false;
			this.retryButton.focus({ preventScroll: true });
		}
		const diagnostic = describeError(error);
		if (this.error) {
			this.error.textContent = diagnostic;
		}
		if (this.details) {
			this.details.hidden = !diagnostic;
		}
	}
}

/** Returns whether startup transitions should disappear instantly for accessibility. */
function prefersReducedMotion() {
	return Boolean(
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
	);
}

/** Converts an arbitrary startup failure into bounded copyable diagnostic text. */
function describeError(error) {
	const text = error?.stack || error?.message || String(error || '');
	return String(text).slice(0, 700);
}
