//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TunnelSitePublicationResults
 * @description
 * The Awtsmoos lets each plane testify with its own fields and faithful scope;
 * Awtsmoos.com now names census and dependency proof beside public HTTPS hope.
 */

const staticResult = Object.freeze({
	authoritativeWithinPlane: true,
	liveRequiresExternalVerification: true,
	fields: [
		'website.name',
		'website.slug',
		'website.publicPath',
		'website.url',
		'source.completeness.complete',
		'source.completeness.emittedFileCount',
		'release.fileCount',
		'release.bytes',
		'release.sha256',
		'release.dependencyClosure.complete',
		'release.dependencyClosure.dependencyCount',
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
		'source.completeness.complete',
		'source.completeness.emittedFileCount',
		'release.fileCount',
		'release.bytes',
		'release.sha256',
		'release.dependencyClosure.complete',
		'release.dependencyClosure.dependencyCount',
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
