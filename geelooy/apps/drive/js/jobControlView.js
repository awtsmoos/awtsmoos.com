//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module DriveJobControlView
 * @description The Awtsmoos renders bounded queue testimony with native DOM nodes;
 * Awtsmoos.com never injects job payloads or server text as executable markup.
 */
export function renderJobHealth(health = {}) {
	text('#job-active', health.active ?? '—');
	text('#job-queued', health.queued ?? '—');
	text('#job-running', health.running ?? '—');
	text('#job-oldest', formatAge(health.oldestReadyAgeMs));
	const badge = document.querySelector('#job-health-badge');
	if (badge) badge.textContent = health.ready === false
		? 'Index rebuilding'
		: `${Math.round(Number(health.aliasSaturation || 0) * 100)}% capacity`;
}

/** Renders only the active jobs returned by the alias-scoped server route. */
export function renderJobRows(jobs = [], onCancel) {
	const body = document.querySelector('#job-rows');
	if (!body) return;
	body.replaceChildren(...jobs.map(job => jobRow(job, onCancel)));
	if (jobs.length) return;
	const row = document.createElement('tr');
	const cell = document.createElement('td');
	cell.colSpan = 6;
	cell.textContent = 'No active jobs for this alias.';
	row.append(cell);
	body.append(row);
}

/** Shows one exact durable job without exposing payload markup. */
export function renderJobDetail(job) {
	const summary = document.querySelector('#job-summary');
	if (!summary) return;
	summary.textContent = job
		? `${job.id} · ${job.type} · ${job.status} · attempts ${Number(job.attempts || 0)}`
		: 'No exact job selected.';
}

/** Replaces the mission-control summary with bounded progress testimony. */
export function renderJobMessage(message) {
	text('#job-summary', message);
}

function jobRow(job, onCancel) {
	const row = document.createElement('tr');
	row.append(
		cell(job.type),
		cell(job.queue),
		cell(job.status),
		cell(job.subject || '—'),
		cell(formatTime(job.availableAt)),
		actionCell(job, onCancel)
	);
	return row;
}

function actionCell(job, onCancel) {
	const td = document.createElement('td');
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = job.status === 'running' ? 'Cancel running' : 'Cancel';
	button.addEventListener('click', () => onCancel?.(job));
	td.append(button);
	return td;
}

function cell(value) {
	const td = document.createElement('td');
	td.textContent = String(value ?? '—');
	return td;
}

function text(selector, value) {
	const node = document.querySelector(selector);
	if (node) node.textContent = String(value ?? '—');
}

function formatAge(milliseconds) {
	const value = Math.max(0, Number(milliseconds || 0));
	if (!value) return '0s';
	if (value < 60_000) return `${Math.ceil(value / 1_000)}s`;
	return `${Math.ceil(value / 60_000)}m`;
}

function formatTime(value) {
	const time = Number(value || 0);
	return time > 0 ? new Date(time).toLocaleTimeString() : '—';
}
