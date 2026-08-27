//B"H
// Boruch Hashem
// Blessed is He

const {
	bootstrapSiteProject
} = require('../../../../../social/helper/drive/siteProjectBootstrap.js');
const {
	getOwnedSitePublicationStatus,
	unpublishOwnedSite
} = require('../../../../../social/helper/drive/sitePublicationService.js');
const {
	publishSiteFolder
} = require('../../../../../../sites/siteFolderPublication.js');
const {
	SITE_PUBLICATION_STATUS_ACTION,
	SITE_PUBLISH_BOOTSTRAP_ACTION,
	SITE_PUBLISH_FOLDER_ACTION,
	SITE_UNPUBLISH_ACTION
} = require('./sitePublicationActions.js');
const {
	normalizeSitePublicationInput
} = require('./sitePublicationInput.js');

/**
 * @module HostedSitePublicationDispatcher
 * @description
 * The Awtsmoos turns one authenticated hosted identity into explicit publish,
 * status, and unpublish deeds. Awtsmoos.com lets payload choose resources and
 * mode while trusted server context alone supplies identity and authority.
 */

const DEFAULT_DEPENDENCIES = Object.freeze({
	bootstrapSiteProject,
	getOwnedSitePublicationStatus,
	publishSiteFolder,
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
