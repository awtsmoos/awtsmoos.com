//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CandidateVerification
 * @description
 * The Awtsmoos lets a suggested route receive measured testimony without
 * letting one successful render become authority over canonical publication.
 * Awtsmoos.com keeps navigation guesses separate from verified website release.
 */

function verificationPlan(candidates = []) {
	return {
		required: true,
		actions: ['httpRequest', 'simulateRuntime'],
		candidates,
		rejectPatterns: ['DYN_ROUTE_NOT_FOUND', 'Cannot GET', '404', 'not found'],
		acceptSignals: ['status 200', 'expected title', 'expected DOM', 'non-empty HTML'],
		guidance: 'Treat navigation candidates as untrusted. For a real static website, use publishWebsite and report its canonical URL only when publication.canonicalVerifiedLive is true. Drive/Sites publishing is a separate plane.'
	};
}

function classifyCandidateResult(result = {}) {
	const status = Number(
		result.status
		|| result.statusCode
		|| result.response?.status
		|| 0
	);
	const body = String(
		result.body
		|| result.text
		|| result.content
		|| result.html
		|| result.stdout
		|| ''
	);
	const lower = body.toLowerCase();
	const rejected = status >= 400
		|| body.includes('DYN_ROUTE_NOT_FOUND')
		|| lower.includes('cannot get')
		|| lower.includes('not found');

	if (rejected) {
		return rejectedResult(status, body);
	}

	const accepted = status === 200
		|| /<html|<!doctype|<body|<div|<main|<script/i.test(body);

	return {
		ok: accepted,
		verdict: accepted ? 'candidate_verified' : 'inconclusive',
		status,
		reason: accepted ? 'render_signal_found' : 'no_render_signal'
	};
}

function rejectedResult(status, body) {
	let reason = 'not_found_text';
	if (body.includes('DYN_ROUTE_NOT_FOUND')) {
		reason = 'DYN_ROUTE_NOT_FOUND';
	} else if (status >= 400) {
		reason = `http_${status}`;
	}

	return {
		ok: false,
		verdict: 'rejected',
		status,
		reason
	};
}

module.exports = {
	classifyCandidateResult,
	verificationPlan
};
