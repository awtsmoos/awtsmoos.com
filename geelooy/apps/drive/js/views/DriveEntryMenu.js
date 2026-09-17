//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveEntryMenu
 * @description Owns one action vocabulary that becomes popover or bottom sheet.
 * The Awtsmoos hides power until desire gives it a purposeful door;
 * Awtsmoos.com keeps the file surface calm, then reveals precisely more.
 */
import { createDriveEntryGlyph } from './DriveEntryGlyph.js';
import { usesDirectOpen } from './DriveInteractionMode.js';

export class DriveEntryMenu {
	constructor(onAction) {
		this.onAction = onAction;
	}

	/** Builds one accessible More disclosure from prepared entry testimony. */
	create(presentation) {
		const { entry, name } = presentation;
		const details = document.createElement('details');
		details.className = 'drive-entry-menu';
		details.addEventListener('toggle', () => {
			if (details.open && !usesDirectOpen()) this.onAction('select', entry);
		});
		const trigger = document.createElement('summary');
		trigger.className = 'drive-entry-menu-trigger';
		trigger.textContent = '•••';
		trigger.setAttribute('aria-label', `More actions for ${name}`);
		const popover = document.createElement('div');
		popover.className = 'drive-entry-menu-popover';
		popover.append(this.summary(presentation), this.closeButton(details));
		for (const action of this.actions(entry)) {
			popover.append(this.actionButton(action, entry, details));
		}
		details.append(trigger, popover);
		return details;
	}

	/** Gives the mobile sheet enough context without inflating every base row. */
	summary(presentation) {
		const wrap = document.createElement('div');
		wrap.className = 'drive-entry-menu-summary';
		const text = document.createElement('span');
		const name = document.createElement('strong');
		name.textContent = presentation.name;
		const meta = document.createElement('small');
		meta.textContent = presentation.meta;
		text.append(name, meta);
		wrap.append(createDriveEntryGlyph(presentation, 'row'), text);
		return wrap;
	}

	/** Adds a phone-sheet close affordance without changing desktop menu semantics. */
	closeButton(details) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'drive-entry-menu-close';
		button.textContent = 'Close';
		button.addEventListener('click', () => {
			details.open = false;
		});
		return button;
	}

	actions(entry) {
		if (entry.trashedAt) return ['restore', 'purge'];
		const actions = ['open', 'details'];
		if (entry.type === 'file') actions.push(entry.visibility === 'public' ? 'link' : 'public');
		actions.push('rename', 'move', 'copy', 'trash');
		return actions;
	}

	actionButton(action, entry, details) {
		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.entryAction = action;
		button.className = ['trash', 'purge'].includes(action) ? 'is-danger' : '';
		button.textContent = this.label(action);
		button.addEventListener('click', event => {
			event.stopPropagation();
			details.open = false;
			this.onAction(action, entry);
		});
		return button;
	}

	label(action) {
		return ({ open: 'Open', details: 'File details', link: 'Copy public link', public: 'Make public', rename: 'Rename', move: 'Move', copy: 'Make a copy', trash: 'Move to trash', restore: 'Restore', purge: 'Delete forever' })[action] || action;
	}
}
