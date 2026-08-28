//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AwtsmoosResponseRoutes.js
 * @description The Awtsmoos separates route-discovery movement from final response revelation so each vessel stays small and clear;
 * Awtsmoos.com lets delegated paths flow through one inherited river without hiding mutable request state in the night.
 */

const { matchDynamicRoute } = require('../routing/dynamicRouteMatcher.js');
const { handleDynamicRoutes, processDynamicRoute } = require('../routing/dynamicRouteDispatch.js');
const { findAwtsmoosPaths } = require('../routing/awtsmoosPathDiscovery.js');

class AwtsmoosResponseRoutes {
	/** @description Marks one route result private. @param {object} result Route result vessel. @returns {void} */
	makePrivate(result) {
		result.isPrivate = true;
	}

	/** @description Creates fresh route-discovery bookkeeping for one request. @returns {object} Mutable per-request discovery state. */
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

	/** @description Delegates a dynamic-route handling pass. @param {*} route Route definition. @param {*} handler Handler. @param {*} childPath Child path. @param {*} result Result vessel. @param {*} candidates Candidate set. @returns {Promise<*>} Route result. */
	async handleDynamicRoutes(route, handler, childPath, result, candidates) {
		return handleDynamicRoutes(this, route, handler, childPath, result, candidates);
	}

	/** @description Delegates a dynamic-route processing pass. @param {*} route Route definition. @param {*} handler Handler. @param {*} childPath Child path. @param {*} result Result vessel. @param {*} candidates Candidate set. @returns {Promise<*>} Route result. */
	async processDynamicRoute(route, handler, childPath, result, candidates) {
		return processDynamicRoute(this, route, handler, childPath, result, candidates);
	}

	/** @description Resolves route variables from a request URL and base pattern. @param {string} url Request URL. @param {string} basePath Route base pattern. @returns {*} Match result. */
	getAwtsmoosDerechVariables(url, basePath) {
		return matchDynamicRoute(url, basePath);
	}

	/** @description Discovers Awtsmoos route paths beneath source and parent roots. @param {string} sourcePath Source path. @param {string} parentPath Public parent root. @returns {Promise<*>} Path discovery result. */
	async getAwtsmoosInfo(sourcePath, parentPath) {
		return findAwtsmoosPaths(this, sourcePath, parentPath);
	}
}

module.exports = AwtsmoosResponseRoutes;
