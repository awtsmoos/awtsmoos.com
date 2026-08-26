//B"H
// Boruch Hashem
// Blessed is He

import { defineOperation } from "./OperationDescriptor.js";

/**
 * Discovery and profile operation data for search, identity, and graph evidence.
 *
 * Chochmah flashes paths and Binah names their vessels; the Awtsmoos renews seeker,
 * profile, and relation together, while Awtsmoos.com records exact input shapes as
 * declarative truth instead of burying them inside another procedural switch.
 *
 * @module DiscoveryProfileOperations
 */
export const discoveryProfileOperations = Object.freeze([
	defineOperation({ key: "search", groups: ["search"], mode: "read", label: "Search social", argumentMode: "object", contextMap: { aliases: "alias", q: "query" } }),
	defineOperation({ key: "discover", groups: ["search", "discover"], mode: "read", label: "Discover spaces", apiMethod: "discoverHeichelos", argumentMode: "object", contextMap: { q: "query" } }),
	defineOperation({ key: "recommendations", groups: ["discover"], mode: "read", label: "Recommendations", argumentMode: "field", argumentKey: "alias", contextMap: { alias: "alias" }, requirements: ["alias"] }),
	defineOperation({ key: "profile", groups: ["profile"], mode: "read", label: "Profile", argumentMode: "field", argumentKey: "alias", contextMap: { alias: "alias" }, requirements: ["alias"] }),
	defineOperation({ key: "activity", groups: ["profile"], mode: "read", label: "Profile activity", argumentMode: "field", argumentKey: "alias", contextMap: { alias: "alias" }, requirements: ["alias"] }),
	defineOperation({ key: "history", groups: ["profile"], mode: "read", label: "Profile history", argumentMode: "field", argumentKey: "alias", contextMap: { alias: "alias" }, requirements: ["alias"] }),
	defineOperation({ key: "analytics", groups: ["profile"], mode: "read", label: "Profile analytics", argumentMode: "field", argumentKey: "alias", contextMap: { alias: "alias" }, requirements: ["alias"] }),
	defineOperation({ key: "graph", groups: ["graph"], mode: "read", label: "Relationship graph", argumentMode: "field", argumentKey: "alias", contextMap: { alias: "alias" }, requirements: ["alias"] })
]);
