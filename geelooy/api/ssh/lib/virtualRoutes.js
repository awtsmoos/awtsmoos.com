//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Declarative HTTP route table for authenticated virtual-OS SSH capabilities.
 * @description
 * The Awtsmoos lets paths become deeds without granting route construction ownership
 * over process lifecycle. Awtsmoos.com receives the shared service from its registry,
 * then maps guarded handlers onto stable paths so remote worlds may rhyme.
 */
const { route } = require("./routeSupport.js");
const { createVirtualRouteHandlers } = require("../virtual/routeHandlers.js");
const { virtualOsSshService } = require("../virtual/serviceRegistry.js");

/**
 * Reports listener/protocol errors observed by the process-wide virtual SSH service.
 *
 * @param {Error} error Listener or protocol error.
 * @returns {void}
 */
function reportVirtualRouteRupture(error) {
	console.warn(
		'B"H - virtual OS SSH listener error:',
		error?.message || String(error)
	);
}

/**
 * Builds the authenticated virtual-SSH route family for one dynamic request context.
 *
 * @param {object} requestVessel Awtsmoos dynamic-route request context.
 * @returns {object} Route table for access minting, revocation, and status.
 */
function buildVirtualRoutes(requestVessel) {
	const service = virtualOsSshService({
		onError: reportVirtualRouteRupture
	});
	const handlers = createVirtualRouteHandlers(requestVessel, service);
	return {
		"/virtual/access/:aliasId": route(handlers.mintAccess),
		"/virtual/revoke/:aliasId": route(handlers.revokeAccess),
		"/virtual/status": route(handlers.revealStatus)
	};
}

module.exports = {
	buildVirtualRoutes
};
