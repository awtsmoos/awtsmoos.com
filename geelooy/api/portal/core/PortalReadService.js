// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalReadService
 * @description
 * The Awtsmoos renews discovery without forcing legacy domains to abandon their own vessels;
 * Awtsmoos.com joins normalized types, capability roots, and real API families into one read-only service whose compatibility is visible rather than hidden.
 */

const { normalizePortalResource } = require("../contracts/PortalResourceEnvelope.js");
const { PortalTypeRegistry } = require("../registry/PortalTypeRegistry.js");
const { PORTAL_BUILTIN_TYPES } = require("../registry/PortalBuiltinTypes.js");
const { createPortalCapabilityRoot } = require("../registry/PortalCapabilityRoot.js");
const {
	getApiFamilyResource,
	listApiFamilyResources
} = require("../adapters/ApiFamilyResourceAdapter.js");

/**
 * @description Creates a typed collection envelope without embedding unrelated query machinery.
 * @param {string} id - Stable collection identity.
 * @param {string} title - Human collection title.
 * @param {Object[]} items - Already normalized resource items.
 * @returns {Object} Portal collection resource.
 */
function createPortalCollection(id, title, items) {
	return normalizePortalResource({
		id,
		type: "awtsmoos.portal-collection",
		title,
		data: {
			items,
			count: items.length
		},
		capabilities: {
			read: true,
			pagination: false
		},
		meta: {
			bounded: true,
			readOnly: true
		}
	});
}

/**
 * @description Read-only coordinator joining Portal registry semantics to current authoritative domain adapters.
 */
class PortalReadService {
	/**
	 * @description Creates a read service with a deterministic built-in type registry.
	 * @param {PortalTypeRegistry} [registry] - Optional injected registry used for tests or future composition.
	 */
	constructor(registry = new PortalTypeRegistry(PORTAL_BUILTIN_TYPES)) {
		this.registry = registry;
	}

	/** @description Returns the current Portal capability root. @returns {Object} Root resource. */
	getRoot() {
		return createPortalCapabilityRoot(this.registry);
	}

	/** @description Lists every registered type as typed resources. @returns {Object} Type collection resource. */
	listTypes() {
		const items = this.registry.list().map((definition) => normalizePortalResource({
			id: definition.type,
			type: "awtsmoos.portal-type",
			title: definition.label,
			data: definition,
			links: {
				self: `/api/portal/type?type=${encodeURIComponent(definition.type)}`
			}
		}));

		return createPortalCollection("portal-types", "Portal resource types", items);
	}

	/**
	 * @description Reads one registered type definition as a resource.
	 * @param {string} type - Namespaced Portal resource type.
	 * @returns {Object|null} Type resource or null when unknown.
	 */
	getType(type) {
		const definition = this.registry.get(type);
		return definition ? normalizePortalResource({
			id: definition.type,
			type: "awtsmoos.portal-type",
			title: definition.label,
			data: definition
		}) : null;
	}

	/** @description Lists real existing API families through the compatibility adapter. @returns {Object} API-family collection. */
	listApiFamilies() {
		return createPortalCollection("api-families", "API families", listApiFamilyResources());
	}

	/**
	 * @description Reads one real existing API family by its catalog key.
	 * @param {string} id - API family catalog key.
	 * @returns {Object|null} Adapted API family resource or null.
	 */
	getApiFamily(id) {
		return getApiFamilyResource(id);
	}
}

module.exports = {
	PortalReadService,
	createPortalCollection
};
