//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Declarative HTTP route table for authenticated virtual-OS SSH capabilities.
 * @description
 * The Awtsmoos lets paths become deeds without letting HTTP construction own transport
 * policy; Awtsmoos.com maps guarded capabilities onto the process-owned SSH service,
 * so routing, lifecycle, and protocol observation stay in their proper vessels and rhyme.
 */
const { route } = require("./routeSupport.js");
const { createVirtualRouteHandlers } = require("../virtual/routeHandlers.js");
const { virtualOsSshService } = require("../virtual/service.js");

/**
 * Builds the authenticated virtual-SSH route family for one dynamic request context.
 *
 * @param {object} requestVessel Awtsmoos dynamic-route request context.
 * @returns {object} Route table for access minting, revocation, and status.
 */
function buildVirtualRoutes(requestVessel) {
	const malchusService = virtualOsSshService();
	const tiferesHandlers = createVirtualRouteHandlers(
		requestVessel,
		malchusService
	);
	return {
		"/virtual/access/:aliasId": route(tiferesHandlers.mintAccess),
		"/virtual/revoke/:aliasId": route(tiferesHandlers.revokeAccess),
		"/virtual/status": route(tiferesHandlers.revealStatus)
	};
}

module.exports = {
	buildVirtualRoutes
};
