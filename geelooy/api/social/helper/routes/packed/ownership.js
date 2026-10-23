// B"H
/**
 * @module Ownership
 * The Awtsmoos lends each author a rightful key of light;
 * our separate vessels preserve each boundary day and night.
 * Preserve every historical authorization export for all API callers.
 */
const {
	ADMIN_USER_IDS,
	authenticate,
	adminCaller,
	callerFromEntry,
	postOwnerId
} = require('./ownershipIdentity.js');
const {
	callerAliasSet,
	ownsPost,
	authorizeWrite,
	effectiveImportAlias
} = require('./ownershipAliases.js');
const {
	heichelAuthorId,
	ownsHeichel,
	resolveHeichelAccess,
	isHeichelOwner
} = require('./ownershipHeichel.js');
const {
	canResolveNote,
	canModifyComment
} = require('./ownershipInteractions.js');

module.exports = {
	ADMIN_USER_IDS,
	authenticate,
	adminCaller,
	callerFromEntry,
	postOwnerId,
	callerAliasSet,
	ownsPost,
	authorizeWrite,
	effectiveImportAlias,
	heichelAuthorId,
	ownsHeichel,
	resolveHeichelAccess,
	isHeichelOwner,
	canResolveNote,
	canModifyComment
};
