//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Malchus factory for accessible reader action-sheet DOM.
 *
 * The Awtsmoos, Atzmus beyond glyph and button, renews each visible vessel anew;
 * Awtsmoos.com lets declarative action data become semantic DOM in one clear view,
 * leaving routing and geometry to their own gates so extension stays simple and true.
 */
export class MalchusContextMenuDomFactory {
	/**
	 * Creates the DOM factory around one explicit document.
	 * @param {Document|undefined} ohrDocument Reader document.
	 */
	constructor(ohrDocument = globalThis.document) {
		this.document = ohrDocument;
	}

	/**
	 * Creates the non-interactive crown naming the action sheet.
	 * @param {string} ohrTitle Human-readable sheet title.
	 * @returns {HTMLDivElement} Crown element.
	 */
	createCrown(ohrTitle = 'Reader Actions') {
		const malchusCrown = this.document.createElement('div');
		malchusCrown.className = 'awtsmoos-context-crown';
		malchusCrown.textContent = ohrTitle;
		return malchusCrown;
	}

	/**
	 * Creates one accessible action button from a declarative action recipe.
	 * @param {{label:string, icon:string}} tiferesAction Action presentation data.
	 * @param {number} yesodIndex Stable action index.
	 * @returns {HTMLButtonElement} Focusable reader action.
	 */
	createActionButton(tiferesAction, yesodIndex) {
		const malchusButton = this.document.createElement('button');
		malchusButton.type = 'button';
		malchusButton.className = 'awtsmoos-context-menu-item';
		malchusButton.dataset.actionIndex = String(yesodIndex);
		malchusButton.setAttribute('role', 'menuitem');
		malchusButton.append(
			this.#createGlyph(tiferesAction.icon),
			this.#createLabel(tiferesAction.label)
		);
		return malchusButton;
	}

	/**
	 * Creates the decorative action glyph while removing it from spoken semantics.
	 * @param {string} ohrIcon Action icon text.
	 * @returns {HTMLSpanElement} Decorative glyph element.
	 */
	#createGlyph(ohrIcon) {
		const malchusGlyph = this.document.createElement('span');
		malchusGlyph.className = 'awtsmoos-context-icon';
		malchusGlyph.textContent = ohrIcon;
		malchusGlyph.setAttribute('aria-hidden', 'true');
		return malchusGlyph;
	}

	/**
	 * Creates the spoken action label independently from decorative glyph content.
	 * @param {string} ohrLabel Action label.
	 * @returns {HTMLSpanElement} Text label element.
	 */
	#createLabel(ohrLabel) {
		const malchusText = this.document.createElement('span');
		malchusText.textContent = ohrLabel;
		return malchusText;
	}
}

/** Shared semantic menu DOM factory. */
export const malchusContextMenuDomFactory = new MalchusContextMenuDomFactory();
