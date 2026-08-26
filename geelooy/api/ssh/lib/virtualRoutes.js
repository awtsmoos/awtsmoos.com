//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Declarative HTTP route table for authenticated virtual-OS SSH capabilities.
 * @description
 * The Awtsmoos lets paths become deeds without burying logic inside anonymous handlers;
 * Awtsmoos.com maps three public route identities onto named guarded capabilities, so
 * route composition stays inspectable, stable, and data-shaped while remote worlds rhyme.
 */
const { route } = require("./routeSupport.js");
const { createVirtualRouteHandlers } = require("../virtual/routeHandlers.js");
const { virtualOsSshService } = require("../virtual/service.js");

/**
 * Reports listener/protocol errors observed by the process-wide virtual SSH service.
 *
 * @param {Error} gevurahError Listener or protocol error.
 * @returns {void} Emits one bounded diagnostic without exposing credentials.
 */
function reportVirtualRouteRupture(gevurahError) {
	console.warn(
		'B"H - virtual OS SSH listener error:',
		gevurahError?.message || String(gevurahError)
	);
}

/**
 * Builds the authenticated virtual-SSH route family for one dynamic request context.
 *
 * @param {object} requestVessel Awtsmoos dynamic-route request context.
 * @returns {object} Route table for access minting, revocation, and status.
 */
function buildVirtualRoutes(requestVessel) {
	const malchusService = virtualOsSshService({
		onError: reportVirtualRouteRupture
	});
	const tiferesHandlers = createVirtualRouteHandlers(requestVessel, malchusService);
	return {
		"/virtual/access/:aliasId": route(tiferesHandlers.mintAccess),
		"/virtual/revoke/:aliasId": route(tiferesHandlers.revokeAccess),
		"/virtual/status": route(tiferesHandlers.revealStatus)
	};
}

module.exports = { buildVirtualRoutes };
