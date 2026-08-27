//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TunnelSitePublicationCatalog
 * @description
 * The Awtsmoos lets each publication action reveal its scope, vessel, input,
 * result, and replay law from one machine-readable covenant. Awtsmoos.com no
 * longer needs a human renderer to guess what “no params” was meant to hide.
 */

const commonResult = Object.freeze({
	authoritative: true,
	fields: [
		'publication.canonicalUrl',
		'publication.source',
		'publication.sourceAvailable',
		'publication.entryReady',
		'publication.canonicalVerifiedLive'
	]
});

const actionCatalog = Object.freeze({
	sitePublishBootstrap: {
		summary: 'Publish an explicit bounded source manifest through Drive.',
		scope: 'tunnel.write',
		mutation: true,
		vessels: ['virtual-os', 'native-tunnel'],
		params: ['aliasId', 'projectId', 'siteId', 'rootPath', 'files'],
		result: commonResult,
		replay: 'reconcile-before-replay'
	},
	sitePublishFolder: {
		summary: 'Publish any owned hosted folder directly or as a snapshot.',
		scope: 'tunnel.write',
		mutation: true,
		vessels: ['virtual-os', 'native-tunnel'],
		params: ['path', 'siteId', 'mode=direct|snapshot'],
		result: commonResult,
		replay: 'reconcile-before-replay',
		examples: [
			{ path: 'asdf/projects/orbit-run', siteId: 'orbit-run', mode: 'direct' },
			{ path: 'asdf/projects/orbit-run', siteId: 'orbit-run', mode: 'snapshot' }
		]
	},
	sitePublicationStatus: {
		summary: 'Read authoritative canonical publication and source readiness.',
		scope: 'tunnel.read',
		mutation: false,
		vessels: ['virtual-os', 'native-tunnel'],
		params: ['aliasId', 'siteId'],
		result: commonResult,
		replay: 'safe-read'
	},
	siteUnpublish: {
		summary: 'Remove the canonical site mapping without deleting source bytes.',
		scope: 'tunnel.write',
		mutation: true,
		vessels: ['virtual-os', 'native-tunnel'],
		params: ['aliasId', 'siteId'],
		result: { fields: ['publication.mapped=false'] },
		replay: 'reconcile-before-replay'
	}
});

const setup = Object.freeze({
	oauth: {
		preferred: true,
		discovery: '/api/tunnel/control/my-device',
		routingField: 'routeReference',
		rule: 'Auto-use one live owned route; ask only when device choice is needed.'
	},
	virtualOs: {
		availableWithoutAgent: true,
		routeReference: 'awtsmoos-virtual-os'
	},
	publicUrlRule: 'Never derive a website URL from /geelooy/os; use publication.canonicalUrl.'
});

module.exports = {
	actionCatalog,
	setup
};
