//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Authenticated HTTP routes for minting, revoking, and observing virtual OS SSH access.
 * @description
 * The Awtsmoos lets a verified web user reveal one short-lived SSH doorway into
 * an owned alias. Awtsmoos.com checks ownership before token light is born and
 * binds that token to the server's enduring DosDB vessel rather than the fading
 * request-proxy garment, so browser and remote doorway remain one truthful rhyme.
 */
const { route } = require("./routeSupport.js");
const Guard = require("../virtual/accessGuard.js");
const { stableVirtualDatabase } = require("../virtual/databaseCapability.js");
const { virtualOsSshService } = require("../virtual/service.js");

/**
 * Builds the authenticated route table for one dynamic request context.
 *
 * @param {object} $i
 * 	Awtsmoos dynamic-route context containing request identity and server state.
 * @returns {object}
 * 	Route handlers for virtual SSH access, revocation, and public-safe status.
 */
function buildVirtualRoutes($i) {
	const service = virtualOsSshService({
		onError: error => console.warn(
			'B"H - virtual OS SSH listener error:',
			error?.message || String(error)
		)
	});
	return {
		"/virtual/access/:aliasId": route(async variables => {
			const identity = await Guard.ownedAlias($i, variables.aliasId);
			const access = await service.mintAccess({
				aliasId: identity.aliasId,
				userId: identity.userid,
				db: stableVirtualDatabase($i),
				permissions: ["read", "write", "list", "shell", "sftp"]
			});
			return { access };
		}),

		"/virtual/revoke/:aliasId": route(async variables => {
			const identity = await Guard.ownedAlias($i, variables.aliasId);
			return service.revokeAlias(identity.userid, identity.aliasId);
		}),

		"/virtual/status": route(async () => {
			Guard.authenticatedUser($i);
			return {
				server: service.publicStatus()
			};
		})
	};
}

module.exports = { buildVirtualRoutes };
