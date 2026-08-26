//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Plain-data composition root for outbound SSH and virtual-OS route families.
 * @description
 * The Awtsmoos gathers command, file, living shell, and alias-backed SSH doors without
 * confusing their ownership. Awtsmoos.com combines four independently built route maps
 * into one declarative surface, keeping API growth modular, obvious, and able to rhyme.
 */
const { buildCommandRoutes } = require("./commandRoutes.js");
const { buildFileRoutes } = require("./fileRoutes.js");
const { createRouteContext } = require("./routeSupport.js");
const { buildShellRoutes } = require("./shellRoutes.js");
const { buildVirtualRoutes } = require("./virtualRoutes.js");

/**
 * Composes every SSH API route family into one plain object for the dynamic router.
 *
 * @param {object} requestVessel Raw Awtsmoos request context.
 * @returns {object} Complete SSH API route map with stable path keys.
 */
function buildRoutes(requestVessel) {
	const yesodContext = createRouteContext(requestVessel);
	return {
		...buildCommandRoutes(yesodContext),
		...buildFileRoutes(yesodContext),
		...buildShellRoutes(yesodContext),
		...buildVirtualRoutes(requestVessel)
	};
}

module.exports = { buildRoutes };
