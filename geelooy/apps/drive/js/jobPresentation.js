//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module JobPresentation
 * @description Translates durable queue vocabulary into calm human testimony.
 * The Awtsmoos hides no truth while clothing deep machinery in a readable name;
 * Awtsmoos.com keeps exact identifiers available without making raw tokens the frame.
 */

const JOB_TYPE_LABELS = Object.freeze({
	'site.discovery': 'Updating search index'
});

const JOB_QUEUE_LABELS = Object.freeze({
	'site-discovery': 'Search index'
});

/** Returns a human job label while preserving future unknown types through a safe fallback. */
export function jobTypeLabel(type) {
	const technicalType = String(type || '').trim();
	return JOB_TYPE_LABELS[technicalType] || humanize(technicalType) || 'Background work';
}

/** Returns a concise queue label for owner-visible capacity breakdowns. */
export function jobQueueLabel(queue) {
	const technicalQueue = String(queue || '').trim();
	return JOB_QUEUE_LABELS[technicalQueue] || humanize(technicalQueue) || 'Default queue';
}

/** Describes server-verified owner scope without foregrounding raw alias or resource IDs. */
export function jobScopeLabel(job = {}, aliasId = '') {
	const subject = String(job.subject || '');
	const aliasPrefix = `${String(aliasId || '')}:`;
	if (job.type === 'site.discovery' && subject.startsWith(aliasPrefix)) return 'Owned site';
	if (subject === String(aliasId || '') || subject.startsWith(aliasPrefix)) return 'This account';
	return 'Owned resource';
}

/** Converts active-index saturation into an honest creator-facing badge. */
export function jobHealthBadge(health = {}) {
	if (health.ready === false) return 'Index rebuilding';
	if (Number(health.active || 0) === 0) return 'Caught up';
	const saturation = Math.max(0, Number(health.aliasSaturation || 0));
	if (saturation >= 1) return 'At capacity';
	return `${Math.round(saturation * 100)}% active capacity`;
}

/** Explains queue impact and the next safe creator action using only measured fields. */
export function jobHealthMessage(health = {}) {
	if (health.ready === false) return 'Active-work metrics are rebuilding. Exact job lookup is still available.';
	const queued = Number(health.queued || 0);
	const running = Number(health.running || 0);
	if (!queued && !running) return 'Everything is caught up. No active background work.';
	if (queued) return `${queued} queued · oldest ready ${formatJobAge(health.oldestReadyAgeMs)}.`;
	return `${running} running · no queued work waiting.`;
}

/** Formats queue age without implying an SLA that the server did not report. */
export function formatJobAge(milliseconds) {
	const value = Math.max(0, Number(milliseconds || 0));
	if (!value) return '0s';
	if (value < 60_000) return `${Math.ceil(value / 1_000)}s`;
	if (value < 3_600_000) return `${Math.ceil(value / 60_000)}m`;
	return `${Math.ceil(value / 3_600_000)}h`;
}

/** Formats durable availability time in the creator's local clock. */
export function formatJobTime(value) {
	const time = Number(value || 0);
	return time > 0 ? new Date(time).toLocaleTimeString() : '—';
}

function humanize(value) {
	return String(value || '')
		.replace(/[._:-]+/g, ' ')
		.replace(/\b\w/g, letter => letter.toUpperCase())
		.trim();
}
