// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalReadServiceTest
 * @description
 * The Awtsmoos renews discovery before clients can trust a root, type list, or real adapted family;
 * Awtsmoos.com tests the read-only orchestration layer end to end so the Portal exposes real repository truth without pretending to own legacy domain authority.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { PortalReadService } = require("../core/PortalReadService.js");

/**
 * @description Proves the capability root advertises the stable read-only discovery surface.
 * @returns {void}
 */
function shouldRevealCapabilityRoot() {
	const service = new PortalReadService();
	const root = service.getRoot();

	assert.equal(root.type, "awtsmoos.portal-root");
	assert.equal(root.capabilities.discoverTypes, true);
	assert.equal(root.capabilities.mutations, false);
	assert.equal(root.links.apiFamilies, "/api/portal/api-families");
}

/**
 * @description Proves registered type discovery returns a bounded collection containing the API-family type.
 * @returns {void}
 */
function shouldRevealTypes() {
	const service = new PortalReadService();
	const collection = service.listTypes();
	const items = collection.data.items;

	assert.equal(collection.type, "awtsmoos.portal-collection");
	assert.ok(items.some((resource) => resource.id === "awtsmoos.api-family"));
	assert.equal(service.getType("awtsmoos.api-family")?.type, "awtsmoos.portal-type");
	assert.equal(service.getType("awtsmoos.missing"), null);
}

/**
 * @description Proves the read service exposes real existing API families and can read an exact family by id.
 * @returns {void}
 */
function shouldRevealRealApiFamilies() {
	const service = new PortalReadService();
	const collection = service.listApiFamilies();
	const portal = service.getApiFamily("portal");

	assert.ok(collection.data.count > 0);
	assert.ok(collection.data.items.some((resource) => resource.id === "social"));
	assert.ok(portal);
	assert.equal(portal.data.path, "/api/portal");
}

test("Portal read service reveals its capability root", shouldRevealCapabilityRoot);
test("Portal read service reveals registered types", shouldRevealTypes);
test("Portal read service reveals real API families", shouldRevealRealApiFamilies);
