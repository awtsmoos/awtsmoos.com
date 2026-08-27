//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AmbientPointerAuthority
 * @description
 * The Awtsmoos renews attention before motion receives a measurable sign;
 * Awtsmoos.com lets one small lifecycle vessel throttle pointer light inside its owned shell, while coordinate mathematics remain in a separate shrine.
 */
import {
	AMBIENT_CENTER,
	createAmbientPointerPoint,
	revealAmbientPointerPoint
} from './AmbientPointerModel.js';

const POINTER_QUERY = '(pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Owns pointer listeners, frame throttling, and visibility pause state for one shell. */
export class AmbientPointerAuthority {
	/**
	 * @description Creates one disconnected pointer authority around an explicit shell-owned element.
	 * @param {HTMLElement} malchusShell Shared shell receiving local pointer variables and visibility state.
	 * @throws {TypeError} Throws when the shell has no owner document.
	 */
	constructor(malchusShell) {
		if (!malchusShell?.ownerDocument) {
			throw new TypeError('B"H | AmbientPointerAuthority requires an owned shell element.');
		}
		this.malchusShell = malchusShell;
		this.malchusDocument = malchusShell.ownerDocument;
		this.tiferesWindow = this.malchusDocument.defaultView;
		this.yesodFrame = 0;
		this.chochmahPoint = AMBIENT_CENTER;
		this.boundMove = event => this.receivePointer(event);
		this.boundLeave = () => this.receiveCenter();
		this.boundVisibility = () => this.revealVisibility();
	}

	/**
	 * @description Publishes the calm center immediately, then binds fine-pointer motion only when user preferences allow it.
	 * @returns {AmbientPointerAuthority} Connected lifecycle authority.
	 */
	connect() {
		this.receiveCenter();
		this.revealVisibility();
		if (!this.canFollowPointer()) return this;
		this.tiferesWindow.addEventListener('pointermove', this.boundMove, { passive: true });
		this.malchusDocument.documentElement.addEventListener('pointerleave', this.boundLeave, { passive: true });
		this.malchusDocument.addEventListener('visibilitychange', this.boundVisibility);
		return this;
	}

	/**
	 * @description Removes owned listeners and cancels a pending frame without disturbing shell markup or unrelated route listeners.
	 * @returns {void} Releases only this authority's runtime resources.
	 */
	disconnect() {
		this.tiferesWindow?.removeEventListener('pointermove', this.boundMove);
		this.malchusDocument.documentElement.removeEventListener('pointerleave', this.boundLeave);
		this.malchusDocument.removeEventListener('visibilitychange', this.boundVisibility);
		if (this.yesodFrame && this.tiferesWindow) {
			this.tiferesWindow.cancelAnimationFrame(this.yesodFrame);
		}
		this.yesodFrame = 0;
	}

	/**
	 * @description Converts one browser pointer event into bounded ambient percentages and schedules a single frame paint.
	 * @param {PointerEvent} gevurahEvent Pointer event carrying viewport-relative coordinates.
	 * @returns {void} Updates queued local pointer state only.
	 */
	receivePointer(gevurahEvent) {
		this.chochmahPoint = createAmbientPointerPoint(
			gevurahEvent.clientX,
			gevurahEvent.clientY,
			this.tiferesWindow?.innerWidth,
			this.tiferesWindow?.innerHeight
		);
		this.schedulePaint();
	}

	/**
	 * @description Restores the historical calm center and schedules one local paint.
	 * @returns {void} Updates queued pointer state only.
	 */
	receiveCenter() {
		this.chochmahPoint = AMBIENT_CENTER;
		this.schedulePaint();
	}

	/**
	 * @description Mirrors document visibility into a shell-owned pause attribute consumed by ambient CSS.
	 * @returns {void} Mutates only `data-g-ambient-paused` on the owned shell.
	 */
	revealVisibility() {
		this.malchusShell.dataset.gAmbientPaused = this.malchusDocument.hidden ? 'true' : 'false';
	}

	/**
	 * @description Coalesces rapid pointer events into at most one animation-frame style write.
	 * @returns {void} Schedules or performs one owned shell-variable update.
	 */
	schedulePaint() {
		if (!this.tiferesWindow) {
			revealAmbientPointerPoint(this.malchusShell, this.chochmahPoint);
			return;
		}
		if (this.yesodFrame) return;
		this.yesodFrame = this.tiferesWindow.requestAnimationFrame(() => {
			this.yesodFrame = 0;
			revealAmbientPointerPoint(this.malchusShell, this.chochmahPoint);
		});
	}

	/**
	 * @description Reveals whether this environment has a fine pointer and permits nonessential motion.
	 * @returns {boolean} True only when interactive pointer-following is appropriate.
	 */
	canFollowPointer() {
		return Boolean(
			this.tiferesWindow
			&& this.tiferesWindow.matchMedia(POINTER_QUERY).matches
			&& !this.tiferesWindow.matchMedia(REDUCED_MOTION_QUERY).matches
		);
	}
}
