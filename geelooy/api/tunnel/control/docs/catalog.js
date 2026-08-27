// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical public discovery catalog for Awtsmoos Tunnel Control.
 * @description
 * The Awtsmoos is one truth behind human page, OpenAPI, and machine manifest;
 * Awtsmoos.com publishes callback and headless authorization beside immutable
 * routing so every capable agent can discover the covenant from one source.
 */

const ActionPolicy = require("./actionPolicy.js");
const { actions: rawActions } = require("./actions.js");
const { listingModes } = require("./listingModes.js");
const { BASE_URL, oauth } = require("./oauthCatalog.js");
const { transport } = require("./transport.js");

const OPENAPI_PATH = "/api/tunnel/control/openapi";

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

const apiCatalog = {
	BH: "B\"H",
	ok: true,
	name: "Awtsmoos Tunnel Control API",
	version: "3.5.0",
	base: BASE_URL,
	controlPanel: agentLinks.tunnelControl,
	openapi: agentLinks.openapi,
	openapiStatic: agentLinks.openapi,
	myDevice: "/api/tunnel/control/my-device",
	recommendedClientId: oauth.recommendedClientId,
	agentLinks,
	oauth,
	transport,
	actions: ActionPolicy.filterActions(rawActions),
	listingModes,
	commandLifecycle: {
		canonical: [
			"command",
			"commandStatus",
			"commandJobOutputPage",
			"commandWait",
			"commandCancel"
		],
		aliases: {
			commandWait: ["commandJobWait", "waitForJob", "jobWait"],
			commandStatus: ["commandPoll", "commandJobStatus"],
			commandJobOutputPage: ["commandOutputPage"]
		},
		jobIdCarriers: ["jobId", "id", "params.jobId", "params.id"],
		compatibility: "Existing commandRun/commandStart behavior is preserved; lifecycle fields are promoted from params and top-level payloads."
	},
	defaults: {
		maxFiles: 3,
		maxChars: 8000,
		totalMaxChars: 24000,
		treeDepth: 2,
		treeLimit: 150
	},
	warning: "Authenticate, call my-device, route by immutable routeReference/tunnelId, and inspect real files before editing."
};

module.exports = {
	BASE_URL,
	OPENAPI_PATH,
	agentLinks,
	apiCatalog,
	oauth
};
