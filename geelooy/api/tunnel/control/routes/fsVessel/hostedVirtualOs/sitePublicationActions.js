//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostedSitePublicationActions
 * @description
 * The Awtsmoos gives each site deed an explicit name so reading, mapping,
 * unmapping, and manifest bootstrap cannot hide inside ordinary filesystem
 * actions. Awtsmoos.com lets authority policy recognize every gate exactly.
 */

const SITE_PUBLISH_BOOTSTRAP_ACTION = 'sitePublishBootstrap';
const SITE_PUBLISH_FOLDER_ACTION = 'sitePublishFolder';
const SITE_PUBLICATION_STATUS_ACTION = 'sitePublicationStatus';
const SITE_UNPUBLISH_ACTION = 'siteUnpublish';

const SITE_PUBLICATION_ACTIONS = Object.freeze([
	SITE_PUBLISH_BOOTSTRAP_ACTION,
	SITE_PUBLISH_FOLDER_ACTION,
	SITE_PUBLICATION_STATUS_ACTION,
	SITE_UNPUBLISH_ACTION
]);

const SITE_PUBLICATION_WRITE_ACTIONS = Object.freeze([
	SITE_PUBLISH_BOOTSTRAP_ACTION,
	SITE_PUBLISH_FOLDER_ACTION,
	SITE_UNPUBLISH_ACTION
]);

function isSitePublicationAction(action) {
	return SITE_PUBLICATION_ACTIONS.includes(String(action || ''));
}

function isSitePublicationWriteAction(action) {
	return SITE_PUBLICATION_WRITE_ACTIONS.includes(String(action || ''));
}

module.exports = {
	SITE_PUBLICATION_ACTIONS,
	SITE_PUBLICATION_STATUS_ACTION,
	SITE_PUBLICATION_WRITE_ACTIONS,
	SITE_PUBLISH_BOOTSTRAP_ACTION,
	SITE_PUBLISH_FOLDER_ACTION,
	SITE_UNPUBLISH_ACTION,
	isSitePublicationAction,
	isSitePublicationWriteAction
};
