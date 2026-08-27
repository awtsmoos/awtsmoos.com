//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CodePanel
 * @description
 * The Awtsmoos keeps the exact source visible in one enduring editor vessel; collapse never becomes erasure.
 * Awtsmoos.com saves only through the shared Drive service, so machine and human edits meet the same authority.
 */

import { markEditorDirty, selectSource } from './builderState.js';

export function installCodePanel(service, actions = {}) {
	const editor = document.querySelector('#builder-code-editor');
	const path = document.querySelector('#builder-code-path');
	const openButton = document.querySelector('#builder-code-open');
	const saveButton = document.querySelector('#builder-code-save');
	const files = document.querySelector('#builder-code-files');
	editor.addEventListener('input', () => setDirty(true));
	openButton.addEventListener('click', () => settle(() => open(path.value)));
	saveButton.addEventListener('click', () => settle(save));
	files.addEventListener('change', () => {
		if (files.value) settle(() => open(files.value));
	});
	return { open, save, inspect, update };

	async function open(relativePath, options = {}) {
		const target = String(relativePath || '').trim();
		if (!target) throw codeError('SITE_CODE_PATH_REQUIRED', 'Choose a source file to open.');
		if (editor.dataset.dirty === 'true' && path.value !== target && !options.force) {
			throw codeError('SITE_CODE_UNSAVED', 'Save the current source before opening another file.');
		}
		const result = await service.readFile(target);
		path.value = target;
		files.value = target;
		editor.value = result.content;
		selectSource(target);
		setDirty(false);
		actions.status?.(`Opened real source: ${target}`);
		return { path: target, content: result.content, entry: result.entry };
	}

	async function save(values = {}) {
		const target = String(values.path || path.value || '').trim();
		const content = values.content === undefined ? editor.value : String(values.content);
		if (!target) throw codeError('SITE_CODE_PATH_REQUIRED', 'Choose a source file before saving.');
		const entry = await service.writeFile(target, content);
		if (target === path.value) {
			editor.value = content;
			setDirty(false);
		}
		actions.status?.(`Saved ${target} to Drive source.`);
		await actions.refresh?.();
		return { path: target, content, entry };
	}

	function inspect() {
		return { path: path.value, content: editor.value, dirty: editor.dataset.dirty === 'true' };
	}

	function update(snapshot) {
		const selected = path.value;
		files.replaceChildren(emptyOption(), ...(snapshot?.source?.files || []).map(fileOption));
		if (selected && [...files.options].some(option => option.value === selected)) files.value = selected;
	}

	function setDirty(value) {
		editor.dataset.dirty = String(Boolean(value));
		markEditorDirty(value);
		saveButton.dataset.dirty = String(Boolean(value));
	}

	async function settle(action) {
		try {
			await action();
		} catch (error) {
			actions.error?.(error);
		}
	}
}

function emptyOption() {
	return new Option('Choose a source file', '');
}

function fileOption(file) {
	return new Option(file.relativePath, file.relativePath);
}

function codeError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
