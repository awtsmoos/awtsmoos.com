//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TunnelSitePublicationProtocol
 * @description
 * The Awtsmoos renews mapping, source, HTTP testimony, and the public URL while Awtsmoos.com refuses to turn one returned object into more certainty than it contains;
 * this interpreter reads existing publication results without changing them, revealing what was acknowledged, what was observed, and when canonical live evidence is truly present.
 */

const PROTOCOL_VERSION = 1;

/** Returns the stable machine-readable publication interpretation contract. */
function publicationProtocol() {
	return Object.freeze({
		version: PROTOCOL_VERSION,
		resultCompatibility: 'unchanged',
		mutationIdempotency: 'not-provided',
		replayLaw: 'per-action',
		externalVerification: 'result-derived-only',
		phases: ['observed', 'acknowledged'],
		externalStates: ['verified-live', 'verified-unmapped', 'not-implied']
	});
}

/**
 * Interprets one existing Tunnel publication result without wrapping or mutating it.
 * @param {string} action Canonical publication action name.
 * @param {object} result Existing action result returned by the runtime.
 * @returns {object} Lifecycle and evidence testimony derived only from observable fields.
 */
function interpretSitePublicationResult(action, result = {}) {
	const name = String(action || '');
	const mutates = name !== 'sitePublicationStatus';
	return Object.freeze({
		phase: mutates ? 'acknowledged' : 'observed',
		replay: mutates ? 'reconcile-before-replay' : 'safe-read',
		reconcileAction: mutates ? 'sitePublicationStatus' : null,
		idempotency: mutates ? 'not-provided' : 'not-applicable',
		evidenceScope: evidenceScope(name),
		externalVerification: externalVerification(name, result),
		canonicalUrl: canonicalUrl(result)
	});
}

function externalVerification(action, result) {
	if (action === 'siteUnpublish' && result?.publication?.mapped === false) {
		return 'verified-unmapped';
	}
	const publication = publicationFrom(result);
	if (publication?.canonicalVerifiedLive === true) {
		return 'verified-live';
	}
	return 'not-implied';
}

function publicationFrom(result) {
	return result?.publication
		|| result?.status?.publication
		|| result?.testimony?.publication?.primary
		|| null;
}

function canonicalUrl(result) {
	return publicationFrom(result)?.canonicalUrl || null;
}

function evidenceScope(action) {
	if (action === 'siteUnpublish') {
		return 'canonical-unpublication';
	}
	if (action === 'sitePublicationStatus') {
		return 'canonical-publication-status';
	}
	if (action === 'sitePublishBootstrap') {
		return 'workspace-and-publication';
	}
	return 'canonical-publication';
}

module.exports = {
	PROTOCOL_VERSION,
	interpretSitePublicationResult,
	publicationProtocol
};
