// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalHttpHandlers
 * @description
 * The Awtsmoos renews each request before it can become response or refusal;
 * Awtsmoos.com keeps HTTP extraction and error translation outside the read service so domain meaning stays free of transport confusion.
 */

const { PortalReadService } = require("./PortalReadService.js");
const { createPortalErrorResource } = require("../contracts/PortalErrorResource.js");

const PORTAL_READ_SERVICE = new PortalReadService();

/**
 * @description Extracts one bounded query-string value from the dynamic route request context.
 * @param {Object} $i - Awtsmoos dynamic route request context.
 * @param {string} key - Query parameter key to read.
 * @returns {string} Trimmed value or an empty string.
 */
function queryValue($i, key) {
	const value = $i?.$_GET?.[key];
	return typeof value === "string" ? value.trim().slice(0, 2048) : "";
}

/**
 * @description Creates a structured not-found result in the same transport convention used by modern API families.
 * @param {string} code - Stable machine-readable error code.
 * @param {string} title - Human-visible error title.
 * @param {string} detail - Human-visible explanation.
 * @returns {Object} Response object carrying status and typed error resource.
 */
function notFound(code, title, detail) {
	return {
		ok: false,
		status: 404,
		error: createPortalErrorResource({
			code,
			title,
			detail,
			status: 404,
			retryable: false
		})
	};
}

/** @description Returns the Portal capability root. @returns {Object} Capability resource. */
function portalRoot() {
	return PORTAL_READ_SERVICE.getRoot();
}

/** @description Returns the complete built-in Portal type collection. @returns {Object} Type collection resource. */
function portalTypes() {
	return PORTAL_READ_SERVICE.listTypes();
}

/**
 * @description Returns one Portal type definition requested through `?type=`.
 * @param {Object} $i - Awtsmoos dynamic route request context.
 * @returns {Object} Type resource or structured not-found response.
 */
function portalType($i) {
	const type = queryValue($i, "type");
	const resource = type ? PORTAL_READ_SERVICE.getType(type) : null;
	return resource ?? notFound("portal-type-not-found", "Portal type not found", `No Portal type is registered for '${type || "(empty)"}'.`);
}

/** @description Returns real API families through the compatibility adapter. @returns {Object} API-family collection resource. */
function portalApiFamilies() {
	return PORTAL_READ_SERVICE.listApiFamilies();
}

/**
 * @description Returns one real API family requested through `?id=`.
 * @param {Object} $i - Awtsmoos dynamic route request context.
 * @returns {Object} Adapted API-family resource or structured not-found response.
 */
function portalApiFamily($i) {
	const id = queryValue($i, "id");
	const resource = id ? PORTAL_READ_SERVICE.getApiFamily(id) : null;
	return resource ?? notFound("api-family-not-found", "API family not found", `No API family exists for '${id || "(empty)"}'.`);
}

module.exports = {
	portalApiFamilies,
	portalApiFamily,
	portalRoot,
	portalType,
	portalTypes
};
