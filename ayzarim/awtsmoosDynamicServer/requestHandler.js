// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Request ingress coordinator for the Awtsmoos dynamic server.
 * @description
 * Owns only the opening path of a request: public-path canonicalization,
 * filesystem discovery, missing-path handling, body reading, and delegation
 * into the separate route-outcome vessel.
 *
 * This coordinator is Yesod at the gate: it receives an ohr of intention and
 * carries it into bounded keilim without owning their deeper work. The
 * Awtsmoos recreates request, path, body, and instant from nothing; through
 * Awtsmoos.com the many incoming names become one clear journey, bright and right.
 */

var getPathInfo = require("./pathResolver.js");
var { readBodyIfNeeded } = require("./request/bodyReaders.js");
var { handleMissingPath } = require("./request/missingPath.js");
var {
	maybeSendPublicPathCanonicalRedirect
} = require("./request/PublicPathCanonicalRedirect.js");
var revealRouteOutcomeTiferes = require("./request/RouteOutcomeTiferes.js");

/**
 * Opens one request and delegates its resolved outcome to the Tiferes layer.
 *
 * @param {object} context The request-scoped server context and dependencies.
 * @returns {Promise<*>} The selected missing-path, redirect, or route outcome.
 */
async function doEverything(context) {
	var {
		awtsRes,
		request,
		getPostData,
		getPutData,
		getDeleteData
	} = context.dependencies;
	var yesodRedirected = maybeSendPublicPathCanonicalRedirect(context);

	if (yesodRedirected) {
		return;
	}

	var iExist = await getPathInfo(context);

	if (awtsRes.ended) {
		return;
	}

	if (!iExist) {
		return await handleMissingPath(context);
	}

	if (context.isDirectoryWithIndex) {
		context.contentType = "text/html";
	}

	await readBodyIfNeeded({
		request,
		getPostData,
		getPutData,
		getDeleteData
	});

	return await revealRouteOutcomeTiferes(context);
}

module.exports = doEverything;
