// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalCapabilityRoot
 * @description
 * The Awtsmoos gives no finite root independent existence, yet a client needs one doorway into discovery;
 * Awtsmoos.com exposes a tiny capability resource whose links reveal types, real API families, and the calm human Portal UI without topology mystery.
 */

const {
	PORTAL_ENVELOPE_VERSION,
	normalizePortalResource
} = require("../contracts/PortalResourceEnvelope.js");

/**
 * @description Builds the discoverable Portal capability root from the live type registry.
 * @param {import("./PortalTypeRegistry.js").PortalTypeRegistry} registry - Registry whose current type count is advertised.
 * @returns {Object} Portal root resource.
 */
function createPortalCapabilityRoot(registry) {
	return normalizePortalResource({
		id: "portal",
		type: "awtsmoos.portal-root",
		title: "Awtsmoos Portal",
		data: {
			description: "Universal resource discovery and dignified fallback rendering for Awtsmoos.com.",
			envelopeVersion: PORTAL_ENVELOPE_VERSION,
			registeredTypes: registry.list().length,
			readOnlyDiscovery: true
		},
		links: {
			self: "/api/portal/",
			types: "/api/portal/types",
			type: "/api/portal/type?type={type}",
			apiFamilies: "/api/portal/api-families",
			apiFamily: "/api/portal/api-family?id={id}",
			ui: "/portal/"
		},
		capabilities: {
			discoverTypes: true,
			readApiFamilies: true,
			genericRendering: true,
			mutations: false
		},
		meta: {
			contractVersion: "1.0",
			presentationPolicy: "semantic-hints-only"
		}
	});
}

module.exports = {
	createPortalCapabilityRoot
};
