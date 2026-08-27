// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ApiFamilyResourceAdapter
 * @description
 * The Awtsmoos renews old and new contracts in one instant without erasing the path by which either came;
 * Awtsmoos.com wraps the existing ApiFamilyCatalog output losslessly so Portal interoperability grows without changing the legacy family's name.
 */

const { ApiFamilyCatalog } = require("../../core/ApiFamilyCatalog.js");
const { normalizePortalResource } = require("../contracts/PortalResourceEnvelope.js");

/**
 * @description Reads the repository's authoritative normalized API-family descriptors through the existing catalog class.
 * @returns {Array<{id:string,path:string,description:string}>} Current API-family descriptors in catalog order.
 */
function revealApiFamilies() {
	const catalog = new ApiFamilyCatalog();
	const document = catalog.reveal();

	return Array.isArray(document.families)
		? document.families
		: [];
}

/**
 * @description Converts one existing API-family descriptor into a typed Portal resource while preserving every legacy field.
 * @param {{id:string,path:string,description:string}} family - Existing normalized API-family descriptor.
 * @returns {Object} Portal resource representing the same API family.
 */
function adaptApiFamilyResource(family) {
	return normalizePortalResource({
		id: family.id,
		type: "awtsmoos.api-family",
		title: family.id,
		data: {
			id: family.id,
			path: family.path,
			description: family.description
		},
		schema: "/api/portal/type?type=awtsmoos.api-family",
		links: {
			self: `/api/portal/api-family?id=${encodeURIComponent(family.id)}`,
			legacy: family.path,
			catalog: "/api/catalog"
		},
		capabilities: {
			read: true,
			open: true
		},
		meta: {
			source: "api-family-catalog",
			legacyPath: family.path
		}
	});
}

/**
 * @description Lists every current API family as Portal resources in the authoritative catalog order.
 * @returns {Object[]} Adapted API-family resources.
 */
function listApiFamilyResources() {
	return revealApiFamilies().map(adaptApiFamilyResource);
}

/**
 * @description Finds one current API family by its stable catalog identifier and adapts it into Portal form.
 * @param {string} id - Existing API-family catalog identifier.
 * @returns {Object|null} Adapted resource or null when no family exists.
 */
function getApiFamilyResource(id) {
	const family = revealApiFamilies().find((candidate) => candidate.id === id);

	return family
		? adaptApiFamilyResource(family)
		: null;
}

module.exports = {
	adaptApiFamilyResource,
	getApiFamilyResource,
	listApiFamilyResources,
	revealApiFamilies
};
