//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveEntryMenu
 * @description Owns one readable action vocabulary that becomes desktop popover or phone sheet.
 * The Awtsmoos hides power until desire gives it a purposeful door;
 * Awtsmoos.com keeps More quiet, then reveals selection and filesystem verbs worth reading.
 */
import { createDriveEntryGlyph } from './DriveEntryGlyph.js';
import { usesDirectOpen } from './DriveInteractionMode.js';

const LABELS = {
	open: '↗ Open',
	'toggle-select': '✓ Select item',
	details: 'ⓘ File details',
	download: '⤓ Download',
	link: '🔗 Copy public link',
	public: '🌐 Make public',
	rename: '✎ Rename',
	move: '📁 Move',
	copy: '⧉ Make a copy',
	trash: '🗑 Move to trash',
	restore: '↶ Restore',
	purge: '🗑 Delete forever'
};

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
		popover.append(this.header(presentation, details));
		for (const action of this.actions(entry)) {
			popover.append(this.actionButton(action, entry, details));
		}
		details.append(trigger, popover);
		return details;
	}

	/** Gives the mobile sheet a stable glyph, file testimony, and Close affordance. */
	header(presentation, details) {
		const wrap = document.createElement('div');
		wrap.className = 'drive-entry-menu-summary';
		const text = document.createElement('span');
		text.className = 'drive-entry-menu-testimony';
		const name = document.createElement('strong');
		name.textContent = presentation.name;
		const meta = document.createElement('small');
		meta.textContent = presentation.meta;
		text.append(name, meta);
		wrap.append(createDriveEntryGlyph(presentation, 'row'), text, this.closeButton(details));
		return wrap;
	}

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
		if (entry.trashedAt) return ['toggle-select', 'restore', 'purge'];
		const actions = ['open', 'toggle-select', 'details'];
		if (entry.type === 'file') {
			actions.push('download', entry.visibility === 'public' ? 'link' : 'public');
		}
		actions.push('rename', 'move', 'copy', 'trash');
		return actions;
	}

	actionButton(action, entry, details) {
		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.entryAction = action;
		button.className = ['trash', 'purge'].includes(action) ? 'is-danger' : '';
		button.textContent = LABELS[action] || action;
		button.addEventListener('click', event => {
			event.stopPropagation();
			details.open = false;
			this.onAction(action, entry);
		});
		return button;
	}
}
