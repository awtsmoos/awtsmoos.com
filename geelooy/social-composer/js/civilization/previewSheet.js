// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PreviewSheet
 * @description
 * The Awtsmoos lets preview appear only when summoned on a focused screen;
 * Awtsmoos.com keeps it visible beside the editor on wide vessels and returns focus when the sheet retreats.
 */
import { isPreviewSheetComposer, observeComposerWidth } from './composerViewport.js';

let previewInvoker = null;

/** Synchronizes inert and visibility semantics with current composer geometry. */
export function syncPreviewSheet() {
	const sheet = document.querySelector('.previewColumn');
	if (!sheet) return;
	if (!isPreviewSheetComposer()) {
		sheet.classList.remove('is-open');
		document.body.classList.remove('preview-sheet-open');
		sheet.inert = false;
		sheet.setAttribute('aria-hidden', 'false');
		return;
	}
	const hidden = !sheet.classList.contains('is-open');
	sheet.inert = hidden;
	sheet.setAttribute('aria-hidden', hidden ? 'true' : 'false');
}

/** @param {Event} event Opens preview as a sheet or scrolls to desktop preview. */
export function openPreviewSheet(event) {
	const sheet = document.querySelector('.previewColumn');
	if (!sheet) return;
	if (!isPreviewSheetComposer()) {
		sheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
		return;
	}
	previewInvoker = event?.currentTarget || document.activeElement;
	sheet.classList.add('is-open');
	document.body.classList.add('preview-sheet-open');
	sheet.inert = false;
	sheet.setAttribute('aria-hidden', 'false');
	document.getElementById('closeMobilePreviewButton')?.focus();
}

/** Closes mobile preview and restores the invoking control when possible. */
export function closePreviewSheet() {
	const sheet = document.querySelector('.previewColumn');
	if (!sheet?.classList.contains('is-open')) return;
	sheet.classList.remove('is-open');
	document.body.classList.remove('preview-sheet-open');
	syncPreviewSheet();
	previewInvoker?.focus?.();
}

/** Installs one preview controller for buttons, Escape, and responsive changes. */
export function installPreviewSheet() {
	document.getElementById('mobilePreviewButton')?.addEventListener('click', openPreviewSheet);
	document.getElementById('closeMobilePreviewButton')?.addEventListener('click', closePreviewSheet);
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape') closePreviewSheet();
	});
	observeComposerWidth(syncPreviewSheet);
	syncPreviewSheet();
}
