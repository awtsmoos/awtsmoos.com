//B"H
// Boruch Hashem
// Blessed is He

const { bootstrapSiteProject } = require('../api/social/helper/drive/siteProjectBootstrap.js');
const { upsertSiteMapping } = require('../api/social/helper/drive/siteMappingService.js');
const { getSitePublicationStatus } = require('../api/social/helper/drive/sitePublicationStatus.js');
const { aliasOwned } = require('../api/tunnel/control/routes/osFs/aliases.js');
const { collectHostedFolderManifest } = require('./hostedFolderManifest.js');
const { directSiteReadiness } = require('./directSiteReadiness.js');
const { directMappingInput, snapshotBootstrapInput } = require('./siteFolderPublicationInput.js');
const {
	MODES,
	assertSourceOwned,
	parsePublicationTarget,
	publicationError
} = require('./siteFolderPublicationPolicy.js');

/**
 * @module SiteFolderPublication
 * @description
 * The Awtsmoos lets one owned hosted folder become a canonical site either as
 * living source or bounded snapshot. Awtsmoos.com keeps the hosted source root
 * distinct from the default Drive snapshot root, then reads canonical status
 * back so public URL testimony is never guessed.
 */

const DEFAULT_DEPENDENCIES = Object.freeze({
	aliasOwned,
	bootstrapSiteProject,
	collectHostedFolderManifest,
	directSiteReadiness,
	getSitePublicationStatus,
	upsertSiteMapping
});

async function publishSiteFolder(options = {}) {
	const dependencies = options.dependencies || DEFAULT_DEPENDENCIES;
	const { source, siteId, mode } = parsePublicationTarget(options);
	await assertSourceOwned(
		dependencies,
		options.$i,
		options.actorUserId,
		source.aliasId
	);
	if (mode === MODES.SNAPSHOT) {
		return publishSnapshot(dependencies, options, source, siteId);
	}
	return publishDirect(dependencies, options, source, siteId);
}

async function publishDirect(dependencies, options, source, siteId) {
	const readiness = await dependencies.directSiteReadiness(
		options.$i,
		source.aliasId,
		source.innerPath
	);
	if (!readiness.sourceAvailable) throw publicationError('SITE_SOURCE_NOT_FOUND');
	if (!readiness.entryReady) throw publicationError('SITE_ENTRY_NOT_READY');
	const result = await dependencies.upsertSiteMapping({
		$i: options.$i,
		aliasId: source.aliasId,
		siteId,
		input: directMappingInput(options, source.innerPath)
	});
	return finalize(dependencies, options.$i, source, siteId, MODES.DIRECT, result);
}

async function publishSnapshot(dependencies, options, source, siteId) {
	const files = await dependencies.collectHostedFolderManifest(
		options.$i,
		source.aliasId,
		source.innerPath
	);
	const result = await dependencies.bootstrapSiteProject({
		...snapshotBootstrapInput(options),
		$i: options.$i,
		aliasId: source.aliasId,
		actorUserId: options.actorUserId,
		files,
		projectId: options.projectId || siteId,
		rootPath: options.rootPath === undefined ? `sites/${siteId}` : options.rootPath,
		siteId
	});
	return finalize(dependencies, options.$i, source, siteId, MODES.SNAPSHOT, result);
}

async function finalize(dependencies, $i, source, siteId, mode, result) {
	const status = await dependencies.getSitePublicationStatus({
		$i,
		aliasId: source.aliasId,
		siteId
	});
	return {
		mode,
		sourceRoot: source.innerPath,
		result,
		publication: status.publication,
		status
	};
}

module.exports = {
	DEFAULT_DEPENDENCIES,
	MODES,
	publishSiteFolder
};
