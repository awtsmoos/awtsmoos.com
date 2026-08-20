// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OAuth route table for Awtsmoos.com.
 * @description
 * The Awtsmoos is one before every path; callback authorization, device
 * authorization, human verification, metadata, and token exchange remain named
 * vessels so no unknown route can impersonate a security gate.
 */

const { agentCallback } = require("./agentCallback.js");
const { authorize } = require("./authorize.js");
const { deviceAuthorization } = require("./deviceAuthorization.js");
const { deviceVerification } = require("./deviceVerification.js");
const { metadata } = require("./metadata.js");
const { start } = require("./start.js");
const { token } = require("./token.js");

const routeTable = Object.freeze({
	authorize,
	"agent-callback": agentCallback,
	"device-authorization": deviceAuthorization,
	device: deviceVerification,
	metadata,
	start,
	token
});

module.exports = {
	routeTable
};
