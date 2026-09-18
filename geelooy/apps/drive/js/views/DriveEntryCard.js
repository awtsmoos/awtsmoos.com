//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveEntryCard
 * @description Reveals one Drive file as a rich tactile media card while preserving shared gesture law.
 * The Awtsmoos lets one file appear as image, document, or code without multiplying its being;
 * Awtsmoos.com gives preview, metadata, and visibility one card while tap and long press stay clear.
 */
import { createDriveEntryGlyph } from './DriveEntryGlyph.js';
import { DriveEntryGestureController } from './DriveEntryGestureController.js';
import { usesDirectOpen } from './DriveInteractionMode.js';
import { createDriveVisibilityBadge } from './DriveVisibilityBadge.js';

export class DriveEntryCard {
	constructor(onAction, menu, selection) {
		this.onAction = onAction;
		this.menu = menu;
		this.selection = selection;
		this.gestures = new DriveEntryGestureController(selection, onAction);
	}

	/** Creates one rich file card with one primary interaction surface and one More disclosure. */
	create(presentation) {
		const card = document.createElement('article');
		card.className = 'drive-entry-card drive-media-card';
		card.dataset.entryPath = presentation.entry.path;
		card.dataset.entryType = presentation.entry.type;
		card.dataset.entryKind = presentation.kind;
		card.dataset.entryTone = presentation.tone;
		card.setAttribute('aria-selected', 'false');
		card.append(this.openButton(presentation), this.menu.create(presentation));
		return card;
	}

	/** Builds tap/open/select behavior around rich visual and factual copy. */
	openButton(presentation) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'drive-entry-open drive-media-open';
		button.setAttribute('aria-label', `Open or select ${presentation.name}`);
		this.gestures.install(button, presentation.entry, () => {
			this.onAction(usesDirectOpen() ? 'open' : 'select', presentation.entry);
		});
		button.addEventListener('dblclick', () => {
			if (!this.selection?.isBulkActive()) this.onAction('open', presentation.entry);
		});
		const visual = document.createElement('span');
		visual.className = 'drive-card-visual';
		visual.append(createDriveEntryGlyph(presentation));
		const copy = document.createElement('span');
		copy.className = 'drive-card-copy';
		copy.append(
			this.text('strong', 'drive-entry-name', presentation.name),
			this.text('span', 'drive-entry-meta', presentation.meta),
			createDriveVisibilityBadge(presentation)
		);
		button.append(visual, copy);
		return button;
	}

	text(tagName, className, value) {
		const node = document.createElement(tagName);
		node.className = className;
		node.textContent = value;
		return node;
	}
}
