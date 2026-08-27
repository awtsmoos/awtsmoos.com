//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Composition root for outbound SSH, living shell, file, and virtual-OS routes.
 * @description
 * The Awtsmoos gathers several remote doors without letting their responsibilities
 * collapse. Awtsmoos.com composes command, SFTP, persistent shell, and alias-backed
 * SSH access from smaller vessels, so each route family may evolve and rhyme.
 */
const { buildCommandRoutes } = require("./commandRoutes.js");
const { buildFileRoutes } = require("./fileRoutes.js");
const { createRouteContext } = require("./routeSupport.js");
const { buildShellRoutes } = require("./shellRoutes.js");
const { buildVirtualRoutes } = require("./virtualRoutes.js");

function buildRoutes($i) {
	const context = createRouteContext($i);
	return {
		...buildCommandRoutes(context),
		...buildFileRoutes(context),
		...buildShellRoutes(context),
		...buildVirtualRoutes($i)
	};
}

module.exports = { buildRoutes };
