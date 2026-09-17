//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveViewModeController
 * @description Remembers presentation separately for wide explorer and compact phone contexts.
 * The Awtsmoos is one beneath changing width while each vessel receives the form it needs;
 * Awtsmoos.com lets desktop remember power and mobile remember home without confusing their deeds.
 */
const STORAGE_ROOT = 'awtsmoos.drive.view';
const MODES = new Set(['home', 'grid', 'list']);
const COMPACT_QUERY = '(max-width: 760px)';

export class DriveViewModeController {
	/** @param {Function} rerender Repaints current entries without another API request. */
	constructor(rerender) {
		this.rerender = rerender;
		this.media = window.matchMedia(COMPACT_QUERY);
	}

	/** Installs view controls and responds when the responsive context changes. */
	install() {
		for (const mode of MODES) {
			document.querySelector(`#view-${mode}`)?.addEventListener('click', () => this.set(mode));
		}
		this.media.addEventListener?.('change', () => {
			this.apply(this.remembered());
			this.rerender?.();
		});
		this.apply(this.remembered());
	}

	/** Changes only the active responsive context's preference. */
	set(mode) {
		const safeMode = MODES.has(mode) ? mode : 'home';
		localStorage.setItem(this.storageKey(), safeMode);
		this.apply(safeMode);
		this.rerender?.();
	}

	/** Applies one mode to the document and view-toggle accessibility state. */
	apply(mode) {
		document.body.dataset.driveView = mode;
		for (const candidate of MODES) {
			const button = document.querySelector(`#view-${candidate}`);
			if (button) button.setAttribute('aria-pressed', String(candidate === mode));
		}
	}

	/** Returns the active context's preference or the files-first Home default. */
	remembered() {
		const value = localStorage.getItem(this.storageKey());
		return MODES.has(value) ? value : 'home';
	}

	/** Keeps phone and desktop memories independent while sharing one controller. */
	storageKey() {
		return `${STORAGE_ROOT}.${this.media.matches ? 'compact' : 'wide'}`;
	}
}
