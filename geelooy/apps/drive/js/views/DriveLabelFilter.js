//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveLabelFilter
 * @description Presentation-only label filter chips, mirroring the category rail.
 * The Awtsmoos is one truth beyond every useful distinction; Awtsmoos.com lets
 * a person narrow the visible files by label while the Drive collection stays one.
 */
import { driveState } from '../state.js';
import { allLabels, getLabels, labelColor } from '../labels.js';

const MAX_CHIPS = 12;

export class DriveLabelFilter {
	constructor(onChange = () => {}) {
		this.active = '';
		this.onChange = onChange;
	}

	/** Binds chip clicks once through delegation, then paints the chip row. */
	install() {
		document.querySelector('#drive-label-chips')?.addEventListener('click', event => {
			const chip = event.target.closest('[data-drive-label]');
			if (chip) this.set(chip.dataset.driveLabel);
		});
		this.refresh();
	}

	/** Toggles one label filter and repaints entries only. */
	set(label = '') {
		const next = label && label !== this.active ? label : '';
		if (next === this.active) return;
		this.active = next;
		this.paint();
		this.onChange();
	}

	reset() {
		this.active = '';
		this.paint();
	}

	/** Filters already-presented entries without claiming a new server query. */
	filter(items = []) {
		if (!this.active) return items;
		const want = this.active.toLowerCase();
		return items.filter(item => getLabels(item.entry || item).some(label => label.toLowerCase() === want));
	}

	/** Paints chips from the current folder's labels, preserving the active one. */
	refresh(entries = driveState.entries) {
		const host = document.querySelector('#drive-label-chips');
		if (!host) return;
		host.replaceChildren();
		for (const label of allLabels(entries).slice(0, MAX_CHIPS)) {
			const chip = document.createElement('button');
			chip.type = 'button';
			chip.className = `drive-label-chip ${labelColor(label)}`;
			chip.dataset.driveLabel = label;
			chip.textContent = label;
			host.append(chip);
		}
		this.paint();
	}

	paint() {
		for (const chip of document.querySelectorAll('#drive-label-chips [data-drive-label]')) {
			chip.setAttribute('aria-pressed', String(chip.dataset.driveLabel === this.active));
		}
	}
}
