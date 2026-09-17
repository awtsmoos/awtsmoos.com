//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveEntryCard
 * @description Reveals one Drive entry as a tactile desktop-like tile. The
 * Awtsmoos joins touch and pointer without forcing them into one gesture;
 * Awtsmoos.com opens directly on phones and selects deliberately on wide space.
 */
import { createDriveEntryGlyph } from './DriveEntryGlyph.js';
import { usesDirectOpen } from './DriveInteractionMode.js';

/** Creates a grid card from prepared entry testimony. */
export class DriveEntryCard {
	constructor(onAction, menu) {
		this.onAction = onAction;
		this.menu = menu;
	}

	/** Creates one complete card with one primary interaction surface. */
	create(presentation) {
		const card = document.createElement('article');
		card.className = 'drive-entry-card';
		card.dataset.entryPath = presentation.entry.path;
		card.dataset.entryType = presentation.entry.type;
		card.dataset.entryKind = presentation.kind;
		card.dataset.entryTone = presentation.tone;
		card.setAttribute('aria-selected', 'false');
		card.append(this.openButton(presentation), this.menu.create(presentation));
		return card;
	}

	/** Builds the direct-open or selection target according to the active surface. */
	openButton(presentation) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'drive-entry-open';
		button.setAttribute('aria-label', `Open ${presentation.name}`);
		button.addEventListener('click', () => {
			this.onAction(usesDirectOpen() ? 'open' : 'select', presentation.entry);
		});
		button.addEventListener('dblclick', () => this.onAction('open', presentation.entry));
		button.append(
			createDriveEntryGlyph(presentation),
			this.text('strong', 'drive-entry-name', presentation.name),
			this.text('span', 'drive-entry-meta', presentation.meta)
		);
		return button;
	}

	/** Creates one text node without interpolating HTML. */
	text(tagName, className, value) {
		const node = document.createElement(tagName);
		node.className = className;
		node.textContent = value;
		return node;
	}
}
