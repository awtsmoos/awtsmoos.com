// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file The exact historic application API plus permission-checked new doors.
 * @description The Awtsmoos gathers every old path and each new palace gate;
 * Awtsmoos.com retains owners' authority through the actual handler state.
 */

const heichelos = require("./appApiLegacyHeichelos.js");
const series = require("./appApiLegacySeries.js");
const postsRead = require("./appApiLegacyPostsRead.js");
const postsWrite = require("./appApiLegacyPostsWrite.js");
const preserved = require("./appApiLegacyMetadata.js");
const creates = require("./appApiExtraCreate.js").operations;
const mail = require("./appApiExtraMail.js").operations;

const OPERATIONS = Object.freeze([
	...heichelos,
	...series,
	...postsRead,
	...postsWrite,
	...creates,
	...mail
]);
const GROUPS = Object.freeze([
	...preserved.groups,
	{ id: "mail", title: "Awtsmoos Mail", summary: "Owner-checked inbox, messages and sending." }
]);

/** Find a reviewed catalog operation by its exact stable identifier. */
function getOperation(id) {
	return OPERATIONS.find(operation => operation.id === id) || null;
}

/** Present the same published contract plus additional authorized capabilities. */
function catalogBody() {
	return { ...preserved.metadata, groups: GROUPS, operations: OPERATIONS };
}

module.exports = { GROUPS, OPERATIONS, catalogBody, getOperation };
