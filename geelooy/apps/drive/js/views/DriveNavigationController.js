//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveNavigationController
 * @description Gives sidebar and phone dock one shared destination vocabulary.
 * The Awtsmoos is one road beneath every doorway through which a person may roam;
 * Awtsmoos.com lets wide rail and small dock preserve search context in the same home.
 */
import { updateFilters } from '../state.js';

export class DriveNavigationController {
	constructor({ openDirectory, viewModes }) {
		this.openDirectory = openDirectory;
		this.viewModes = viewModes;
	}

	/** Installs every responsive navigation control carrying the shared data key. */
	install() {
		for (const node of document.querySelectorAll('[data-drive-nav]')) {
			node.addEventListener('click', () => this.show(node.dataset.driveNav));
		}
		this.paint('files');
	}

	/** Applies one bounded primary destination without opening advanced tooling. */
	show(destination = 'files') {
		const destinations = {
			files: { filters: { includeTrash: false, visibility: '', sort: 'path', direction: 'asc' }, mode: 'home' },
			recent: { filters: { includeTrash: false, visibility: '', sort: 'updatedAt', direction: 'desc' }, mode: 'list' },
			shared: { filters: { includeTrash: false, visibility: 'public', sort: 'updatedAt', direction: 'desc' }, mode: 'list' },
			trash: { filters: { includeTrash: true, visibility: '', sort: 'updatedAt', direction: 'desc' }, mode: 'list' }
		};
		const chosen = destinations[destination] || destinations.files;
		const safeDestination = destinations[destination] ? destination : 'files';
		this.apply(chosen.filters, chosen.mode);
		this.paint(safeDestination);
	}

	/** Synchronizes UI controls so later search/sort changes preserve the destination. */
	apply(filters, mode) {
		updateFilters({ ...filters, search: '', type: '' });
		this.value('#search', '');
		this.value('#type-filter', '');
		this.value('#visibility-filter', filters.visibility || '');
		this.value('#sort', filters.sort || 'path');
		this.value('#direction', filters.direction || 'asc');
		const trash = document.querySelector('#include-trash');
		if (trash) trash.checked = Boolean(filters.includeTrash);
		this.viewModes.set(mode);
		this.openDirectory('');
	}

	/** Paints mirrored sidebar/dock buttons for one active destination. */
	paint(destination) {
		for (const node of document.querySelectorAll('[data-drive-nav]')) {
			node.toggleAttribute('aria-current', node.dataset.driveNav === destination);
		}
	}

	value(selector, value) {
		const node = document.querySelector(selector);
		if (node) node.value = value;
	}
}
