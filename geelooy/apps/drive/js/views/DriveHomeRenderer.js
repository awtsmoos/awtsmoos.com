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
		fragment.append(this.powers());
		const folders = items.filter(item => item.isFolder);
		const files = items.filter(item => !item.isFolder).sort(this.newestFirst).slice(0, 12);
		if (folders.length) fragment.append(this.section('Folders', '📁', this.folderRail(folders)));
		if (files.length) fragment.append(this.section('Files', '▰', this.fileGrid(files)));
		if (!folders.length && !files.length) fragment.append(this.empty());
		return fragment;
	}

	/**
	 * Surfaces the Drive API's deeper vessels as one glanceable deck.
	 * Every card deep-links into the existing Advanced tools surface, which
	 * already owns the live jobs, sites, deployments, projects, and usage
	 * panels — no new data wiring, only revealed doorways.
	 */
	powers() {
		const deck = document.createElement('section');
		deck.className = 'drive-powers';
		deck.setAttribute('aria-label', 'Drive powers');
		const heading = document.createElement('h2');
		heading.className = 'drive-powers-heading';
		const title = document.createElement('strong');
		title.textContent = 'Drive powers';
		const hint = document.createElement('span');
		hint.textContent = 'Jobs · sites · projects · storage';
		heading.append(title, hint);
		deck.append(heading);
		for (const power of [
			{ glyph: '◔', title: 'Storage', text: 'Usage and quota at a glance', href: './advanced.html#storage-overview' },
			{ glyph: '⬢', title: 'Website', text: 'Sites, deployments, and instant previews', href: './advanced.html#website-maker' },
			{ glyph: '▣', title: 'Projects', text: 'Durable projects, databases, and hosting', href: './advanced.html#project-platform-panel' },
			{ glyph: '✦', title: 'Mission Control', text: 'Deferred jobs, retries, and queue health', href: './advanced.html#mission-control' }
		]) {
			const card = document.createElement('a');
			card.className = 'drive-power-card';
			card.href = power.href;
			const glyph = document.createElement('span');
			glyph.className = 'drive-power-glyph';
			glyph.setAttribute('aria-hidden', 'true');
			glyph.textContent = power.glyph;
			const copy = document.createElement('span');
			copy.className = 'drive-power-copy';
			const name = document.createElement('strong');
			name.textContent = power.title;
			const blurb = document.createElement('span');
			blurb.textContent = power.text;
			copy.append(name, blurb);
			const arrow = document.createElement('span');
			arrow.className = 'drive-power-arrow';
			arrow.setAttribute('aria-hidden', 'true');
			arrow.textContent = '↗';
			card.append(glyph, copy, arrow);
			deck.append(card);
		}
		return deck;
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
