//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveSelectionController
 * @description Owns selected paths while authoritative Drive entries remain elsewhere.
 * The Awtsmoos is one beneath every chosen multitude and every revealed part;
 * Awtsmoos.com remembers paths, never cloning file reality into another heart.
 */
import { driveState } from '../state.js';
import { pageFullySelected } from '../bulkCapabilities.js';

export class DriveSelectionController {
	constructor(onChange = () => {}) {
		this.onChange = onChange;
		this.selectedPaths = new Set();
		this.bulkMode = false;
	}

	/** Replaces selection with one entry for ordinary desktop Details behavior. */
	select(entry) {
		this.selectedPaths.clear();
		if (entry?.path) this.selectedPaths.add(entry.path);
		this.bulkMode = false;
		return this.notify();
	}

	/** Toggles one entry, promoting an existing single Details selection into bulk mode. */
	toggle(entry) {
		const path = String(entry?.path || '');
		if (!path) return this.entries();
		if (!this.bulkMode && this.selectedPaths.size === 1 && this.selectedPaths.has(path)) {
			this.bulkMode = true;
			return this.notify();
		}
		if (this.selectedPaths.has(path)) this.selectedPaths.delete(path);
		else this.selectedPaths.add(path);
		this.bulkMode = this.selectedPaths.size > 0;
		return this.notify();
	}

	/** Selects every current-page entry and enters bulk mode. */
	selectAll(entries = driveState.entries) {
		this.selectedPaths = new Set(entries.map(entry => entry.path).filter(Boolean));
		this.bulkMode = this.selectedPaths.size > 0;
		return this.notify();
	}

	/** Toggles current-page selection between every entry and none. */
	toggleAll(entries = driveState.entries) {
		if (pageFullySelected(this.selectedPaths, entries)) return this.clear();
		return this.selectAll(entries);
	}

	/** Keeps only the supplied paths selected, normally after a partial batch failure. */
	keep(paths = [], entries = driveState.entries) {
		this.selectedPaths = new Set(paths.filter(Boolean));
		this.bulkMode = this.selectedPaths.size > 0;
		return this.notify(entries);
	}

	/** Clears all visual selection and exits bulk mode. */
	clear() {
		this.selectedPaths.clear();
		this.bulkMode = false;
		return this.notify();
	}

	isSelected(entry) {
		return this.selectedPaths.has(String(entry?.path || entry || ''));
	}

	isActive() {
		return this.selectedPaths.size > 0;
	}

	isBulkActive() {
		return this.bulkMode && this.isActive();
	}

	count() {
		return this.selectedPaths.size;
	}

	paths() {
		return new Set(this.selectedPaths);
	}

	/** Resolves selected objects from the current authoritative snapshot. */
	entries(entries = driveState.entries) {
		return entries.filter(entry => this.selectedPaths.has(entry.path));
	}

	/** Drops paths absent from the fresh server snapshot after reconciliation. */
	reconcile(entries = []) {
		const available = new Set(entries.map(entry => entry.path));
		this.selectedPaths = new Set([...this.selectedPaths].filter(path => available.has(path)));
		if (!this.selectedPaths.size) this.bulkMode = false;
		return this.notify(entries);
	}

	/** Paints exact ARIA and document testimony for every responsive surface. */
	paint() {
		for (const node of document.querySelectorAll('[data-entry-path]')) {
			node.setAttribute('aria-selected', String(this.selectedPaths.has(node.dataset.entryPath)));
		}
		document.body.dataset.driveSelecting = this.isBulkActive() ? 'active' : 'idle';
		document.body.dataset.driveSelectionCount = String(this.count());
	}

	notify(entries = driveState.entries) {
		this.paint();
		const selected = this.entries(entries);
		this.onChange(selected);
		return selected;
	}
}
