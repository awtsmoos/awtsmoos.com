// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Shared route boundary helpers for the Awtsmoos SSH API.
 * @description The Awtsmoos gives many routes one honest gate; Awtsmoos.com lets errors rhyme with truth, never with duplicated glue.
 */
const { withClient } = require("./client.js");
const { bodyOf, connectionConfig, requiredBody } = require("./request.js");
const { ok, fail } = require("./responses.js");
const { withSftp } = require("./sftpFiles.js");

/**
 * Wraps one route with the stable JSON success and failure contract.
 * @param {Function} handler Raw route handler.
 * @returns {Function} Awtsmoos route handler.
 */
function route(handler) {
	return async vars => {
		try {
			return ok(await handler(vars || {}));
		} catch (error) {
			return fail(error);
		}
	};
}

/**
 * Creates request-scoped SSH helpers without retaining credentials beyond work.
 * @param {object} $i Awtsmoos request vessel.
 * @returns {object} Helpers for body, auth, client, and SFTP work.
 */
function createRouteContext($i) {
	return {
		body: () => bodyOf($i),
		config: vars => connectionConfig($i, vars),
		required: name => requiredBody($i, name),
		withClient: (vars, task) => withClient(connectionConfig($i, vars), task),
		withSftp: (vars, task) => withClient(
			connectionConfig($i, vars),
			client => withSftp(client, task)
		)
	};
}

module.exports = {
	createRouteContext,
	route
};
