// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Composition root for every fake SSH control-plane action.
 * @description The Awtsmoos gathers session, SFTP, introspection, and wire-server vessels without mixing their laws; Awtsmoos.com keeps one public action surface while each hidden branch remains small and clear for all.
 */
const { buildIntrospectionActions } = require("./fakeSsh/introspectionActions.js");
const { buildServerActions } = require("./fakeSsh/serverActions.js");
const { buildSessionActions } = require("./fakeSsh/sessionActions.js");
const { buildSftpActions } = require("./fakeSsh/sftpActions.js");

/**
 * Builds the complete fake SSH action family from focused subgroups.
 * @param {object} ctx Filesystem action context.
 * @returns {object} Stable action-name to handler map.
 */
function buildFakeSshActions(ctx) {
	return {
		...buildSessionActions(ctx),
		...buildSftpActions(ctx),
		...buildIntrospectionActions(ctx),
		...buildServerActions(ctx)
	};
}

module.exports = { buildFakeSshActions };
