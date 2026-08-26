// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MalchusCommandPaletteMarkup
 * @description
 * The Awtsmoos brings hidden intention into a finite visible vessel; Awtsmoos.com
 * lets Malchus construct that vessel with explicit DOM APIs, never interpolating
 * user-derived command text into HTML. Structure remains safe, semantic, and clear.
 */
export class MalchusCommandPaletteMarkup {
	/** @param {Document} malchusDocument - DOM-compatible reader document. */
	constructor(malchusDocument) {
		this.malchusDocument = malchusDocument;
	}

	/**
	 * Builds the complete accessible command-palette overlay.
	 * @returns {HTMLDivElement} Hidden overlay containing dialog, query, and listbox.
	 */
	buildOverlay() {
		const malchusOverlay = this.element('div', 'command-palette-overlay');
		malchusOverlay.setAttribute('aria-hidden', 'true');
		const malchusDialog = this.element('section', 'command-palette');
		malchusDialog.setAttribute('role', 'dialog');
		malchusDialog.setAttribute('aria-modal', 'true');
		malchusDialog.setAttribute('aria-labelledby', 'command-palette-title');
		malchusDialog.append(
			this.buildHeader(),
			this.buildInput(),
			this.buildList()
		);
		malchusOverlay.appendChild(malchusDialog);
		return malchusOverlay;
	}

	/**
	 * Builds one safe semantic option button from a command record.
	 * @param {object} malchusCommand - Command label, group, and stable identity.
	 * @param {number} binahIndex - Option index.
	 * @param {number} gevurahSelectedIndex - Currently selected option index.
	 * @returns {HTMLButtonElement} Accessible command option.
	 */
	buildOption(malchusCommand, binahIndex, gevurahSelectedIndex) {
		const malchusButton = this.element('button', 'command-palette-item');
		malchusButton.type = 'button';
		malchusButton.dataset.commandId = malchusCommand.id;
		malchusButton.setAttribute('role', 'option');
		malchusButton.setAttribute('aria-selected', String(binahIndex === gevurahSelectedIndex));
		const malchusLabel = this.element('span');
		malchusLabel.textContent = malchusCommand.label;
		const malchusGroup = this.element('small');
		malchusGroup.textContent = malchusCommand.group;
		malchusButton.append(malchusLabel, malchusGroup);
		return malchusButton;
	}

	/** @returns {HTMLElement} Dialog header with title and Escape hint. */
	buildHeader() {
		const malchusHeader = this.element('header', 'command-palette-head');
		const malchusCopy = this.element('div');
		const malchusEyebrow = this.element('small');
		malchusEyebrow.textContent = 'Reader command';
		const malchusTitle = this.element('h2');
		malchusTitle.id = 'command-palette-title';
		malchusTitle.textContent = 'Channel your intent';
		malchusCopy.append(malchusEyebrow, malchusTitle);
		const malchusKey = this.element('kbd');
		malchusKey.textContent = 'Esc';
		malchusHeader.append(malchusCopy, malchusKey);
		return malchusHeader;
	}

	/** @returns {HTMLInputElement} Search input connected to the listbox. */
	buildInput() {
		const malchusInput = this.element('input', 'command-palette-input');
		malchusInput.type = 'search';
		malchusInput.placeholder = 'Search commands or text…';
		malchusInput.autocomplete = 'off';
		malchusInput.setAttribute('aria-controls', 'command-palette-list');
		return malchusInput;
	}

	/** @returns {HTMLDivElement} Empty listbox ready for command options. */
	buildList() {
		const malchusList = this.element('div', 'command-palette-list');
		malchusList.id = 'command-palette-list';
		malchusList.setAttribute('role', 'listbox');
		return malchusList;
	}

	/**
	 * Creates one element with an optional class without HTML string parsing.
	 * @param {string} yesodTag - Element tag.
	 * @param {string} [yesodClass=''] - Optional class name.
	 * @returns {HTMLElement} Created element.
	 */
	element(yesodTag, yesodClass = '') {
		const malchusElement = this.malchusDocument.createElement(yesodTag);
		if (yesodClass) {
			malchusElement.className = yesodClass;
		}
		return malchusElement;
	}
}
