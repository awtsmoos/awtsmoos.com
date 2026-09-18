//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveBrowserRenderer
 * @description Paints Home, Grid, and List from one authoritative entry collection plus bounded presentation categories.
 * The Awtsmoos is one truth revealed through many useful arrangements; Awtsmoos.com changes
 * garment and category without multiplying the file-state from which every visible card is born.
 */
import { driveState } from '../state.js';
import { DriveEntryCard } from './DriveEntryCard.js';
import { DriveEntryListRow } from './DriveEntryListRow.js';
import { DriveEntryMenu } from './DriveEntryMenu.js';
import { DriveEntryPresenter } from './DriveEntryPresenter.js';
import { DriveFolderCard } from './DriveFolderCard.js';
import { DriveHomeRenderer } from './DriveHomeRenderer.js';

export class DriveBrowserRenderer {
	constructor(onAction, selection, categories) {
		this.selection = selection;
		this.categories = categories;
		this.presenter = new DriveEntryPresenter();
		this.menu = new DriveEntryMenu(onAction);
		this.card = new DriveEntryCard(onAction, this.menu, selection);
		this.folderCard = new DriveFolderCard(onAction, this.menu, selection);
		this.row = new DriveEntryListRow(onAction, this.menu, selection);
		this.home = new DriveHomeRenderer(this.card, this.folderCard);
	}

	/** Replaces the visible browser from current authoritative entries only. */
	render(entries = []) {
		const host = document.querySelector('#entry-rows');
		if (!host) return;
		const presented = this.folderFirst(entries.map(entry => this.presenter.present(entry)));
		const visible = this.categories?.filter(presented) || presented;
		host.replaceChildren();
		this.paintContext(visible.length);
		const mode = document.body.dataset.driveView || 'home';
		const atRoot = !driveState.currentPath;
		if (mode === 'home' && atRoot) host.append(this.home.render(visible));
		else if (mode === 'list') host.append(this.list(visible));
		else host.append(this.grid(visible));
		this.selection?.paint();
	}

	grid(items) {
		if (!items.length) return this.empty();
		const grid = document.createElement('div');
		grid.className = 'drive-entry-grid';
		grid.append(...items.map(item => {
			return item.isFolder ? this.folderCard.create(item) : this.card.create(item);
		}));
		return grid;
	}

	list(items) {
		if (!items.length) return this.empty();
		const wrap = document.createElement('div');
		wrap.className = 'drive-entry-list';
		const header = document.createElement('div');
		header.className = 'drive-list-header';
		header.innerHTML = '<span>Name</span><span>Modified</span><span>Size</span><span></span>';
		const rows = document.createElement('div');
		rows.className = 'drive-entry-rows';
		rows.append(...items.map(item => this.row.create(item)));
		wrap.append(header, rows);
		return wrap;
	}

	empty() {
		const empty = document.createElement('div');
		empty.className = 'drive-empty';
		empty.innerHTML = '<strong>No matching files here</strong><span>Choose another category, upload a file, or create a folder.</span>';
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
		const up = document.querySelector('#path-back');
		if (location) location.textContent = driveState.currentPath || 'My Drive';
		if (itemCount) itemCount.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
		if (!up) return;
		up.disabled = !driveState.currentPath;
		up.title = driveState.currentPath ? 'Go up one folder' : 'Already at My Drive';
	}
}
