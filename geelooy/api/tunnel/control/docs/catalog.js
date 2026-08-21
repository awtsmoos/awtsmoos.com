//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical public discovery catalog for Awtsmoos Tunnel Control.
 * @description
 * The Awtsmoos gives human docs, machine manifests, OAuth routing, and action
 * contracts one source of truth. Awtsmoos.com preserves the flat action list
 * while richer contracts reveal parameters, authority, vessels, and replay law.
 */

const ActionPolicy = require('./actionPolicy.js');
const { actions: rawActions } = require('./actions.js');
const { listingModes } = require('./listingModes.js');
const { BASE_URL, oauth } = require('./oauthCatalog.js');
const { actionCatalog, setup: publicationSetup } = require('./sitePublicationCatalog.js');
const { transport } = require('./transport.js');

const OPENAPI_PATH = '/api/tunnel/control/openapi';

const agentLinks = Object.freeze({
	tunnelControl: `${BASE_URL}/apps/tunnel-control/`,
	docs: `${BASE_URL}/api/tunnel/control/docs`,
	docsJson: `${BASE_URL}/api/tunnel/control/docs.json`,
	openapi: `${BASE_URL}${OPENAPI_PATH}`,
	bootstrap: `${BASE_URL}/api/tunnel/control/bootstrap`,
	agentManifest: `${BASE_URL}/api/tunnel/control/agent-manifest`,
	oauthMetadata: oauth.metadataEndpoint,
	oauthMetadataAlias: oauth.metadataAlias,
	deviceLogin: oauth.deviceVerificationUri,
	myDevice: `${BASE_URL}/api/tunnel/control/my-device`,
	codeEditor: `${BASE_URL}/apps/code`,
	virtualOs: `${BASE_URL}/os`
});

const actions = ActionPolicy.filterActions([
	...rawActions,
	...Object.keys(actionCatalog)
]);

const setup = Object.freeze({
	...publicationSetup,
	install: {
		windows: 'irm https://awtsmoos.com/api/tunnel/install/windows | iex',
		macLinux: 'curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash',
		rule: 'Rerun the same installer to refresh an existing saved native agent.'
	}
});

const apiCatalog = {
	BH: 'B"H',
	ok: true,
	name: 'Awtsmoos Tunnel Control API',
	version: '3.7.0',
	base: BASE_URL,
	controlPanel: agentLinks.tunnelControl,
	openapi: agentLinks.openapi,
	openapiStatic: agentLinks.openapi,
	myDevice: '/api/tunnel/control/my-device',
	recommendedClientId: oauth.recommendedClientId,
	agentLinks,
	oauth,
	setup,
	transport,
	actions,
	actionCatalog,
	listingModes,
	commandLifecycle: {
		canonical: [
			'command', 'commandStatus', 'commandJobOutputPage',
			'commandWait', 'commandCancel'
		],
		aliases: {
			commandWait: ['commandJobWait', 'waitForJob', 'jobWait'],
			commandStatus: ['commandPoll', 'commandJobStatus'],
			commandJobOutputPage: ['commandOutputPage']
		},
		jobIdCarriers: ['jobId', 'id', 'params.jobId', 'params.id'],
		compatibility: 'Existing commandRun/commandStart behavior is preserved; lifecycle fields are promoted from params and top-level payloads.'
	},
	defaults: {
		maxFiles: 3,
		maxChars: 8000,
		totalMaxChars: 24000,
		treeDepth: 2,
		treeLimit: 150
	},
	warning: 'Authenticate first. Prefer publishWebsite for owned Virtual OS folders, and report a website live only when publication.canonicalVerifiedLive is true.'
};

module.exports = {
	BASE_URL,
	OPENAPI_PATH,
	actionCatalog,
	agentLinks,
	apiCatalog,
	oauth,
	setup
};
