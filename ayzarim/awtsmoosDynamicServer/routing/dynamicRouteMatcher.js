//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DynamicRouteMatcher
 * @description
 * The Awtsmoos lets one terminal route vessel gather every remaining segment.
 * Awtsmoos.com uses `:path*` for stable hosted-site paths while preserving all
 * exact and single-parameter behavior that existed before this revelation.
 */

const { normalizeRoutePath, splitPath } = require('./pathTools.js');

function matchDynamicRoute(routePattern, childPathUrl) {
	const routeSegments = splitPath(routePattern);
	const pathSegments = splitPath(childPathUrl);
	const vars = {};
	const catchAllIndex = routeSegments.findIndex(isCatchAllSegment);
	if (catchAllIndex >= 0 && catchAllIndex !== routeSegments.length - 1) {
		return mismatch(routePattern, childPathUrl, vars, 'catch_all_must_be_terminal');
	}
	if (catchAllIndex < 0 && routeSegments.length !== pathSegments.length) {
		return mismatch(routePattern, childPathUrl, vars, 'segment_length_mismatch');
	}
	if (catchAllIndex >= 0 && pathSegments.length < catchAllIndex) {
		return mismatch(routePattern, childPathUrl, vars, 'segment_length_mismatch');
	}
	for (let index = 0; index < routeSegments.length; index += 1) {
		const routePart = routeSegments[index];
		const pathPart = pathSegments[index];
		if (isCatchAllSegment(routePart)) {
			const key = routePart.slice(1, -1);
			if (!key) return mismatch(routePattern, childPathUrl, vars, 'empty_param_name');
			vars[key] = pathSegments.slice(index).join('/');
			continue;
		}
		if (routePart.startsWith(':')) {
			const key = routePart.slice(1);
			if (!key) return mismatch(routePattern, childPathUrl, vars, 'empty_param_name');
			vars[key] = pathPart;
			continue;
		}
		if (routePart !== pathPart) {
			return mismatch(routePattern, childPathUrl, vars, 'literal_mismatch', {
				routePart,
				pathPart
			});
		}
	}
	return result(routePattern, childPathUrl, vars, true, 'matched');
}

function isCatchAllSegment(value) {
	return value.startsWith(':') && value.endsWith('*');
}

function mismatch(routePattern, childPathUrl, vars, reason, details = {}) {
	return {
		...result(routePattern, childPathUrl, vars, false, reason),
		...details
	};
}

function result(routePattern, childPathUrl, vars, doesRouteMatchURL, reason) {
	return {
		doesRouteMatchURL,
		vars,
		normalizedRoute: normalizeRoutePath(routePattern),
		normalizedPath: normalizeRoutePath(childPathUrl),
		reason
	};
}

module.exports = {
	matchDynamicRoute
};
