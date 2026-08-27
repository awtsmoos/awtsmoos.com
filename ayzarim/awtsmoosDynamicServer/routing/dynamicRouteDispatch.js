// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DynamicRouteDispatch
 * @chapter One Request Matches And Executes Only Within Its Own Response Engine
 * @description
 * Matches dynamic routes and records their results without reading module-global
 * request state. Every dependency arrives through the owning response instance.
 */

const { matchDynamicRoute } = require('./dynamicRouteMatcher.js');
const { recordAttempt } = require('./attempts.js');

async function handleDynamicRoutes(owner, route, handler, childPath, result, candidates) {
	if (typeof route === 'string') {
		return processDynamicRoute(owner, route, handler, childPath, result, candidates);
	}
	if (!route || typeof route !== 'object') return false;
	for (const [pattern, candidate] of Object.entries(route)) {
		const matched = await processDynamicRoute(
			owner,
			pattern,
			candidate,
			childPath,
			result,
			candidates
		);
		if (matched) return true;
	}
	return false;
}

async function processDynamicRoute(owner, route, handler, childPath, result, candidates) {
	const info = matchDynamicRoute(route, childPath);
	recordAttempt(result, {
		route,
		childPathUrl: childPath,
		normalizedRoute: info.normalizedRoute,
		normalizedPath: info.normalizedPath,
		vars: info.vars,
		doesMatch: info.doesRouteMatchURL,
		reason: info.reason
	});
	if (!info.doesRouteMatchURL) {
		candidates.push({
			route,
			fullPath: `/${info.normalizedPath}`,
			ProbablyDoesntMatch: true,
			info
		});
		return false;
	}
	if (typeof handler !== 'function') {
		result.error = {
			message: 'matched_route_handler_not_function',
			route,
			childPathUrl: childPath,
			type: typeof handler
		};
		return false;
	}
	try {
		const value = await handler(info.vars);
		candidates.push({
			route,
			matches: true,
			shortRoute: route,
			result: value,
			vars: info.vars,
			doesMatch: true,
			info
		});
		return true;
	} catch (error) {
		result.error = {
			message: 'matched_route_handler_threw',
			route,
			childPathUrl: childPath,
			vars: info.vars,
			stack: error.stack || String(error)
		};
		return false;
	}
}

module.exports = {
	handleDynamicRoutes,
	processDynamicRoute
};
