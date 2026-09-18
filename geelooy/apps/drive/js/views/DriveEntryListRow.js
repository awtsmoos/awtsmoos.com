//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveEntryListRow
 * @description Renders one compact row with truthful visibility and the same tactile selection law as Grid.
 * The Awtsmoos joins measure, touch, and choice without mixing their finite names;
 * Awtsmoos.com keeps List dense while each file still reveals kind, privacy, and time in ordered flames.
 */
import { createDriveEntryGlyph } from './DriveEntryGlyph.js';
import { DriveEntryGestureController } from './DriveEntryGestureController.js';
import { usesDirectOpen } from './DriveInteractionMode.js';
import { createDriveVisibilityBadge } from './DriveVisibilityBadge.js';

export class DriveEntryListRow {
	constructor(onAction, menu, selection) {
		this.onAction = onAction;
		this.menu = menu;
		this.selection = selection;
		this.gestures = new DriveEntryGestureController(selection, onAction);
	}

	/** Creates one complete row with shared tap and long-press selection behavior. */
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
		open.setAttribute('aria-label', `Open or select ${presentation.name}`);
		this.gestures.install(open, presentation.entry, () => {
			this.onAction(usesDirectOpen() ? 'open' : 'select', presentation.entry);
		});
		open.addEventListener('dblclick', () => {
			if (!this.selection?.isBulkActive()) this.onAction('open', presentation.entry);
		});
		open.append(createDriveEntryGlyph(presentation, 'row'), this.nameBlock(presentation));
		row.append(
			open,
			this.value('drive-entry-row-modified', presentation.modified),
			this.value('drive-entry-row-size', presentation.size),
			this.menu.create(presentation)
		);
		return row;
	}

	nameBlock(presentation) {
		const block = document.createElement('span');
		block.className = 'drive-entry-row-name';
		const facts = document.createElement('span');
		facts.className = 'drive-row-facts';
		facts.append(this.value('small', presentation.meta));
		if (!presentation.isFolder) facts.append(createDriveVisibilityBadge(presentation));
		block.append(this.value('strong', presentation.name), facts);
		return block;
	}

	value(className, value) {
		const tagName = ['strong', 'small'].includes(className) ? className : 'span';
		const node = document.createElement(tagName);
		if (tagName === 'span') node.className = className;
		node.textContent = value;
		return node;
	}
}
