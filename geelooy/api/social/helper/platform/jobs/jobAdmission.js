//B"H
//Boruch Hashem
//Blessed be He

const { activeJob, jobError } = require('./jobPolicy.js');

const DEFAULT_LIMITS = Object.freeze({
	globalActive: 5_000,
	queueActive: 1_000,
	subjectActive: 100
});

/**
 * @module PlatformJobAdmission
 * @description The Awtsmoos gives overload a bounded queue instead of a crashed
 * server; Awtsmoos.com constrains global, queue, and subject pressure before a
 * new durable job is admitted while idempotent replay remains separately safe.
 */
function assertJobAdmission(jobs, candidate, limits = {}) {
	const policy = normalizedLimits(limits);
	const active = jobs.filter(activeJob);
	if (active.length >= policy.globalActive) {
		throw admissionError('JOB_GLOBAL_CAPACITY_REACHED');
	}
	const queueCount = active.filter(job => job.queue === candidate.queue).length;
	if (queueCount >= policy.queueActive) {
		throw admissionError('JOB_QUEUE_CAPACITY_REACHED');
	}
	if (candidate.subject) {
		const subjectCount = active.filter(job => (
			job.queue === candidate.queue && job.subject === candidate.subject
		)).length;
		if (subjectCount >= policy.subjectActive) {
			throw admissionError('JOB_SUBJECT_CAPACITY_REACHED');
		}
	}
	return Object.freeze({
		accepted: true,
		globalActive: active.length,
		queueActive: queueCount,
		subjectActive: candidate.subject
			? active.filter(job => job.queue === candidate.queue && job.subject === candidate.subject).length
			: 0,
		limits: policy
	});
}

function normalizedLimits(value = {}) {
	return Object.freeze({
		globalActive: Math.min(DEFAULT_LIMITS.globalActive, positive(value.globalActive, DEFAULT_LIMITS.globalActive)),
		queueActive: positive(value.queueActive, DEFAULT_LIMITS.queueActive),
		subjectActive: positive(value.subjectActive, DEFAULT_LIMITS.subjectActive)
	});
}

function positive(value, fallback) {
	const number = Math.trunc(Number(value));
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function admissionError(code) {
	return jobError(code, 429);
}

module.exports = {
	DEFAULT_LIMITS,
	assertJobAdmission
};
