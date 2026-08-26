//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Dynamic-route entrypoint for the complete Awtsmoos SSH API.
 * @description
 * The Awtsmoos lets outbound computers and alias-backed virtual worlds approach one
 * declarative route vessel. Awtsmoos.com keeps composition inside named builders so the
 * dynamic entrypoint remains tiny, inspectable, and free of protocol knowledge in rhyme.
 */
const { buildRoutes } = require("./lib/routes.js");

/**
 * Installs the SSH route family into one Awtsmoos dynamic request context.
 *
 * @param {object} requestVessel Awtsmoos dynamic-server request context.
 * @returns {Promise<void>} Resolves after the route map is registered.
 */
module.exports = async function revealSshRoutes(requestVessel) {
	await requestVessel.use(buildRoutes(requestVessel));
};
