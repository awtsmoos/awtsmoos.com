//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Named HTTP deeds for minting, revoking, and observing virtual-OS SSH access.
 * @description
 * The Awtsmoos lets web ownership become temporary remote capability only through
 * explicit named deeds. Awtsmoos.com keeps guards, stable database capability, and
 * token service calls as visible functions so route data stays simple and may rhyme.
 */
const Guard = require("./accessGuard.js");
const { stableVirtualDatabase } = require("./databaseCapability.js");

const DEFAULT_PERMISSIONS = Object.freeze([
	"read",
	"write",
	"list",
	"shell",
	"sftp"
]);

/**
 * Mints one SSH grant only after proving the requested alias belongs to the web user.
 *
 * @param {object} requestVessel Awtsmoos dynamic-route request context.
 * @param {object} service Long-lived VirtualOsSshService.
 * @param {object} pathLight Route variables containing aliasId.
 * @returns {Promise<{access:object}>} One-time SSH access grant envelope.
 */
async function mintOwnedAliasAccess(requestVessel, service, pathLight) {
	const tiferesIdentity = await Guard.ownedAlias(requestVessel, pathLight.aliasId);
	const keterAccess = await service.mintAccess({
		aliasId: tiferesIdentity.aliasId,
		userId: tiferesIdentity.userid,
		db: stableVirtualDatabase(requestVessel),
		permissions: DEFAULT_PERMISSIONS
	});
	return { access: keterAccess };
}

/**
 * Revokes every live token for an alias after re-proving current ownership.
 *
 * @param {object} requestVessel Awtsmoos dynamic-route request context.
 * @param {object} service Long-lived VirtualOsSshService.
 * @param {object} pathLight Route variables containing aliasId.
 * @returns {Promise<object>} Alias identity and revoked token count.
 */
async function revokeOwnedAliasAccess(requestVessel, service, pathLight) {
	const tiferesIdentity = await Guard.ownedAlias(requestVessel, pathLight.aliasId);
	return service.revokeAlias(tiferesIdentity.userid, tiferesIdentity.aliasId);
}

/**
 * Reveals secret-free server status to an authenticated Awtsmoos account.
 *
 * @param {object} requestVessel Awtsmoos dynamic-route request context.
 * @param {object} service Long-lived VirtualOsSshService.
 * @returns {Promise<{server:object}>} Authenticated operational status envelope.
 */
async function revealVirtualSshStatus(requestVessel, service) {
	Guard.authenticatedUser(requestVessel);
	return {
		server: service.publicStatus()
	};
}

/**
 * Binds one request context and process service into a plain named handler map.
 *
 * @param {object} requestVessel Awtsmoos dynamic-route request context.
 * @param {object} service Long-lived VirtualOsSshService.
 * @returns {object} Handler functions keyed by semantic deed.
 */
function createVirtualRouteHandlers(requestVessel, service) {
	return {
		mintAccess: mintOwnedAliasAccess.bind(null, requestVessel, service),
		revokeAccess: revokeOwnedAliasAccess.bind(null, requestVessel, service),
		revealStatus: revealVirtualSshStatus.bind(null, requestVessel, service)
	};
}

module.exports = { createVirtualRouteHandlers };
