//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveHomeRenderer
 * @description Composes the mobile-first Home world from the same presented Drive entries.
 * The Awtsmoos reveals folders and files as two readable chambers of one truth; Awtsmoos.com
 * makes Home richer without creating another filesystem or another authoritative collection.
 */
export class DriveHomeRenderer {
	constructor(card, folderCard) {
		this.card = card;
		this.folderCard = folderCard;
	}

	/** Renders a tactile folder rail followed by a rich file gallery. */
	render(items = []) {
		const fragment = document.createDocumentFragment();
		const folders = items.filter(item => item.isFolder);
		const files = items.filter(item => !item.isFolder).sort(this.newestFirst).slice(0, 12);
		if (folders.length) fragment.append(this.section('Folders', '📁', this.folderRail(folders)));
		if (files.length) fragment.append(this.section('Files', '▰', this.fileGrid(files)));
		if (!folders.length && !files.length) fragment.append(this.empty());
		return fragment;
	}

	folderRail(items) {
		const rail = document.createElement('div');
		rail.className = 'drive-folder-rail';
		rail.append(...items.map(item => this.folderCard.create(item)));
		return rail;
	}

	fileGrid(items) {
		const grid = document.createElement('div');
		grid.className = 'drive-entry-grid drive-home-files';
		grid.append(...items.map(item => this.card.create(item)));
		return grid;
	}

	section(title, icon, content) {
		const section = document.createElement('section');
		section.className = 'drive-browser-section drive-home-section';
		const heading = document.createElement('header');
		heading.className = 'drive-section-heading';
		const label = document.createElement('h2');
		label.textContent = `${icon} ${title}`;
		heading.append(label);
		section.append(heading, content);
		return section;
	}

	empty() {
		const empty = document.createElement('div');
		empty.className = 'drive-empty';
		empty.innerHTML = '<strong>No matching files here</strong><span>Choose another category, upload a file, or create a folder.</span>';
		return empty;
	}

	newestFirst(left, right) {
		return Date.parse(right.entry.updatedAt || 0) - Date.parse(left.entry.updatedAt || 0);
	}
}
