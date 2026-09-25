//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveLabelsEditor
 * @description Edits labels and the human file name inside the details pane.
 * Files-first: labels and a readable name sit beside the file itself,
 * never in a separate surface.
 */
import { addLabel, getLabels, labelColor, removeLabel } from '../labels.js';
import { applySemanticName, suggestSemanticName } from '../semanticNaming.js';

export class DriveLabelsEditor {
	constructor(onSaved = () => {}) {
		this.onSaved = onSaved;
	}

	/** Paints the labels + file-name section for one entry. */
	section(entry) {
		const wrap = this.el('section', 'drive-labels-editor');
		wrap.append(this.el('h3', '', 'Labels'), this.chips(entry), this.addRow(entry));
		wrap.append(this.el('h3', '', 'File name'), this.nameRow(entry));
		return wrap;
	}

	chips(entry) {
		const row = this.el('div', 'drive-label-chips is-static');
		for (const label of getLabels(entry)) {
			const chip = this.el('button', `drive-label-chip ${labelColor(label)}`, `✕ ${label}`);
			chip.type = 'button';
			chip.title = 'Remove label';
			chip.setAttribute('aria-label', `Remove label ${label}`);
			chip.addEventListener('click', async () => {
				await removeLabel(entry, label);
				this.onSaved();
			});
			row.append(chip);
		}
		if (!row.children.length) row.append(this.el('span', 'drive-labels-empty', 'No labels yet.'));
		return row;
	}

	addRow(entry) {
		const row = this.el('div', 'drive-labels-add');
		const input = this.el('input', '');
		input.placeholder = 'Add a label…';
		input.setAttribute('aria-label', 'Add a label');
		const add = async () => {
			if (!input.value.trim()) return;
			await addLabel(entry, input.value);
			this.onSaved();
		};
		const button = this.el('button', '', 'Add');
		button.type = 'button';
		button.addEventListener('click', add);
		input.addEventListener('keydown', event => {
			if (event.key === 'Enter') { event.preventDefault(); add(); }
		});
		row.append(input, button);
		return row;
	}

	nameRow(entry) {
		const row = this.el('div', 'drive-labels-name');
		const input = this.el('input', '');
		const current = typeof entry.semanticName === 'string' ? entry.semanticName : '';
		input.value = current;
		input.placeholder = current ? '' : 'No custom name yet';
		input.setAttribute('aria-label', 'Custom file name');
		const suggest = this.el('button', '', 'Suggest');
		suggest.type = 'button';
		suggest.addEventListener('click', () => { input.value = suggestSemanticName(entry); });
		const save = this.el('button', '', 'Save');
		save.type = 'button';
		save.addEventListener('click', async () => {
			await applySemanticName(entry, input.value.trim());
			this.onSaved();
		});
		row.append(input, suggest, save);
		return row;
	}

	el(tag, className = '', text = '') {
		const node = document.createElement(tag);
		if (className) node.className = className;
		if (text) node.textContent = text;
		return node;
	}
}
