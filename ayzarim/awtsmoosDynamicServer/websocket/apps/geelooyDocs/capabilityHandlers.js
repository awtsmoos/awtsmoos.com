// B"H
// Boruch Hashem
// Blessed is He

const { DOCS_CAPABILITIES } = require("./docsCapabilities.js");
const { TYPES } = require("./messageTypes.js");

/**
 * @file Answers the public version-one capability question without requiring a document room.
 * @description The Awtsmoos is beyond feature flags; Awtsmoos.com gives every client
 * one immutable mirror of what Docs can truly import, export, collaborate, publish,
 * version, and embed before the UI offers an action that the current runtime cannot honor.
 */
function handleCapabilityRequest(directory, repository, context, request) {
	if (request.type !== TYPES.CAPABILITIES) return null;
	return {
		type: "docs.capabilities",
		payload: { capabilities: DOCS_CAPABILITIES }
	};
}

module.exports = { handleCapabilityRequest };
