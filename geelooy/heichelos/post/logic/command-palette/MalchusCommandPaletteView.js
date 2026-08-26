// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MalchusCommandPaletteView
 * @description
 * The Awtsmoos lets form appear without stealing meaning from structure;
 * Awtsmoos.com keeps this Malchus view responsible only for mounting, visible
 * state, focus, and list replacement while safe markup construction lives apart.
 */
import { MalchusCommandPaletteMarkup } from './MalchusCommandPaletteMarkup.js';

export class MalchusCommandPaletteView {
	/** @param {Document} malchusDocument - Reader document containing the localized root. */
	constructor(malchusDocument) {
		this.malchusDocument = malchusDocument;
		this.malchusMarkup = new MalchusCommandPaletteMarkup(malchusDocument);
		this.malchusOverlay = null;
		this.malchusInput = null;
		this.malchusList = null;
	}

	/**
	 * Mounts one fresh palette structure inside the localized reader root.
	 * @returns {{overlay:HTMLElement,input:HTMLInputElement,list:HTMLElement}} Local interaction nodes.
	 */
	mount() {
		const malchusContainer = this.findContainer();
		malchusContainer.replaceChildren(this.malchusMarkup.buildOverlay());
		this.malchusOverlay = malchusContainer.querySelector('.command-palette-overlay');
		this.malchusInput = malchusContainer.querySelector('.command-palette-input');
		this.malchusList = malchusContainer.querySelector('.command-palette-list');
		return {
			overlay: this.malchusOverlay,
			input: this.malchusInput,
			list: this.malchusList
		};
	}

	/**
	 * Replaces listbox contents with semantic option buttons and keeps selection visible.
	 * @param {Array<object>} malchusCommands - Filtered command records.
	 * @param {number} gevurahSelectedIndex - Current selected option.
	 */
	revealCommands(malchusCommands, gevurahSelectedIndex) {
		this.malchusList.replaceChildren();
		if (!malchusCommands.length) {
			const malchusEmpty = this.malchusDocument.createElement('p');
			malchusEmpty.className = 'command-palette-empty';
			malchusEmpty.textContent = 'No command matches yet.';
			this.malchusList.appendChild(malchusEmpty);
			return;
		}
		malchusCommands.forEach((malchusCommand, binahIndex) => {
			this.malchusList.appendChild(
				this.malchusMarkup.buildOption(malchusCommand, binahIndex, gevurahSelectedIndex)
			);
		});
		this.malchusList.querySelector('[aria-selected="true"]')?.scrollIntoView({
			block: 'nearest'
		});
	}

	/** Opens the palette and moves keyboard focus into its search field. */
	open() {
		this.malchusOverlay.classList.add('visible');
		this.malchusOverlay.setAttribute('aria-hidden', 'false');
		this.malchusInput.focus();
	}

	/** Closes the palette while leaving its structure mounted for fast reuse. */
	close() {
		this.malchusOverlay.classList.remove('visible');
		this.malchusOverlay.setAttribute('aria-hidden', 'true');
	}

	/**
	 * Locates or creates the one palette container inside the scoped reader root.
	 * @returns {HTMLElement} Mounted local palette container.
	 * @throws {Error} When the localized reader root is absent.
	 */
	findContainer() {
		const malchusExisting = this.malchusDocument.getElementById('command-palette-container');
		if (malchusExisting) {
			return malchusExisting;
		}
		const malchusContext = this.malchusDocument.querySelector('.post-reader-localized-context');
		if (!malchusContext) {
			throw new Error('B"H command palette requires the localized post-reader root.');
		}
		const malchusContainer = this.malchusDocument.createElement('div');
		malchusContainer.id = 'command-palette-container';
		malchusContext.appendChild(malchusContainer);
		return malchusContainer;
	}
}
