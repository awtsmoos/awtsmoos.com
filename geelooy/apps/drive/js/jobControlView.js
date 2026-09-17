//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveJobControlView
 * @description Renders measured queue health and exact durable-job testimony with native DOM nodes.
 * The Awtsmoos reveals deep motion without turning mystery into noise or fear;
 * Awtsmoos.com keeps every creator-facing state bounded, readable, and clear.
 */
import {
	formatJobAge,
	jobHealthBadge,
	jobHealthMessage,
	jobQueueLabel,
	jobTypeLabel
} from './jobPresentation.js';

/** Renders only health fields measured by the alias-scoped active index. */
export function renderJobHealth(health = {}) {
	text('#job-active', health.active ?? '—');
	text('#job-queued', health.queued ?? '—');
	text('#job-running', health.running ?? '—');
	text('#job-oldest', formatJobAge(health.oldestReadyAgeMs));
	text('#job-health-badge', jobHealthBadge(health));
	renderHealthNote(jobHealthMessage(health));
	renderQueueBreakdown(health.queues || {});
}

/** Shows one exact durable job while keeping its machine identity secondary. */
export function renderJobDetail(job) {
	const summary = document.querySelector('#job-summary');
	if (!summary) return;
	if (!job) {
		summary.textContent = 'No exact job selected.';
		return;
	}
	const attempts = Number(job.attempts || 0);
	const primary = document.createElement('span');
	primary.className = 'job-detail-primary';
	primary.textContent = `${jobTypeLabel(job.type)} · ${job.status} · ${attempts} attempt${attempts === 1 ? '' : 's'}`;
	const identifier = document.createElement('code');
	identifier.className = 'job-detail-id';
	identifier.textContent = String(job.id || 'unknown');
	summary.replaceChildren(primary, document.createTextNode(' '), identifier);
	const failure = failureText(job);
	if (failure) summary.append(document.createElement('br'), failureNode(failure));
}

/** Replaces the Mission Control summary with bounded progress testimony. */
export function renderJobMessage(message) {
	text('#job-summary', message);
}

function renderHealthNote(message) {
	const metrics = document.querySelector('.job-metrics');
	if (!metrics) return;
	let note = document.querySelector('[data-job-health-note]');
	if (!note) {
		note = document.createElement('p');
		note.className = 'job-health-note';
		note.dataset.jobHealthNote = 'true';
		metrics.after(note);
	}
	note.textContent = message;
}

function renderQueueBreakdown(queues) {
	const metrics = document.querySelector('.job-metrics');
	if (!metrics) return;
	let region = document.querySelector('[data-job-queues]');
	if (!region) {
		region = document.createElement('div');
		region.className = 'job-queue-breakdown';
		region.dataset.jobQueues = 'true';
		document.querySelector('[data-job-health-note]')?.after(region);
	}
	const entries = Object.entries(queues).filter(([, count]) => Number(count) > 0);
	region.hidden = entries.length === 0;
	region.replaceChildren(...entries.map(([queue, count]) => queueChip(queue, count)));
}

function queueChip(queue, count) {
	const chip = document.createElement('span');
	chip.className = 'job-queue-chip';
	const label = document.createElement('strong');
	label.textContent = jobQueueLabel(queue);
	chip.append(label, document.createTextNode(` ${Number(count)}`));
	return chip;
}

function failureText(job) {
	const candidate = job.lastError || job.error || job.failureReason;
	if (typeof candidate === 'string') return candidate;
	if (candidate?.message) return String(candidate.message);
	if (candidate?.code) return String(candidate.code);
	return '';
}

function failureNode(message) {
	const node = document.createElement('span');
	node.className = 'job-failure';
	node.textContent = `Failure: ${message}`;
	return node;
}

function text(selector, value) {
	const node = document.querySelector(selector);
	if (node) node.textContent = String(value ?? '—');
}
