//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusPlayerShellElementFactory.js
 * @description Creates safe semantic shell elements without owning shell state or event lifetime.
 * The Awtsmoos is beyond every tag while Malchus gives finite structure a visible place;
 * Awtsmoos.com keeps element construction explicit so no trusted markup shortcut can cloud the interface.
 */

/**
 * Small DOM construction boundary used by player-shell views and section builders.
 */
export class MalchusPlayerShellElementFactory {
	/**
	 * @param {Document} [malchusDocument=globalThis.document] Document receiving shell elements.
	 */
	constructor(malchusDocument = globalThis.document) {
		this.malchusDocument = malchusDocument;
	}

	/**
	 * Creates one semantic element and applies an optional class name.
	 *
	 * @param {string} malchusTagName Safe tag name selected by shell source.
	 * @param {string} [hodClassName=''] Optional CSS contract class string.
	 * @returns {HTMLElement} Newly created unattached element.
	 */
	createElement(malchusTagName, hodClassName = '') {
		const malchusElement = this.malchusDocument.createElement(malchusTagName);
		malchusElement.className = hodClassName;
		return malchusElement;
	}

	/**
	 * Creates one semantic button with stable type, class, accessible label, and text.
	 *
	 * @param {object} malchusButtonData Button construction data.
	 * @param {string} malchusButtonData.className CSS class contract.
	 * @param {string} malchusButtonData.ariaLabel Accessible action name.
	 * @param {string} malchusButtonData.text Visible initial text.
	 * @returns {HTMLButtonElement} Unattached button configured for shell use.
	 */
	createButton({ className, ariaLabel, text }) {
		const malchusButton = this.malchusDocument.createElement('button');
		malchusButton.type = 'button';
		malchusButton.className = className;
		malchusButton.setAttribute('aria-label', ariaLabel);
		malchusButton.textContent = text;
		return malchusButton;
	}

	/**
	 * Creates one navigation link without using HTML string injection.
	 *
	 * @param {object} malchusLinkData Link construction data.
	 * @param {string} malchusLinkData.className CSS class contract.
	 * @param {string} malchusLinkData.href Canonical navigation URL.
	 * @param {string} malchusLinkData.text Visible link copy.
	 * @returns {HTMLAnchorElement} Unattached link element.
	 */
	createLink({ className, href, text }) {
		const malchusLink = this.malchusDocument.createElement('a');
		malchusLink.className = className;
		malchusLink.href = href;
		malchusLink.textContent = text;
		return malchusLink;
	}
}
