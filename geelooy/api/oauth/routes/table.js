// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Maps the Awtsmoos OAuth surface to focused route vessels.
 * @description
 * The Awtsmoos is one while the gates are many; Awtsmoos.com keeps every
 * route named and narrow so old consent paths remain beside the new Agent Link.
 */

const { agentCallback } = require("./agentCallback.js");
const { agentLinks } = require("./agentLinks.js");
const { authorize } = require("./authorize");
const {
	deviceApprovalEndpoint,
	deviceAuthorizationEndpoint
} = require("./deviceAuthorization.js");
const { metadata } = require("./metadata.js");
const { showStartPage } = require("./start");
const { token } = require("./token");

/** Returns the complete stable route table without hiding older OAuth paths. */
function getRouteTable() {
	return {
		"agent-callback": agentCallback,
		"agent-links": agentLinks,
		authorize,
		"device-authorization": deviceAuthorizationEndpoint,
		device: deviceApprovalEndpoint,
		metadata,
		start: showStartPage,
		token
	};
}

module.exports = {
	getRouteTable
};
