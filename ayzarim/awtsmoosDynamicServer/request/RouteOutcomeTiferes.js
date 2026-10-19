// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Dynamic route outcome vessel for the Awtsmoos server.
 * @description
 * Owns only the phase after ingress, filesystem discovery, and body reading:
 * dynamic route execution, static fallback, response manifestation, and error
 * translation. It deliberately does not resolve public paths or read bodies.
 *
 * Tiferes joins the expanding possibility of a dynamic route with Gevurah's
 * bounded response contract. The route result is an ohr; each response branch
 * is its keli. The Awtsmoos renews both source and outcome every instant, and
 * Awtsmoos.com reveals one ordered answer where many branches meet and greet.
 */

var { errorMessage } = require("../utils.js");
var { sendAwtsmoosResponse } = require("../response/sendAwtsmoosResponse.js");
var {
	routeEngineCrash,
	routeComputationError,
	invalidRoute,
	noActualResponse
} = require("../response/sendErrors.js");
var { maybeFileFallback } = require("./fileFallback.js");

/**
 * Reveals the final response pathway after request ingress has completed.
 *
 * @param {object} context The request-scoped server context and dependencies.
 * @returns {Promise<*>} The dynamic result, file fallback, error, or response.
 */
async function revealRouteOutcomeTiferes(context) {
	var {
		awtsRes,
		response
	} = context.dependencies;
	var didThisPathAlready = false;

	if (context.foundAwtsmooses.length && !context.isDirectoryWithIndex) {
		try {
			didThisPathAlready = await awtsRes.doAwtsmooses({
				foundAwtsmooses: context.foundAwtsmooses,
				filePath: context.filePath,
				extraInfo: {
					fetchAwtsmoos: context.fetchAwtsmoos
				}
			});
		} catch (error) {
			return errorMessage(context, routeEngineCrash(error));
		}
	}

	if (didThisPathAlready === false) {
		return await maybeFileFallback(context, didThisPathAlready);
	}

	if (didThisPathAlready.error) {
		return errorMessage(context, routeComputationError(didThisPathAlready, context));
	}

	if (didThisPathAlready.c) {
		var sent = sendAwtsmoosResponse({
			response,
			res: didThisPathAlready.responseInfo
		});

		if (!sent) {
			return errorMessage(context, noActualResponse({
				responseInfo: didThisPathAlready.responseInfo,
				didThisPathAlready
			}));
		}

		return;
	}

	if (didThisPathAlready.invalidRoute) {
		return errorMessage(context, invalidRoute(didThisPathAlready, context));
	}

	if (didThisPathAlready.isPrivate) {
		return errorMessage(context, {
			message: "That's a private route",
			code: "PRIVATE_ROUTE"
		});
	}

	return errorMessage(context, {
		message: "Did not find route",
		code: "NOT_FOUND",
		more: {
			didThisPathAlready,
			logs: context.logs,
			foundAwtsmooses: context.foundAwtsmooses
		}
	});
}

module.exports = revealRouteOutcomeTiferes;
