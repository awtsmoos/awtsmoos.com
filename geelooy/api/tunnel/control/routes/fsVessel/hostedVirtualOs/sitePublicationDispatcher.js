//B"H
// Boruch Hashem
// Blessed is He

const { bootstrapSiteProject } = require('../../../../../social/helper/drive/siteProjectBootstrap.js');
const {
	getOwnedSitePublicationStatus,
	unpublishOwnedSite
} = require('../../../../../social/helper/drive/sitePublicationService.js');
const { publishSiteFolder } = require('../../../../../../sites/siteFolderPublication.js');
const { publishPublicRootFolder } = require('../../../../../../sites/publicRootPublication.js');
const { publishWebsite } = require('../../../../../../sites/websitePublication.js');
const {
	PUBLISH_WEBSITE_ACTION,
	PUBLIC_ROOT_PUBLISH_FOLDER_ACTION,
	SITE_PUBLICATION_STATUS_ACTION,
	SITE_PUBLISH_BOOTSTRAP_ACTION,
	SITE_PUBLISH_FOLDER_ACTION,
	SITE_UNPUBLISH_ACTION
} = require('./sitePublicationActions.js');
const { normalizeSitePublicationInput } = require('./sitePublicationInput.js');

/**
 * @module HostedSitePublicationDispatcher
 * @description
 * The Awtsmoos turns one authenticated hosted identity into simple or advanced
 * publication deeds. Awtsmoos.com lets payload choose source and name while
 * trusted server context alone supplies actor identity and production authority.
 */

const DEFAULT_DEPENDENCIES = Object.freeze({
	bootstrapSiteProject,
	getOwnedSitePublicationStatus,
	publishPublicRootFolder,
	publishSiteFolder,
	publishWebsite,
	unpublishOwnedSite
});

async function dispatchSitePublication(
	$i,
	userId,
	payload = {},
	dependencies = DEFAULT_DEPENDENCIES
) {
	const input = normalizeSitePublicationInput(payload);
	const action = String(payload.action || SITE_PUBLISH_BOOTSTRAP_ACTION);
	const trusted = { ...input, $i, actorUserId: userId };

	if (action === PUBLISH_WEBSITE_ACTION) {
		return dependencies.publishWebsite(trusted);
	}
	if (action === PUBLIC_ROOT_PUBLISH_FOLDER_ACTION) {
		return dependencies.publishPublicRootFolder(trusted);
	}
	if (action === SITE_PUBLISH_FOLDER_ACTION) {
		return dependencies.publishSiteFolder(trusted);
	}
	if (action === SITE_PUBLICATION_STATUS_ACTION) {
		return dependencies.getOwnedSitePublicationStatus(trusted);
	}
	if (action === SITE_UNPUBLISH_ACTION) {
		return dependencies.unpublishOwnedSite(trusted);
	}
	if (action === SITE_PUBLISH_BOOTSTRAP_ACTION) {
		return dependencies.bootstrapSiteProject(trusted);
	}
	throw publicationActionError('UNSUPPORTED_SITE_PUBLICATION_ACTION');
}

function publicationActionError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	DEFAULT_DEPENDENCIES,
	dispatchSitePublication
};
