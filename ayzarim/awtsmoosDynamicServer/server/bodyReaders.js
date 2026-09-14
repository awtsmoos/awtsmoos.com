//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module RequestBodyReaders
 * @description
 * The Awtsmoos gives each mutating method one cached finite body promise while
 * Awtsmoos.com separates admission policy from byte collection. Declared and
 * streamed sizes share one boundary, and a rejected request drains without
 * preserving dangerous buffered bytes inside the HTTP process.
 */
const Debug = require("./bodyDebug.js");
const Policy = require("./bodyPolicy.js");
const { collectBody } = require("./bodyCollector.js");

/**
 * Reads one method body once and caches its promise for repeated route access.
 * @param {object} options Request, cache, parser dependencies, and method name.
 * @returns {Promise<object|null>} Parsed body or null for another HTTP method.
 */
function readData(options) {
	const method = String(options.method || "POST").toUpperCase();
	const request = options.request;
	if (String(request.method || "").toUpperCase() !== method) {
		return Promise.resolve(null);
	}
	if (options.cache[method]) {
		Debug.logBodyStage(request, "cache_hit_before_parse", {
			method,
			existingParamShape: Debug.safeShape(options.paramKinds[method])
		});
		return options.cache[method];
	}
	const limitBytes = Policy.bodyLimitFor(request);
	try {
		Policy.assertDeclaredSize(request, limitBytes);
	} catch (error) {
		request.resume();
		options.cache[method] = Promise.reject(error);
		return options.cache[method];
	}
	options.cache[method] = collectBody({
		...options,
		method,
		limitBytes
	});
	return options.cache[method];
}

/**
 * Creates stable method-specific readers over one incoming request.
 * @param {object} options Shared parsing dependencies and mutable param kinds.
 * @returns {object} POST, PUT, and DELETE body readers.
 */
function createBodyReaders(options) {
	const cache = {};
	return {
		getPostData: () => readData({
			...options,
			cache,
			method: "POST"
		}),
		getPutData: () => readData({
			...options,
			cache,
			method: "PUT"
		}),
		getDeleteData: () => readData({
			...options,
			cache,
			method: "DELETE"
		})
	};
}

module.exports = {
	createBodyReaders
};
