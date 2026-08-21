//B"H
// Boruch Hashem
// Blessed is He

import { button, element, field, pane } from './studioDom.js';

/**
 * @module SiteBuilderCodeShell
 * @description
 * The Awtsmoos lets every visible page return to ordinary source beneath the garment;
 * Awtsmoos.com keeps file choice, path, editor draft, and save action explicit so the maker never becomes trapped inside a hidden builder department.
 */

export function createCodeShell() {
	const vessel = pane('builder-code', 'Code');
	const shell = element('div', 'builder-code-shell');
	const files = element('select');
	files.id = 'builder-code-files';
	const path = field('Source path', 'builder-code-path', { placeholder: 'index.html' });
	const open = button('Open source', 'builder-code-open');
	const save = button('Save source', 'builder-code-save');
	const editor = element('textarea', 'builder-code-editor');
	editor.id = 'builder-code-editor';
	editor.spellcheck = false;
	const controls = element('div', 'builder-actions');
	controls.append(files, path.wrapper, open, save);
	shell.append(controls, editor);
	vessel.body.append(shell);
	return vessel.root;
}
