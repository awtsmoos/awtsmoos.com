//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveBrowserRenderer
 * @description Paints Home, Grid, and List from one authoritative entry collection.
 * The Awtsmoos is one truth revealed through many useful arrangements;
 * Awtsmoos.com changes presentation without multiplying file-state engagements.
 */
import { driveState } from '../state.js';
import { DriveEntryCard } from './DriveEntryCard.js';
import { DriveEntryListRow } from './DriveEntryListRow.js';
import { DriveEntryMenu } from './DriveEntryMenu.js';
import { DriveEntryPresenter } from './DriveEntryPresenter.js';

export class DriveBrowserRenderer {
	constructor(onAction, selection) {
		this.presenter = new DriveEntryPresenter();
		this.menu = new DriveEntryMenu(onAction);
		this.card = new DriveEntryCard(onAction, this.menu, selection);
		this.row = new DriveEntryListRow(onAction, this.menu, selection);
	}

	/** Replaces the visible browser from raw server entries only. */
	render(entries = []) {
		const host = document.querySelector('#entry-rows');
		if (!host) return;
		const presented = this.folderFirst(entries.map(entry => this.presenter.present(entry)));
		host.replaceChildren();
		this.paintContext(presented.length);
		if (!presented.length) {
			host.append(this.empty());
			return;
		}
		const mode = document.body.dataset.driveView || 'home';
		const atRoot = !driveState.currentPath;
		if (mode === 'home' && atRoot) host.append(this.home(presented));
		else if (mode === 'list') host.append(this.list(presented));
		else host.append(this.grid(presented));
	}

	/** Builds the root home: folders first, genuinely recent files beneath. */
	home(items) {
		const fragment = document.createDocumentFragment();
		const folders = items.filter(item => item.isFolder);
		const files = items.filter(item => !item.isFolder).sort(this.newestFirst).slice(0, 8);
		if (folders.length) fragment.append(this.section('Folders', this.grid(folders, 'drive-home-folders')));
		if (files.length) fragment.append(this.section('Recent files', this.rows(files, 'drive-home-recent')));
		return fragment;
	}

	grid(items, extraClass = '') {
		const grid = document.createElement('div');
		grid.className = `drive-entry-grid ${extraClass}`.trim();
		grid.append(...items.map(item => this.card.create(item)));
		return grid;
	}

	list(items) {
		const wrap = document.createElement('div');
		wrap.className = 'drive-entry-list';
		const header = document.createElement('div');
		header.className = 'drive-list-header';
		header.innerHTML = '<span>Name</span><span>Modified</span><span>Size</span><span></span>';
		wrap.append(header, this.rows(items));
		return wrap;
	}

	rows(items, extraClass = '') {
		const rows = document.createElement('div');
		rows.className = `drive-entry-rows ${extraClass}`.trim();
		rows.append(...items.map(item => this.row.create(item)));
		return rows;
	}

	section(title, content) {
		const section = document.createElement('section');
		section.className = 'drive-browser-section';
		const heading = document.createElement('h2');
		heading.textContent = title;
		section.append(heading, content);
		return section;
	}

	empty() {
		const empty = document.createElement('div');
		empty.className = 'drive-empty';
		empty.innerHTML = '<strong>No files here yet</strong><span>Upload a file or create a folder to begin.</span>';
		return empty;
	}

	folderFirst(items) {
		return [...items].sort((left, right) => {
			if (left.entry.type === right.entry.type) return left.name.localeCompare(right.name);
			return left.isFolder ? -1 : 1;
		});
	}

	paintContext(count) {
		const location = document.querySelector('#drive-location');
		const itemCount = document.querySelector('#drive-item-count');
		if (location) location.textContent = driveState.currentPath || 'My Drive';
		if (itemCount) itemCount.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
	}

	newestFirst(left, right) {
		return Date.parse(right.entry.updatedAt || 0) - Date.parse(left.entry.updatedAt || 0);
	}
}
