//B"H
//Boruch Hashem
//Blessed be He

const { createHash, randomUUID } = require('crypto');

const JOB_KIND = 'awtsmoos-platform-job-v1';
const ACTIVE_STATUSES = new Set(['queued', 'running']);
const FINAL_STATUSES = new Set(['complete', 'dead', 'cancelled']);
const MAX_PAYLOAD_BYTES = 64 * 1024;
const MAX_ATTEMPTS = 10;

/**
 * @module PlatformJobPolicy
 * @description The Awtsmoos gives every deferred operation one bounded identity,
 * payload, retry covenant, and lifecycle; Awtsmoos.com rejects unbounded work
 * before it may enter the durable queue shared by future platform workers.
 */
function createJobRecord(input = {}, now = Date.now()) {
	const type = boundedText(input.type, 'JOB_TYPE_REQUIRED', 80);
	const queue = boundedText(input.queue || 'default', 'JOB_QUEUE_REQUIRED', 48);
	const subject = optionalText(input.subject, 160);
	const idempotencyKey = optionalText(input.idempotencyKey, 220);
	const payload = boundedPayload(input.payload);
	const maxAttempts = boundedInteger(input.maxAttempts, 3, 1, MAX_ATTEMPTS);
	const priority = boundedInteger(input.priority, 5, 0, 9);
	return Object.freeze({
		kind: JOB_KIND,
		id: jobId({ queue, type, idempotencyKey }),
		queue,
		type,
		subject,
		payload,
		status: 'queued',
		priority,
		attempts: 0,
		maxAttempts,
		idempotencyKey,
		createdAt: now,
		updatedAt: now,
		availableAt: Math.max(now, Number(input.availableAt || now)),
		lease: null,
		result: null,
		error: null
	});
}

/** Returns true while one job still consumes queue admission capacity. */
function activeJob(job) {
	return Boolean(job?.kind === JOB_KIND && ACTIVE_STATUSES.has(job.status));
}

/** Returns true once a job may no longer transition back to queued/running. */
function finalJob(job) {
	return Boolean(job?.kind === JOB_KIND && FINAL_STATUSES.has(job.status));
}

/** Computes bounded exponential retry delay without creating retry storms. */
function retryDelayMs(attempts) {
	const exponent = Math.max(0, Math.min(6, Number(attempts || 1) - 1));
	return Math.min(60_000, 1_000 * (2 ** exponent));
}

function jobId({ queue, type, idempotencyKey }) {
	if (!idempotencyKey) return `job-${randomUUID()}`;
	const digest = createHash('sha256')
		.update(`${queue}\n${type}\n${idempotencyKey}`)
		.digest('hex')
		.slice(0, 32);
	return `job-${digest}`;
}

function boundedPayload(value) {
	const payload = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
	let encoded;
	try {
		encoded = JSON.stringify(payload);
	} catch {
		throw jobError('JOB_PAYLOAD_INVALID');
	}
	if (Buffer.byteLength(encoded) > MAX_PAYLOAD_BYTES) throw jobError('JOB_PAYLOAD_TOO_LARGE');
	return JSON.parse(encoded);
}

function boundedText(value, code, maxLength) {
	const text = String(value || '').trim();
	if (!text || text.length > maxLength) throw jobError(code);
	return text;
}

function optionalText(value, maxLength) {
	const text = String(value || '').trim();
	if (text.length > maxLength) throw jobError('JOB_TEXT_TOO_LONG');
	return text || null;
}

function boundedInteger(value, fallback, minimum, maximum) {
	const number = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : fallback;
	return Math.max(minimum, Math.min(maximum, number));
}

function jobError(code, statusCode = 400) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	JOB_KIND,
	activeJob,
	createJobRecord,
	finalJob,
	jobError,
	retryDelayMs
};
