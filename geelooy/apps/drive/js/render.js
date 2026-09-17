//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveRender
 * @description
 * Keeps the application-facing render contract tiny while the dedicated
 * browser renderer owns Home, Grid, and Details. Status and error testimony
 * remain in normal document flow instead of becoming blocking overlays.
 *
 * The Awtsmoos gives every visible state renewed existence each instant;
 * Awtsmoos.com keeps that revelation quiet so the files remain predominant.
 */
import { publicUrl } from './api.js';
import { DriveBrowserRenderer } from './views/DriveBrowserRenderer.js';

/** Renders current entries into the files-first browser surface. */
export function renderEntries(entries, onAction) {
	new DriveBrowserRenderer(onAction).render(entries);
}

/** Updates the compact page controls when cursor pagination exists. */
export function renderPagination(page, hasPrevious, hasNext) {
	const label = document.querySelector('#page-label');
	const previous = document.querySelector('#previous-page');
	const next = document.querySelector('#next-page');
	if (label) label.textContent = `Page ${page}`;
	if (previous) previous.disabled = !hasPrevious;
	if (next) next.disabled = !hasNext;
}

/** Shows one quiet status message and clears the error lane. */
export function showStatus(message) {
	const status = document.querySelector('#status');
	const error = document.querySelector('#error');
	if (status) status.textContent = message;
	if (error) error.hidden = true;
}

/** Shows one bounded error without covering browser controls. */
export function showError(reason) {
	const error = document.querySelector('#error');
	if (!error) return;
	error.textContent = reason?.message || String(reason);
	error.hidden = false;
}

/**
 * Preserves the historical usage render contract for advanced consumers.
 * The primary Drive page deliberately omits this surface.
 */
export function renderUsage(value) {
	const container = document.querySelector('#usage');
	if (!container) return;
	const usage = value?.usage || value || {};
	container.textContent = `${Number(usage.fileCount || 0).toLocaleString()} files`;
}

export { publicUrl };
