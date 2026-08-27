//B"H
// Boruch Hashem
// Blessed is He

const {
	driveResult,
	publicRootResult,
	staticResult
} = require('./sitePublicationResults.js');
const { websitePublishingGuide } = require('./websitePublishingGuide.js');

/**
 * @module TunnelSitePublicationCatalog
 * @description
 * The Awtsmoos turns one owned folder into one discoverable website covenant;
 * Awtsmoos.com teaches agents the simple deed first while advanced public-root
 * and legacy Drive/Sites vessels remain explicit, bounded, and never blurred.
 */

const actionCatalog = Object.freeze({
	publishWebsite: {
		summary: 'Publish any owned Virtual OS folder as a verified static website.',
		scope: 'tunnel.write',
		mutation: true,
		plane: 'public-root-static',
		vessels: ['virtual-os'],
		params: ['path', 'name?', 'entryFile?', 'verify=true'],
		result: staticResult,
		replay: 'atomic-reconcile-before-replay',
		examples: [
			{ path: 'asdf/projects/family-page' },
			{ path: 'asdf/drafts/landing', name: 'Mitzvah Light' }
		]
	},
	publicRootPublishFolder: {
		summary: 'Advanced static deploy with an explicit geelooy-relative public path.',
		scope: 'tunnel.write',
		mutation: true,
		plane: 'public-root-static',
		vessels: ['virtual-os'],
		params: ['path', 'publicPath', 'entryFile?', 'verify=true'],
		result: publicRootResult,
		replay: 'atomic-reconcile-before-replay'
	},
	sitePublishBootstrap: driveAction(
		'Publish an explicit bounded manifest into the legacy Drive/Sites plane.',
		['aliasId', 'projectId', 'siteId', 'rootPath', 'files']
	),
	sitePublishFolder: driveAction(
		'Publish an owned folder into the separate Drive/Sites dynamic plane.',
		['path', 'siteId', 'mode=direct|snapshot']
	),
	sitePublicationStatus: {
		summary: 'Read Drive/Sites state; this does not describe static geelooy deployment.',
		scope: 'tunnel.read',
		mutation: false,
		plane: 'drive-sites-dynamic',
		vessels: ['virtual-os', 'native-tunnel'],
		params: ['aliasId', 'siteId'],
		result: driveResult,
		replay: 'safe-read'
	},
	siteUnpublish: {
		summary: 'Remove a Drive/Sites mapping without deleting source bytes.',
		scope: 'tunnel.write',
		mutation: true,
		plane: 'drive-sites-dynamic',
		vessels: ['virtual-os', 'native-tunnel'],
		params: ['aliasId', 'siteId'],
		result: { fields: ['publication.mapped=false'] },
		replay: 'reconcile-before-replay'
	}
});

function driveAction(summary, params) {
	return {
		summary,
		scope: 'tunnel.write',
		mutation: true,
		plane: 'drive-sites-dynamic',
		vessels: ['virtual-os', 'native-tunnel'],
		params,
		result: driveResult,
		replay: 'reconcile-before-replay'
	};
}

const setup = Object.freeze({
	virtualOs: {
		availableWithoutAgent: true,
		routeReference: 'awtsmoos-virtual-os'
	},
	websitePublishing: websitePublishingGuide
});

module.exports = {
	actionCatalog,
	setup
};
