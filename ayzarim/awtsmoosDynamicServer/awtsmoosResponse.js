// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosResponse
 * @chapter Every Response Engine Owns Its Dependencies Without Sharing A Single Seal
 * @description
 * The former class assigned request dependencies into module-level variables, so a
 * later constructor could redirect an earlier request into another request's query,
 * template generator, filesystem, or response. All state now belongs to one instance.
 */

const { matchDynamicRoute } = require('./routing/dynamicRouteMatcher.js');
const {
	handleDynamicRoutes,
	processDynamicRoute
} = require('./routing/dynamicRouteDispatch.js');
const {
	findAwtsmoosPaths
} = require('./routing/awtsmoosPathDiscovery.js');
const {
	runDynamicModules
} = require('./response/dynamicModuleRunner.js');
const {
	buildAwtsmoosResponse
} = require('./response/buildAwtsmoosResponse.js');

class AwtsmoosResponse {
	constructor(dependencies = {}) {
		this.dependencies = Object.freeze({
			...dependencies
		});
		this.ended = false;
	}

	makePrivate(result) {
		result.isPrivate = true;
	}

	makeDidThisPath() {
		return {
			c: false,
			wow: {},
			m: {},
			time: new Date(),
			awtsmooseem: [],
			routeAttempts: [],
			matchedRoutes: []
		};
	}

	async doAwtsmooses(options = {}) {
		return runDynamicModules(this, options);
	}

	async handleDynamicRoutes(route, handler, childPath, result, candidates) {
		return handleDynamicRoutes(
			this,
			route,
			handler,
			childPath,
			result,
			candidates
		);
	}

	async processDynamicRoute(route, handler, childPath, result, candidates) {
		return processDynamicRoute(
			this,
			route,
			handler,
			childPath,
			result,
			candidates
		);
	}

	getAwtsmoosDerechVariables(url, basePath) {
		return matchDynamicRoute(url, basePath);
	}

	async doAwtsmoosResponse(dynamicValue, derechPath) {
		const generator = this.dependencies.templateObjectGenerator;
		const request = generator?.dependencies?.request;
		const built = await buildAwtsmoosResponse({
			dyn: dynamicValue,
			derechPath,
			request,
			fs: this.dependencies.fs
		});
		this.ended = true;
		return built;
	}

	async getAwtsmoosInfo(sourcePath, parentPath) {
		return findAwtsmoosPaths(
			this,
			sourcePath,
			parentPath
		);
	}
}

module.exports = AwtsmoosResponse;
