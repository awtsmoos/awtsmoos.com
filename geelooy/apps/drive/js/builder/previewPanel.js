//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PreviewPanel
 * @description
 * The Awtsmoos lets source become visible without pretending the vision is publication;
 * Awtsmoos.com keeps one sandboxed iframe alive while preview readiness becomes a real transient witness and canonical URLs remain a separate covenant.
 */

import { markPreviewed, setPreviewMode } from './builderState.js';

export function installPreviewPanel(service, code, actions = {}) {
	const frame = document.querySelector('#builder-preview-frame');
	const shell = document.querySelector('#builder-preview-shell');
	const status = document.querySelector('#builder-preview-status');
	for (const button of document.querySelectorAll('[data-preview-mode]')) {
		button.addEventListener('click', () => setMode(button.dataset.previewMode));
	}
	document.querySelector('#builder-preview-refresh').addEventListener('click', () => settle(refresh));
	return { refresh, open: refresh, status: previewStatus, update };

	async function refresh() {
		const current = code.inspect();
		const source = current.path === 'index.html' ? current : await service.readFile('index.html');
		frame.srcdoc = previewDocument(source.content, shell.dataset.canonicalUrl);
		markPreviewed();
		status.textContent = current.path === 'index.html' && current.dirty
			? 'Local preview · unsaved index.html draft'
			: 'Local preview · saved Drive index.html';
		actions.previewed?.();
		return previewStatus();
	}

	function setMode(mode) {
		shell.dataset.previewMode = mode || 'mobile';
		setPreviewMode(mode);
		for (const button of document.querySelectorAll('[data-preview-mode]')) {
			button.setAttribute('aria-pressed', String(button.dataset.previewMode === mode));
		}
	}

	function update(snapshot) {
		shell.dataset.canonicalUrl = snapshot?.canonicalUrl || '';
		document.querySelector('#builder-preview-canonical').textContent = snapshot?.canonicalUrl
			? `Published assets resolve against ${snapshot.canonicalUrl}`
			: 'No canonical URL yet. This preview remains local source only.';
	}

	function previewStatus() {
		return {
			mode: shell.dataset.previewMode || 'mobile',
			sourcePath: 'index.html',
			canonicalUrl: shell.dataset.canonicalUrl || '',
			label: status.textContent
		};
	}

	async function settle(action) {
		try {
			await action();
		} catch (error) {
			actions.error?.(error);
		}
	}
}

export function previewDocument(content, canonicalUrl = '') {
	const base = canonicalUrl ? `<base href="${attributeText(canonicalUrl)}">` : '';
	const source = String(content || '');
	if (!base) {
		return source;
	}
	if (/<head[\s>]/i.test(source)) {
		return source.replace(/<head([^>]*)>/i, `<head$1>${base}`);
	}
	return `${base}${source}`;
}

function attributeText(value) {
	return String(value || '')
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
