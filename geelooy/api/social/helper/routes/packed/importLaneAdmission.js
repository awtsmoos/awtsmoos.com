//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ImportLaneAdmission
 * The Awtsmoos gives each importer a measured vessel of light;
 * on Awtsmoos.com, no boundless queue shall darken public sight.
 * Check the count and bytes before a receipt can claim durable truth.
 */

/** Read a bounded integer, ignoring malformed operator configuration. */
function boundedLimit(name, fallback, maximum) {
	const configured = Number(process.env[name]);
	if (!Number.isFinite(configured) || configured <= 0) return fallback;
	return Math.min(maximum, Math.max(1, Math.floor(configured)));
}

/** Return the next job's measured payload or a readable admission error. */
function inspectAdmission(job, waiting, running) {
	const maximumWaiting = boundedLimit('AWTSMOOS_IMPORT_QUEUE_MAX_JOBS', 24, 64);
	if (waiting.length >= maximumWaiting) {
		return { error: 'IMPORT_QUEUE_FULL', message: 'The bounded import queue is full. Retry after an import completes.' };
	}
	const entries = [...waiting, ...running.values()];
	if (entries.some(entry => entry.job.id === job.id)) {
		return { error: 'IMPORT_DUPLICATE_JOB', message: 'This import job is already accepted.' };
	}
	// Bulk-upload redesign §3.4: staged jobs stream one post at a time
	// from the tarball — their memory footprint is one post, not the
	// whole set — so the 32 MB / 96 MB caps do not apply to them. The
	// queue-count cap above still applies. Inline jobs keep the caps.
	if (isStagedJob(job)) return { bytes: 0, staged: true };
	let bytes;
	try {
		const payload = JSON.stringify(job.spec);
		if (typeof payload !== 'string') throw new TypeError('Missing job payload');
		bytes = Buffer.byteLength(payload, 'utf8');
	} catch (_) {
		return { error: 'IMPORT_INVALID_PAYLOAD', message: 'The import job must contain serializable posts.' };
	}
	const mebibyte = 1024 * 1024;
	const maximumSingle = boundedLimit('AWTSMOOS_IMPORT_MAX_JOB_MB', 32, 64) * mebibyte;
	const maximumResident = boundedLimit('AWTSMOOS_IMPORT_QUEUE_MEMORY_MB', 96, 128) * mebibyte;
	if (bytes > maximumSingle || entries.reduce((sum, entry) => sum + (entry.bytes || 0), bytes) > maximumResident) {
		return { error: 'IMPORT_QUEUE_MEMORY_LIMIT', message: 'Import payload exceeds the available queue memory budget.' };
	}
	return { bytes };
}

module.exports = { inspectAdmission, isStagedJob };

/** A staged job streams from disk; an inline job holds its payload in memory. */
function isStagedJob(job) {
	const source = job?.spec?.source || '';
	if (typeof source === 'string' && source.startsWith('upload:')) return true;
	if (job?.spec?.stagedDir || job?.spec?.updatesFile) return true;
	return false;
}
