//B"H
// Boruch Hashem
// Blessed is He

const { quickstart } = require('./sitePublicationQuickstart.js');
const { publicationProtocol } = require('./sitePublicationProtocol.js');

/**
 * @module TunnelSitePublicationCatalog
 * @description
 * The Awtsmoos lets each publication deed reveal authority, replay law, reconciliation, and evidence while Awtsmoos.com preserves every historical result object untouched;
 * agents may move quickly, yet they can now distinguish a mutation receipt from server status and from a canonical page actually verified live.
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
	sitePublishBootstrap: action({
		summary: 'Publish a bounded source manifest through Drive.',
		params: ['aliasId', 'projectId', 'siteId', 'rootPath', 'files'],
		evidenceScope: 'workspace-and-publication'
	}),
	sitePublishFolder: action({
		summary: 'Publish any owned hosted folder directly or as a snapshot.',
		params: ['path', 'siteId', 'mode=direct|snapshot'],
		evidenceScope: 'canonical-publication',
		examples: [
			{ path: 'asdf/projects/orbit-run', siteId: 'orbit-run', mode: 'direct' },
			{ path: 'asdf/projects/orbit-run', siteId: 'orbit-run', mode: 'snapshot' }
		]
	}),
	sitePublicationStatus: action({
		summary: 'Read authoritative canonical publication and source readiness.',
		params: ['aliasId', 'siteId'],
		evidenceScope: 'canonical-publication-status',
		mutation: false
	}),
	siteUnpublish: action({
		summary: 'Remove the canonical site mapping without deleting source bytes.',
		params: ['aliasId', 'siteId'],
		evidenceScope: 'canonical-unpublication',
		result: Object.freeze({ fields: ['publication.mapped=false'] })
	})
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
	publicationProtocol: publicationProtocol(),
	publicUrlRule: 'Never derive a website URL from /geelooy/os; use publication.canonicalUrl.',
	quickstart
});

function action(options) {
	const mutation = options.mutation !== false;
	return Object.freeze({
		summary: options.summary,
		scope: mutation ? 'tunnel.write' : 'tunnel.read',
		mutation,
		vessels: ['virtual-os', 'native-tunnel'],
		params: options.params,
		result: options.result || commonResult,
		evidenceScope: options.evidenceScope,
		replay: mutation ? 'reconcile-before-replay' : 'safe-read',
		reconcileAction: mutation ? 'sitePublicationStatus' : null,
		idempotency: mutation ? 'not-provided' : 'not-applicable',
		externalVerification: 'result-derived-only',
		examples: options.examples || undefined
	});
}

module.exports = { actionCatalog, setup };
