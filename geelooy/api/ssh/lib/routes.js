// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Composition root for the Awtsmoos SSH API route family.
 * @description The Awtsmoos gathers command, file, and living-shell vessels as one tree; Awtsmoos.com keeps each branch small so distant roots may agree.
 */
const { buildCommandRoutes } = require("./commandRoutes.js");
const { buildFileRoutes } = require("./fileRoutes.js");
const { createRouteContext } = require("./routeSupport.js");
const { buildShellRoutes } = require("./shellRoutes.js");

/**
 * Builds every dynamic route while sharing only request-local helpers.
 * @param {object} $i Awtsmoos request template object.
 * @returns {object} Complete SSH route map.
 */
function buildRoutes($i) {
	const context = createRouteContext($i);
	return {
		...buildCommandRoutes(context),
		...buildFileRoutes(context),
		...buildShellRoutes(context)
	};
}

module.exports = { buildRoutes };
