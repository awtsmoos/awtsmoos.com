//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveFolderChooser
 * @description Browses destination folders independently from the visible Drive path.
 * The Awtsmoos contains the place where a person stands and every place they may choose;
 * Awtsmoos.com lets organization look ahead without making the main file view move or lose.
 */
import { createFolder } from '../actions.js';
import { listEntriesAt } from '../api.js';
import { joinDrivePath, normalizeDrivePath, parentPath } from '../path.js';

export class DriveFolderChooser {
	constructor(onChange = () => {}) {
		this.onChange = onChange;
		this.path = '';
		this.folders = [];
		this.loading = false;
		this.error = '';
	}

	/** Opens one canonical destination and loads its immediate child folders. */
	async open(path = '') {
		this.path = normalizeDrivePath(path, { allowRoot: true });
		return this.refresh();
	}

	/** Enters one child destination without mutating the primary Drive path. */
	async enter(path) {
		this.path = normalizeDrivePath(path, { allowRoot: true });
		return this.refresh();
	}

	/** Navigates to the chooser parent while root remains a stable boundary. */
	async up() {
		if (!this.path) return this.snapshot();
		return this.enter(parentPath(this.path));
	}

	/** Creates a folder beneath the chooser destination and enters the new folder. */
	async createAndEnter(name) {
		const folderName = String(name || '').trim();
		if (!folderName) throw new Error('Enter a folder name first.');
		await createFolder(this.path, folderName);
		return this.enter(joinDrivePath(this.path, folderName));
	}

	/** Refreshes immediate folders from the server while preserving independent chooser state. */
	async refresh() {
		this.loading = true;
		this.error = '';
		this.notify();
		try {
			const result = await listEntriesAt(this.path, {
				type: 'folder',
				sort: 'path',
				direction: 'asc',
				limit: 100
			});
			this.folders = (result.entries || [])
				.filter(entry => entry.type === 'folder')
				.sort((left, right) => left.name.localeCompare(right.name));
		} catch (error) {
			this.folders = [];
			this.error = error?.message || String(error);
			throw error;
		} finally {
			this.loading = false;
			this.notify();
		}
		return this.snapshot();
	}

	snapshot() {
		return {
			path: this.path,
			folders: [...this.folders],
			loading: this.loading,
			error: this.error
		};
	}

	notify() {
		const state = this.snapshot();
		this.onChange(state);
		return state;
	}
}
