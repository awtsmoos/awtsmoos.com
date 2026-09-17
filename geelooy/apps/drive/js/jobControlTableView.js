//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module JobControlTableView
 * @description Renders owner-scoped active work as accessible rows that become cards on narrow screens.
 * The Awtsmoos gives each deep process a bounded vessel and a name the eye can know;
 * Awtsmoos.com keeps machine truth beneath the human surface, so diagnosis can still flow.
 */
import {
	formatJobTime,
	jobQueueLabel,
	jobScopeLabel,
	jobTypeLabel
} from './jobPresentation.js';

/** Renders only the active jobs already filtered by the owner-scoped server route. */
export function renderJobRows(jobs = [], onCancel, aliasId = '') {
	const body = document.querySelector('#job-rows');
	if (!body) return;
	syncTableHeadings();
	body.replaceChildren(...jobs.map(job => jobRow(job, onCancel, aliasId)));
	if (jobs.length) return;
	const row = document.createElement('tr');
	row.className = 'job-empty-row';
	const cell = document.createElement('td');
	cell.colSpan = 6;
	cell.textContent = 'Everything is caught up. No active background work.';
	row.append(cell);
	body.append(row);
}

function jobRow(job, onCancel, aliasId) {
	const row = document.createElement('tr');
	row.append(
		typeCell(job),
		labelledCell('Queue', jobQueueLabel(job.queue)),
		labelledCell('Status', job.status || '—'),
		labelledCell('Scope', jobScopeLabel(job, aliasId)),
		labelledCell('Available', formatJobTime(job.availableAt)),
		actionCell(job, onCancel)
	);
	return row;
}

function typeCell(job) {
	const cell = document.createElement('td');
	cell.dataset.label = 'Work';
	const value = valueNode(jobTypeLabel(job.type));
	const technical = document.createElement('code');
	technical.className = 'job-technical';
	technical.textContent = String(job.type || 'unknown');
	value.append(technical);
	cell.append(value);
	return cell;
}

function actionCell(job, onCancel) {
	const cell = document.createElement('td');
	cell.dataset.label = 'Action';
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = job.status === 'running' ? 'Cancel running' : 'Cancel';
	button.setAttribute('aria-label', `Cancel ${jobTypeLabel(job.type)}`);
	button.addEventListener('click', () => onCancel?.(job));
	cell.append(button);
	return cell;
}

function labelledCell(label, value) {
	const cell = document.createElement('td');
	cell.dataset.label = label;
	cell.append(valueNode(value));
	return cell;
}

function valueNode(value) {
	const node = document.createElement('span');
	node.className = 'job-cell-value';
	node.append(document.createTextNode(String(value ?? '—')));
	return node;
}

function syncTableHeadings() {
	const labels = ['Work', 'Queue', 'Status', 'Scope', 'Available', 'Action'];
	document.querySelectorAll('#job-control thead th').forEach((heading, index) => {
		heading.textContent = labels[index] || heading.textContent;
	});
}
