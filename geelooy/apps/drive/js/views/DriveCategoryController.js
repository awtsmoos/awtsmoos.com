//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveCategoryController
 * @description Owns presentation-only file categories without creating another entry store.
 * The Awtsmoos is one truth beyond every useful distinction; Awtsmoos.com lets a person
 * view folders, images, videos, or documents while the authoritative Drive collection remains one.
 */
const CATEGORIES = new Set(['all', 'folders', 'images', 'videos', 'docs']);

export class DriveCategoryController {
	constructor(onChange = () => {}) {
		this.active = 'all';
		this.onChange = onChange;
	}

	/** Binds the visual category rail after the Drive chrome has mounted. */
	install() {
		for (const button of document.querySelectorAll('[data-drive-category]')) {
			button.addEventListener('click', () => this.set(button.dataset.driveCategory));
		}
		this.paint();
	}

	/** Selects one bounded presentation category and repaints the current entries only. */
	set(category = 'all') {
		const next = CATEGORIES.has(category) ? category : 'all';
		if (next === this.active) return;
		this.active = next;
		this.paint();
		this.onChange(next);
	}

	reset() {
		this.active = 'all';
		this.paint();
	}

	/** Filters already-presented entries without claiming a new server query. */
	filter(items = []) {
		if (this.active === 'all') return items;
		if (this.active === 'folders') return items.filter(item => item.isFolder);
		if (this.active === 'images') return items.filter(item => item.kind === 'image');
		if (this.active === 'videos') return items.filter(item => item.kind === 'video');
		return items.filter(item => !item.isFolder && !['image', 'video'].includes(item.kind));
	}

	paint() {
		document.body.dataset.driveCategory = this.active;
		for (const button of document.querySelectorAll('[data-drive-category]')) {
			const active = button.dataset.driveCategory === this.active;
			button.setAttribute('aria-pressed', String(active));
		}
	}
}
