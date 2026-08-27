// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalRegistryAdapterTest
 * @description
 * The Awtsmoos renews legacy and universal descriptions together while neither may falsify the other's finite identity;
 * Awtsmoos.com tests registry discovery and API-family adaptation against the existing catalog itself so compatibility is evidence, not architectural vanity.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { ApiFamilyCatalog } = require("../../core/ApiFamilyCatalog.js");
const {
	adaptApiFamilyResource,
	listApiFamilyResources
} = require("../adapters/ApiFamilyResourceAdapter.js");
const { PORTAL_BUILTIN_TYPES } = require("../registry/PortalBuiltinTypes.js");
const { PortalTypeRegistry } = require("../registry/PortalTypeRegistry.js");

/**
 * @description Proves every existing catalog family preserves id, path, and description exactly through Portal adaptation.
 * @returns {void}
 */
function shouldPreserveLegacyCatalogFamilies() {
	const legacyFamilies = new ApiFamilyCatalog().reveal().families;
	const portalFamilies = listApiFamilyResources();

	assert.equal(portalFamilies.length, legacyFamilies.length);
	for (let index = 0; index < legacyFamilies.length; index += 1) {
		assert.deepEqual(portalFamilies[index].data, legacyFamilies[index]);
		assert.equal(portalFamilies[index].id, legacyFamilies[index].id);
		assert.equal(portalFamilies[index].links.legacy, legacyFamilies[index].path);
	}
}

/**
 * @description Proves one manually adapted catalog record receives the expected universal type and compatibility metadata.
 * @returns {void}
 */
function shouldAdaptOneFamily() {
	const resource = adaptApiFamilyResource({
		id: "example",
		path: "/api/example",
		description: "Example family."
	});

	assert.equal(resource.type, "awtsmoos.api-family");
	assert.equal(resource.meta.source, "api-family-catalog");
	assert.equal(resource.links.legacy, "/api/example");
}

/**
 * @description Proves built-in Portal types register uniquely and expose the real API-family schema contract.
 * @returns {void}
 */
function shouldRegisterBuiltinTypes() {
	const registry = new PortalTypeRegistry(PORTAL_BUILTIN_TYPES);
	const apiFamily = registry.get("awtsmoos.api-family");

	assert.equal(registry.has("awtsmoos.portal-root"), true);
	assert.ok(apiFamily);
	assert.deepEqual(apiFamily.schema.required, ["id", "path", "description"]);
	assert.equal(apiFamily.semanticFields.title, "id");
}

test("Portal adapter preserves every legacy API-family field", shouldPreserveLegacyCatalogFamilies);
test("Portal adapter creates a typed compatibility resource", shouldAdaptOneFamily);
test("Portal registry exposes truthful built-in type definitions", shouldRegisterBuiltinTypes);
