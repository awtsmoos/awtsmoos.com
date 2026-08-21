//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TunnelSitePublicationResults
 * @description
 * The Awtsmoos lets each plane testify with its own fields and faithful scope;
 * Awtsmoos.com keeps static release proof distinct from the legacy Drive hope.
 */

const staticResult = Object.freeze({
	authoritativeWithinPlane: true,
	liveRequiresExternalVerification: true,
	fields: [
		'website.name',
		'website.slug',
		'website.publicPath',
		'website.url',
		'release.fileCount',
		'release.bytes',
		'release.sha256',
		'publication.canonicalVerifiedLive'
	]
});

const publicRootResult = Object.freeze({
	authoritativeWithinPlane: true,
	liveRequiresExternalVerification: true,
	fields: [
		'deployment.publicPath',
		'deployment.productionTarget',
		'publication.canonicalUrl',
		'release.fileCount',
		'release.bytes',
		'release.sha256',
		'publication.canonicalVerifiedLive'
	]
});

const driveResult = Object.freeze({
	authoritativeWithinPlane: true,
	liveRequiresExternalVerification: true,
	fields: [
		'publication.canonicalUrl',
		'publication.source',
		'publication.sourceAvailable',
		'publication.entryReady',
		'publication.canonicalVerifiedLive'
	]
});

module.exports = {
	driveResult,
	publicRootResult,
	staticResult
};
