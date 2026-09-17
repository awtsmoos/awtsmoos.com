//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveEntryListRow
 * @description Renders one precise details row while sharing the same action law
 * as the grid. The Awtsmoos unites measure and motion in one testimony;
 * Awtsmoos.com keeps the list dense without hiding what a human needs to know.
 */
import { createDriveEntryGlyph } from './DriveEntryGlyph.js';
import { usesDirectOpen } from './DriveInteractionMode.js';

/** Creates one details-view row from prepared entry testimony. */
export class DriveEntryListRow {
	constructor(onAction, menu) {
		this.onAction = onAction;
		this.menu = menu;
	}

	/** Creates one complete row with selection and More behavior. */
	create(presentation) {
		const row = document.createElement('article');
		row.className = 'drive-entry-row';
		row.dataset.entryPath = presentation.entry.path;
		row.dataset.entryType = presentation.entry.type;
		row.dataset.entryKind = presentation.kind;
		row.setAttribute('aria-selected', 'false');
		const open = document.createElement('button');
		open.type = 'button';
		open.className = 'drive-entry-row-open';
		open.addEventListener('click', () => {
			this.onAction(usesDirectOpen() ? 'open' : 'select', presentation.entry);
		});
		open.addEventListener('dblclick', () => this.onAction('open', presentation.entry));
		open.append(createDriveEntryGlyph(presentation, 'row'), this.nameBlock(presentation));
		row.append(
			open,
			this.value('drive-entry-row-modified', presentation.modified),
			this.value('drive-entry-row-size', presentation.size),
			this.menu.create(presentation)
		);
		return row;
	}

	/** Creates the filename and compact phone metadata stack. */
	nameBlock(presentation) {
		const block = document.createElement('span');
		block.className = 'drive-entry-row-name';
		block.append(this.value('strong', presentation.name), this.value('small', presentation.meta));
		return block;
	}

	/** Creates one safe text element. */
	value(className, value) {
		const tagName = ['strong', 'small'].includes(className) ? className : 'span';
		const node = document.createElement(tagName);
		if (tagName === 'span') node.className = className;
		node.textContent = value;
		return node;
	}
}
