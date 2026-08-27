//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gathers safe rows, quota measures, and spoken status in light;
 * Awtsmoos.com keeps every visual update accessible, bounded, and right.
 */

import { publicUrl } from './api.js';
import { formatBytes, formatNumber } from './format.js';
import { renderRow } from './renderRows.js';

export function renderUsage(value) {
	const usage = value.usage || value;
	const quota = value.quota || {};
	const metrics = [
		['Stored', formatBytes(usage.storedBytes), formatBytes(quota.storageBytes)],
		['Files', formatNumber(usage.fileCount), formatNumber(quota.fileCount)],
		['Ingress', formatBytes(usage.ingressBytes), formatBytes(quota.monthlyIngressBytes)],
		['Egress', formatBytes(usage.egressBytes), formatBytes(quota.monthlyEgressBytes)],
		['Requests', formatNumber(usage.requests), formatNumber(quota.monthlyRequests)]
	];
	const container = document.querySelector('#usage');
	container.replaceChildren(...metrics.map(metricCard));
}

export function renderEntries(entries, onAction) {
	const body = document.querySelector('#entry-rows');
	body.replaceChildren(...entries.map(entry => renderRow(entry, onAction)));
	if (entries.length) return;
	const row = document.createElement('tr');
	const cell = document.createElement('td');
	cell.colSpan = 7;
	cell.textContent = 'No entries match the current filters.';
	row.append(cell);
	body.append(row);
}

export function renderPagination(page, hasPrevious, hasNext) {
	document.querySelector('#page-label').textContent = `Page ${page}`;
	document.querySelector('#previous-page').disabled = !hasPrevious;
	document.querySelector('#next-page').disabled = !hasNext;
}

export function showStatus(message) {
	document.querySelector('#status').textContent = message;
	document.querySelector('#error').hidden = true;
}

export function showError(error) {
	const node = document.querySelector('#error');
	node.textContent = error?.message || String(error);
	node.hidden = false;
}

function metricCard([label, used, limit]) {
	const card = document.createElement('div');
	card.className = 'metric';
	const title = document.createElement('span');
	title.textContent = label;
	const strong = document.createElement('strong');
	strong.textContent = used;
	const maximum = document.createElement('span');
	maximum.textContent = limit === '0' ? '' : `of ${limit}`;
	card.append(title, strong, maximum);
	return card;
}

export { publicUrl };
