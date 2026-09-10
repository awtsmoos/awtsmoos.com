//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module DynamicRouteExecutor
 * @description
 * The Awtsmoos composes one dynamic route universe from explicit dependencies.
 * Awtsmoos.com deliberately does not catch route execution failures here: they
 * rise to the single HTTP application boundary that can answer deterministically.
 */

const { btoa, atob } = require("./codecs.js");
const { createRuntimeDeps } = require("./runtimeDeps.js");

/**
 * Builds the template/runtime vessels and executes one dynamic route.
 * @param {object} server Active Awtsmoos server instance.
 * @param {object} context Prepared request, response, path, and body readers.
 * @param {object} deps Existing server dependency vessel.
 * @param {string} awtsMoosification Dynamic route filename convention.
 * @returns {Promise<unknown>} Exact dynamic route result.
 */
async function executeDynamicRoute(server, context, deps, awtsMoosification) {
	let templateObjectGenerator;
	const template = async (textContent, object = {}, entire = false) => {
		const templateObject = await templateObjectGenerator.getTemplateObject(
			typeof object === "object" ? object : {}
		);
		return await deps.processTemplate(
			textContent,
			templateObject,
			entire
		);
	};
	const makeToken = (value, extras = {}) => {
		try {
			return {
				success: deps.sodos.createToken(
					value,
					server.secret,
					extras
				)
			};
		} catch (error) {
			return { error: error.stack };
		}
	};
	const dependencies = createRuntimeDeps({
		deps,
		server,
		ws: server.ws,
		mail: server.mail,
		request: context.request,
		response: context.response,
		cookies: context.cookies,
		paramKinds: context.boot.paramKinds,
		fullUrl: context.boot.fullUrl,
		originalPath: context.boot.originalPath,
		filePath: context.pathState.filePath,
		parentPath: context.pathState.serverPath,
		contentType: context.pathState.contentType,
		awtsMoosification,
		template,
		btoa,
		atob,
		getPostData: context.readers.getPostData,
		getPutData: context.readers.getPutData,
		getDeleteData: context.readers.getDeleteData,
		createJob: server.createJob.bind(server),
		makeToken,
		callAi: server.callAi.bind(server)
	});
	templateObjectGenerator = new deps.TemplateObjectGenerator(dependencies);
	const awtsRes = new deps.AwtsmoosResponse({
		templateObjectGenerator,
		...templateObjectGenerator.dependencies
	});
	const ayz = new deps.Ayzarim({
		awtsRes,
		templateObjectGenerator,
		...templateObjectGenerator.dependencies
	});
	templateObjectGenerator.fetchAwtsmoos = ayz.fetchAwtsmoos.bind(ayz);
	deps.doLogs({
		firebaseKey: server.firebaseKey,
		filePath: context.pathState.filePath,
		request: context.request
	});
	return await ayz.doEverything.bind(ayz)();
}

module.exports = {
	executeDynamicRoute
};
