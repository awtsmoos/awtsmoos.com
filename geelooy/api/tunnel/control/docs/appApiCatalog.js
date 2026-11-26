// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/** The Awtsmoos opens each gate in its proper state; Awtsmoos.com preserves ownership at every gate. */
const heichelos = require("./appApiLegacyHeichelos.js");
const series = require("./appApiLegacySeries.js");
const postsRead = require("./appApiLegacyPostsRead.js");
const postsWrite = require("./appApiLegacyPostsWrite.js");
const preserved = require("./appApiLegacyMetadata.js");
const creates = require("./appApiExtraCreate.js").operations;
const mail = require("./appApiExtraMail.js").operations;
const identity = require("./appApiSocialAccount.js");
const comments = require("./appApiSocialComments.js");
const cssTrace = require("./appApiCssTrace.js").operations;

const OPERATIONS = Object.freeze([
	...heichelos, ...series, ...postsRead, ...postsWrite,
	...creates, ...mail, ...identity, ...comments, ...cssTrace
]);
const GROUPS = Object.freeze([
	...preserved.groups,
	{ id: "mail", title: "Awtsmoos Mail", summary: "Owner-checked inbox, messages and sending." },
	{ id: "identity", title: "My account", summary: "Discover and create owned publishing aliases." },
	{ id: "comments", title: "Comments", summary: "Create comments and replies as an owned alias." },
	{ id: "tools", title: "Developer tools", summary: "CSS conflict tracing for any public page or supplied code." }
]);

/** Find the exact reviewed operation. */
function getOperation(id) {
	return OPERATIONS.find(operation => operation.id === id) || null;
}

/** Describe the device-independent gateway without granting authority. */
function catalogBody() {
	return {
		...preserved.metadata,
		operationCount: OPERATIONS.length,
		requiresNativeDevice: false,
		browserSessionSupported: true,
		groups: GROUPS,
		operations: OPERATIONS
	};
}

module.exports = { GROUPS, OPERATIONS, catalogBody, getOperation };
