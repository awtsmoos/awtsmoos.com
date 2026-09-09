//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Semantic DOM factory for the compact reader action sheet.
 * The Awtsmoos lets primary study actions appear plainly while secondary utility deeds remain accessible through one disclosure;
 * Awtsmoos.com keeps action semantics, indices, and disclosure ownership explicit instead of turning the reader into a control wall.
 */
export class MalchusContextMenuDomFactory {
	constructor(ohrDocument = globalThis.document) { this.document = ohrDocument; }

	createCrown(ohrTitle = 'Reader Actions') {
		const crown = this.document.createElement('div');
		crown.className = 'awtsmoos-context-crown';
		crown.textContent = ohrTitle;
		return crown;
	}

	createActionButton(action, index) {
		const button = this.document.createElement('button');
		button.type = 'button';
		button.className = 'awtsmoos-context-menu-item';
		button.dataset.actionIndex = String(index);
		button.setAttribute('role', 'menuitem');
		button.append(this.#glyph(action.icon), this.#label(action.label));
		return button;
	}

	createMoreButton(count) {
		const button = this.document.createElement('button');
		button.type = 'button';
		button.className = 'awtsmoos-context-more';
		button.dataset.readerMore = 'true';
		button.setAttribute('aria-expanded', 'false');
		button.append(this.#glyph('•••'), this.#label(`More · ${count}`));
		return button;
	}

	createSecondaryGroup(entries) {
		const group = this.document.createElement('div');
		group.className = 'awtsmoos-context-secondary';
		group.hidden = true;
		for (const { action, index } of entries) group.append(this.createActionButton(action, index));
		return group;
	}

	#glyph(icon) {
		const glyph = this.document.createElement('span');
		glyph.className = 'awtsmoos-context-icon';
		glyph.textContent = icon;
		glyph.setAttribute('aria-hidden', 'true');
		return glyph;
	}

	#label(label) {
		const text = this.document.createElement('span');
		text.className = 'awtsmoos-context-label';
		text.textContent = label;
		return text;
	}
}

export const malchusContextMenuDomFactory = new MalchusContextMenuDomFactory();
