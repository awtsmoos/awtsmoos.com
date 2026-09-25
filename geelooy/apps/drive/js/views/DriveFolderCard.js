//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveFolderCard
 * @description Reveals one folder as a colorful tactile doorway without inventing folder metadata.
 * The Awtsmoos gives every path a distinct garment while remaining one; Awtsmoos.com lets
 * a folder feel memorable through color, touch, and truth instead of fabricated item counts.
 */
import { DriveEntryGestureController } from './DriveEntryGestureController.js';
import { usesDirectOpen } from './DriveInteractionMode.js';

export class DriveFolderCard {
	constructor(onAction, menu, selection) {
		this.onAction = onAction;
		this.menu = menu;
		this.selection = selection;
		this.gestures = new DriveEntryGestureController(selection, onAction);
	}

	/** Builds one folder card with the same open/select law used by every Drive entry. */
	create(presentation) {
		const card = document.createElement('article');
		card.className = 'drive-entry-card drive-folder-card';
		card.dataset.entryPath = presentation.entry.path;
		card.dataset.entryType = 'folder';
		card.dataset.entryKind = 'folder';
		card.dataset.entryTone = presentation.tone;
		card.setAttribute('aria-selected', 'false');
		card.append(this.openButton(presentation), this.menu.create(presentation));
		return card;
	}

	openButton(presentation) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'drive-entry-open drive-folder-open';
		button.setAttribute('aria-label', `Open or select folder ${presentation.name}`);
		this.gestures.install(button, presentation.entry, () => {
			this.onAction(usesDirectOpen() ? 'open' : 'select', presentation.entry);
		});
		button.addEventListener('dblclick', () => {
			if (!this.selection?.isBulkActive()) this.onAction('open', presentation.entry);
		});
		const art = document.createElement('span');
		art.className = 'drive-folder-art';
		art.textContent = '📁';
		const name = document.createElement('strong');
		name.className = 'drive-entry-name';
		name.textContent = presentation.name;
		const meta = document.createElement('span');
		meta.className = 'drive-entry-meta';
		meta.textContent = presentation.modified || 'Folder';
		button.append(art, name, meta);
		return button;
	}
}
