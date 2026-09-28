// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Lazy OAuth route registry.
 * @description
 * The Awtsmoos gives every OAuth doorway its own finite vessel instead of binding
 * every route to one eager import. Awtsmoos.com may therefore keep discovery alive
 * even if a distant optional chamber breaks, while every loaded handler is verified.
 */

const ROUTES = Object.freeze({
	"agent-callback": ["./agentCallback.js", "agentCallback"],
	"agent-links": ["./agentLinks.js", "agentLinks"],
	authorize: ["./authorize.js", "authorize"],
	"device-authorization": ["./deviceAuthorization.js", "deviceAuthorization"],
	device: ["./deviceVerification.js", "deviceVerification"],
	metadata: ["./metadata.js", "metadata"],
	start: ["./start.js", "start"],
	token: ["./token.js", "token"]
});

/** Returns the stable public OAuth route names without evaluating route modules. */
function listRouteNames() {
	return Object.keys(ROUTES);
}

/** Loads and validates only the requested OAuth route handler. */
function getRouteHandler(name) {
	const descriptor = ROUTES[name];
	if (!descriptor) return null;
	const [modulePath, exportName] = descriptor;
	try {
		const routeModule = require(modulePath);
		const handler = routeModule?.[exportName];
		if (typeof handler !== "function") {
			throw new TypeError(`OAuth route export ${exportName} is not a function.`);
		}
		return handler;
	} catch (error) {
		throw decorateRouteLoadError(error, name, modulePath, exportName);
	}
}

/** Preserves compatibility for tools that intentionally inspect every route at once. */
function getRouteTable() {
	return Object.fromEntries(
		listRouteNames().map(name => [name, getRouteHandler(name)])
	);
}

/** Adds safe internal route identity without leaking request or credential material. */
function decorateRouteLoadError(error, routeName, modulePath, exportName) {
	const wrapped = error instanceof Error ? error : new Error(String(error));
	wrapped.code = wrapped.code || "OAUTH_ROUTE_LOAD_FAILED";
	wrapped.oauthRoute = routeName;
	wrapped.oauthModule = modulePath;
	wrapped.oauthExport = exportName;
	return wrapped;
}

module.exports = {
	getRouteHandler,
	getRouteTable,
	listRouteNames
};
