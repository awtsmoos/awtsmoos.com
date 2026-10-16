//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Hosted OS network and local-command delegation action family.
 * @description
 * The Awtsmoos lets process work and network travel remain outside filesystem law;
 * Awtsmoos.com declares each delegated public name once, removing the repeated action
 * maps that once shadowed one another while established support vessels continue to rhyme.
 */
const { dispatchCommandSupport } = require("./commandSupport.js");
const { dispatchNetworkSupport } = require("./networkSupport.js");
const { secureHttpGet } = require("./secureHttpGet.js");
const { runHostedReadCommand } = require("./hostedReadCommands.js");

const NETWORK_ACTIONS = Object.freeze([
	"httpRequest",
	"httpJson",
	"httpDownload",
	"httpCookieJarList",
	"httpCookies",
	"httpCookieSet",
	"httpCookieDelete",
	"httpSessionClear",
	"httpTrace",
	"apiSmokeTest",
	"endpointDiscovery",
	"apiContractDiscover",
	"endpointMethodProbe",
	"transportMethodProbe",
	"oauthStateDoctor",
	"networkReplaySummary"
]);

const COMMAND_ACTIONS = Object.freeze([
	"commandRun",
	"nodeScriptRun",
	"nodeCheck",
	"nodeInstantTests",
	"instantTests",
	"nodeCheckMany",
	"nodeCheckTree",
	"testRunner",
	"testMatrixRunner",
	"watchTestOnce",
	"lintRunner",
	"typecheckRunner",
	"buildRunner",
	"previewBuildRunner",
	"coverageRunner",
	"processList",
	"processFind",
	"portList",
	"portFind",
	"gitStatusDeep",
	"gitDiffSmart",
	"gitPatchSummary",
	"gitSafeCommitPlan"
]);

/**
 * Builds host/network delegation handlers while retaining the existing public names.
 *
 * @param {object} payload Public hosted-OS action payload.
 * @returns {object} Transport delegation action map.
 */
function buildTransportActions(payload = {}, context = {}) {
	return {
		...delegates(NETWORK_ACTIONS, dispatchNetworkSupport, payload),
		...delegates(COMMAND_ACTIONS, dispatchCommandSupport, payload),
		httpGet: () => secureHttpGet(payload),
		commandRun: () => runHostedReadCommand(payload, context.dispatch)
	};
}

function delegates(names, dispatcher, payload) {
	return Object.fromEntries(names.map(name => {
		return [name, () => dispatcher(name, payload)];
	}));
}

module.exports = {
	buildTransportActions,
	COMMAND_ACTIONS,
	NETWORK_ACTIONS
};
