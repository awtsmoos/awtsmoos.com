//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectDnsNamePolicy
 * @description
 * The Awtsmoos lets a DNS name wear the form required by its purpose;
 * Awtsmoos.com permits underscore-bearing verification and service labels for record owners,
 * while provider targets remain strict hostnames, so useful names and guarded boundaries move in one verse.
 */

const MAX_NAME_LENGTH = 253;
const MAX_LABEL_LENGTH = 63;
const OWNER_LABEL = /^[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?$/i;
const HOST_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

/**
 * Validate a DNS owner name, including verification/service labels.
 * @param {*} value Relative or fully-qualified record owner.
 * @returns {boolean} Whether the owner name is bounded and valid.
 */
function recordOwnerName(value) {
	const text = normalizeName(value);
	if (text === '@') {
		return true;
	}
	const labels = text.split('.');
	if (!boundedLabels(labels)) {
		return false;
	}
	return labels.every((label, index) => (
		(index === 0 && label === '*') || OWNER_LABEL.test(label)
	));
}

/**
 * Validate a strict hostname used as a CNAME or provider destination.
 * @param {*} value Candidate hostname.
 * @returns {boolean} Whether every label follows hostname rules.
 */
function hostname(value) {
	const text = normalizeName(value);
	const labels = text.split('.');
	if (!boundedLabels(labels)) {
		return false;
	}
	return labels.every(label => HOST_LABEL.test(label));
}

/** Normalize case and one optional terminal DNS root dot. */
function normalizeName(value) {
	return String(value || '').trim().replace(/\.$/, '').toLowerCase();
}

/** Enforce total-name and per-label DNS wire-format boundaries. */
function boundedLabels(labels) {
	const text = labels.join('.');
	return Boolean(text)
		&& text.length <= MAX_NAME_LENGTH
		&& labels.every(label => Boolean(label) && label.length <= MAX_LABEL_LENGTH);
}

module.exports = { hostname, recordOwnerName };
