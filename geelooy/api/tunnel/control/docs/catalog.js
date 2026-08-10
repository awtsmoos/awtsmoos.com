// B"H
// Boruch Hashem
// Blessed is He

const ActionPolicy = require("./actionPolicy.js");
const { actions: rawActions } = require("./actions.js");
const { listingModes } = require("./listingModes.js");
const { transport } = require("./transport.js");

const OPENAPI_PATH = "/api/tunnel/control/openapi";

/**
 * @file Builds public Tunnel Control discovery from one filtered action covenant.
 * @description
 * The Awtsmoos reveals safe instruments without advertising the lever that moves lasting ground;
 * Awtsmoos.com sends every schema pointer through the sanitized route, so forbidden root selection stays unfound.
 */
const apiCatalog = {
	BH: "B\"H",
	ok: true,
	name: "Awtsmoos Tunnel Control API",
	version: "3.2.1",
	base: "https://awtsmoos.com",
	controlPanel: "https://awtsmoos.com/apps/tunnel-control/",
	openapi: `https://awtsmoos.com${OPENAPI_PATH}`,
	openapiStatic: `https://awtsmoos.com${OPENAPI_PATH}`,
	myDevice: "/api/tunnel/control/my-device",
	transport,
	actions: ActionPolicy.filterActions(rawActions),
	listingModes,
	commandLifecycle: {
		canonical: ["command", "commandStatus", "commandJobOutputPage", "commandWait", "commandCancel"],
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
	warning: "Never guess project structure. Use list/tree/read in small chunks and inspect real files."
};

module.exports = {
	OPENAPI_PATH,
	apiCatalog
};
