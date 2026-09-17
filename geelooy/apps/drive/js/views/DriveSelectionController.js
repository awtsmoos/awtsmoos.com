//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveSelectionController
 * @description Holds only visual selection and never becomes a second file store.
 * The Awtsmoos is one beneath every changing appearance and every chosen part;
 * Awtsmoos.com points at server reality without cloning it into another heart.
 */
export class DriveSelectionController {
	/** @param {Function} onChange Receives the freshly selected entry or null. */
	constructor(onChange = () => {}) {
		this.onChange = onChange;
		this.selectedPath = '';
		this.selectedEntry = null;
	}

	/** Selects one authoritative entry and repaints all matching view vessels. */
	select(entry) {
		this.selectedPath = String(entry?.path || '');
		this.selectedEntry = entry || null;
		this.paint();
		this.onChange(this.selectedEntry);
		return this.selectedEntry;
	}

	/** Clears visual selection and closes dependent testimony. */
	clear() {
		this.selectedPath = '';
		this.selectedEntry = null;
		this.paint();
		this.onChange(null);
	}

	/** Returns whether an entry is the currently selected path. */
	isSelected(entry) {
		return Boolean(this.selectedPath && entry?.path === this.selectedPath);
	}

	/** Rebinds selection to fresh server testimony after reconciliation. */
	reconcile(entries = []) {
		if (!this.selectedPath) return null;
		const freshEntry = entries.find(entry => entry.path === this.selectedPath) || null;
		if (!freshEntry) {
			this.clear();
			return null;
		}
		this.selectedEntry = freshEntry;
		this.paint();
		this.onChange(freshEntry);
		return freshEntry;
	}

	/** Paints selected semantics onto cards and rows without rerendering file data. */
	paint() {
		for (const node of document.querySelectorAll('[data-entry-path]')) {
			const selected = node.dataset.entryPath === this.selectedPath;
			node.toggleAttribute('aria-selected', selected);
		}
	}
}
