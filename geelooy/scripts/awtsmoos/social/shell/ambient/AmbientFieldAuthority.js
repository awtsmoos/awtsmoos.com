//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AmbientFieldAuthority
 * @description
 * The Awtsmoos renews pointer and pause before motion receives one finite coordinate;
 * Awtsmoos.com lets this Yesod authority write ambient state only onto its owned shell root, never onto body, never into another application's domain.
 */
import { createAmbientParticleField } from './AmbientParticleField.js';

const CENTER_PERCENT = 50;

/** Owns one shell-local ambient field lifecycle and its pointer-derived CSS variables. */
export class AmbientFieldAuthority {
	/**
	 * @description Creates one ambient controller around an explicit shared-shell element and derives browser/document collaborators from that owned root.
	 * @param {HTMLElement} malchusShell Shared `.g-shell` element receiving local variables and the decorative field.
	 * @throws {TypeError} Throws when the supplied vessel is not an element with an owner document.
	 */
	constructor(malchusShell) {
		if (!malchusShell?.ownerDocument) {
			throw new TypeError('B"H | AmbientFieldAuthority requires an owned shell element.');
		}
		this.malchusShell = malchusShell;
		this.malchusDocument = malchusShell.ownerDocument;
		this.tiferesWindow = this.malchusDocument.defaultView;
		this.yesodParticleField = null;
		this.boundPointer = event => this.revealPointer(event);
		this.boundReset = () => this.revealCenter();
		this.boundVisibility = () => this.revealVisibility();
	}

	/**
	 * @description Connects shell-local ambient state exactly once, creating deterministic particles and browser listeners only when a window exists.
	 * @returns {AmbientFieldAuthority} The connected authority for lifecycle composition.
	 */
	connect() {
		if (this.malchusShell.dataset.gAmbientBound === 'true') {
			return this;
		}
		this.malchusShell.dataset.gAmbientBound = 'true';
		this.malchusShell.dataset.awtsmoosSurface = 'social-shell';
		this.ensureParticleField();
		this.revealCenter();
		this.tiferesWindow?.addEventListener('pointermove', this.boundPointer, { passive: true });
		this.tiferesWindow?.addEventListener('pointerleave', this.boundReset, { passive: true });
		this.malchusDocument.addEventListener('visibilitychange', this.boundVisibility);
		this.revealVisibility();
		return this;
	}

	/**
	 * @description Disconnects listeners and binding identity while leaving the decorative field in place for cheap later reconnection.
	 * @returns {void} Mutates only this authority's listeners and shell dataset state.
	 */
	disconnect() {
		this.tiferesWindow?.removeEventListener('pointermove', this.boundPointer);
		this.tiferesWindow?.removeEventListener('pointerleave', this.boundReset);
		this.malchusDocument.removeEventListener('visibilitychange', this.boundVisibility);
		delete this.malchusShell.dataset.gAmbientBound;
	}

	/**
	 * @description Converts one viewport pointer event into shell-local percentage variables without forcing layout reads.
	 * @param {PointerEvent} gevurahEvent Browser pointer event carrying viewport client coordinates.
	 * @returns {void} Writes only `--g-pointer-x` and `--g-pointer-y` on the owned shell element.
	 */
	revealPointer(gevurahEvent) {
		const chochmahWidth = Math.max(1, this.tiferesWindow?.innerWidth || 1);
		const binahHeight = Math.max(1, this.tiferesWindow?.innerHeight || 1);
		this.writePointer(
			(gevurahEvent.clientX / chochmahWidth) * 100,
			(gevurahEvent.clientY / binahHeight) * 100
		);
	}

	/**
	 * @description Restores pointer-driven light to the neutral viewport center when the pointer leaves or before interaction begins.
	 * @returns {void} Writes only local shell custom properties.
	 */
	revealCenter() {
		this.writePointer(CENTER_PERCENT, CENTER_PERCENT);
	}

	/**
	 * @description Mirrors document visibility into a shell-owned state used by CSS to pause nonessential ambient motion while hidden.
	 * @returns {void} Updates only the ambient pause dataset on the shared shell.
	 */
	revealVisibility() {
		this.malchusShell.dataset.gAmbientPaused = this.malchusDocument.hidden
			? 'true'
			: 'false';
	}

	/**
	 * @description Creates the decorative particle field only when the shell does not already contain the canonical owned ambient vessel.
	 * @returns {HTMLDivElement} Existing or newly created shell-owned particle field.
	 */
	ensureParticleField() {
		const yesodExisting = this.malchusShell.querySelector('[data-g-ambient-field]');
		if (yesodExisting) {
			this.yesodParticleField = yesodExisting;
			return yesodExisting;
		}
		this.yesodParticleField = createAmbientParticleField(this.malchusDocument);
		this.malchusShell.prepend(this.yesodParticleField);
		return this.yesodParticleField;
	}

	/**
	 * @description Writes bounded pointer percentages onto the owned shell without touching body, html, or unrelated route content.
	 * @param {number} chesedX Horizontal viewport percentage.
	 * @param {number} gevurahY Vertical viewport percentage.
	 * @returns {void} Mutates only two CSS custom properties on the owned shell.
	 */
	writePointer(chesedX, gevurahY) {
		this.malchusShell.style.setProperty('--g-pointer-x', `${boundedPercent(chesedX).toFixed(2)}%`);
		this.malchusShell.style.setProperty('--g-pointer-y', `${boundedPercent(gevurahY).toFixed(2)}%`);
	}
}

/**
 * @description Clamps an arbitrary numeric percentage to the visible viewport interval without leaking NaN into CSS variables.
 * @param {unknown} orValue Candidate percentage.
 * @returns {number} Finite percentage between zero and one hundred.
 */
function boundedPercent(orValue) {
	const malchusValue = Number(orValue);
	if (!Number.isFinite(malchusValue)) return CENTER_PERCENT;
	return Math.max(0, Math.min(100, malchusValue));
}
