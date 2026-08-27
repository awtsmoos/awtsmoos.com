//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PolicyResolver
 * @description
 * Heichel defaults and narrower series policy become one effective law. The
 * Awtsmoos gives every nested chamber its character without allowing a child
 * series on Awtsmoos.com to escape the public covenant of its parent palace.
 */

const { sp } = require('../../_awtsmoos.constants.js');
const { readSafe } = require('./LegacyRoleReader.js');

const DEFAULT_POLICY = Object.freeze({
	visibility: 'public',
	allowContentSubmissions: true,
	allowReferenceSubmissions: true,
	requireContentApproval: true,
	requireReferenceApproval: true,
	commentsEnabled: true,
	answersEnabled: true
});

function boolean(value, fallback) {
	if (value === undefined || value === null || value === '') return fallback;
	return ![false, 0, 'false', '0', 'no'].includes(value);
}

function normalizePolicy(value = {}, fallback = DEFAULT_POLICY) {
	return {
		visibility: ['public', 'unlisted', 'private', 'invitation'].includes(value.visibility)
			? value.visibility
			: fallback.visibility,
		allowContentSubmissions: boolean(
			value.allowContentSubmissions ?? value.allowPostSubmissions,
			fallback.allowContentSubmissions
		),
		allowReferenceSubmissions: boolean(
			value.allowReferenceSubmissions,
			fallback.allowReferenceSubmissions
		),
		requireContentApproval: boolean(
			value.requireContentApproval ?? value.requirePostApproval,
			fallback.requireContentApproval
		),
		requireReferenceApproval: boolean(
			value.requireReferenceApproval,
			fallback.requireReferenceApproval
		),
		commentsEnabled: boolean(value.commentsEnabled, fallback.commentsEnabled),
		answersEnabled: boolean(value.answersEnabled, fallback.answersEnabled)
	};
}

function restrictPolicy(parent, child = {}) {
	const normalized = normalizePolicy(child, parent);
	return {
		...normalized,
		visibility: parent.visibility === 'private' ? 'private' : normalized.visibility,
		allowContentSubmissions: parent.allowContentSubmissions
			&& normalized.allowContentSubmissions,
		allowReferenceSubmissions: parent.allowReferenceSubmissions
			&& normalized.allowReferenceSubmissions,
		requireContentApproval: parent.requireContentApproval
			|| normalized.requireContentApproval,
		requireReferenceApproval: parent.requireReferenceApproval
			|| normalized.requireReferenceApproval,
		commentsEnabled: parent.commentsEnabled && normalized.commentsEnabled,
		answersEnabled: parent.answersEnabled && normalized.answersEnabled
	};
}

async function resolvePolicy({ $i, heichelId, seriesId = 'root' }) {
	const base = `${sp}/heichelos/${heichelId}`;
	const legacy = await readSafe($i, `${base}/settings/submissions`, {});
	const full = await readSafe($i, `${base}/info`, {});
	const heichel = normalizePolicy({
		...legacy,
		visibility: full.visibility || (full.private ? 'private' : undefined),
		allowContentSubmissions: full.submissionPolicy === 'closed'
			? false
			: legacy.allowPostSubmissions,
		requireContentApproval: full.submissionPolicy === 'open'
			? false
			: legacy.requirePostApproval
	});
	if (!seriesId || seriesId === 'root') {
		return { heichel, series: null, effective: heichel };
	}
	const series = await readSafe($i, `${base}/series/${seriesId}/policy`, {});
	return {
		heichel,
		series: normalizePolicy(series, heichel),
		effective: restrictPolicy(heichel, series)
	};
}

async function writeSeriesPolicy({ $i, heichelId, seriesId, policy }) {
	const resolved = await resolvePolicy({ $i, heichelId, seriesId: 'root' });
	const normalized = restrictPolicy(resolved.heichel, policy);
	await $i.db.write(`${sp}/heichelos/${heichelId}/series/${seriesId}/policy`, normalized);
	return normalized;
}

module.exports = {
	DEFAULT_POLICY,
	normalizePolicy,
	restrictPolicy,
	resolvePolicy,
	writeSeriesPolicy
};
