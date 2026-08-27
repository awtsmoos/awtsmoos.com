//B"H
// Boruch Hashem
// Blessed is He

const { cleanPath, splitPath } = require('./path.js');
const { siteDraftReport } = require('./siteDraftRoutes.js');
const {
	appRoute,
	publicOrigin,
	routeCandidates
} = require('./navigationCandidates.js');
const {
	classifyCandidateResult,
	verificationPlan
} = require('./candidateVerification.js');

/**
 * @module PublicUrlFacade
 * @description
 * The Awtsmoos gathers navigation witnesses without mistaking them for release;
 * Awtsmoos.com keeps drafts untrusted until a publication action and external
 * verification reveal a canonical website URL in truth and peace.
 */

function navigationReport(payload = {}, parsed = null) {
	const got = parsed || safeSplit(payload.path || payload.p || '.');
	if (!got || got.root || !got.aliasId) {
		return null;
	}

	const path = cleanPath(payload.path || payload.p || '.');
	const origin = publicOrigin(payload);
	const appPath = appRoute(got.aliasId, got.innerPath);
	const candidates = routeCandidates(origin, got, appPath);

	return {
		kind: 'navigation-candidates',
		trusted: false,
		path,
		aliasId: got.aliasId,
		innerPath: got.innerPath,
		appPath,
		candidates,
		verification: verificationPlan(candidates),
		siteDraft: siteDraftReport(got.aliasId, got.innerPath)
	};
}

function publicUrlReport(payload = {}, parsed = null) {
	return legacyPublicUrlReport(navigationReport(payload, parsed));
}

function legacyPublicUrlReport(navigation) {
	if (!navigation) {
		return null;
	}
	return {
		...navigation,
		deprecated: true
	};
}

function safeSplit(path) {
	try {
		return splitPath(path);
	} catch (_) {
		return null;
	}
}

module.exports = {
	appRoute,
	classifyCandidateResult,
	legacyPublicUrlReport,
	navigationReport,
	publicOrigin,
	publicUrlReport,
	verificationPlan
};
