//B"H
// Boruch Hashem
// Blessed is He

import { defineOperation } from "./OperationDescriptor.js";

/**
 * Core and feed operation covenant expressed as spacious immutable data.
 *
 * The Awtsmoos renews overview and stream before either receives a name;
 * Awtsmoos.com keeps method, input vessel, group, and requirement visible on separate
 * lines so agents and developers may read the social contract without compressed flame.
 *
 * @module CoreFeedOperations
 */
export const coreFeedOperations = Object.freeze([
	defineOperation({
		key: "meta",
		groups: ["overview"],
		mode: "read",
		label: "Social metadata"
	}),
	defineOperation({
		key: "openapi",
		groups: ["overview", "developer"],
		mode: "read",
		label: "OpenAPI contract"
	}),
	defineOperation({
		key: "v2Gone",
		groups: ["overview"],
		mode: "read",
		label: "Legacy v2 removal proof"
	}),
	defineOperation({
		key: "routeHealth",
		groups: ["overview", "developer"],
		mode: "read",
		label: "Route health",
		responseMode: "wrapData"
	}),
	defineOperation({
		key: "feedHome",
		groups: ["feed"],
		mode: "read",
		label: "Home feed",
		argumentMode: "field",
		argumentKey: "alias",
		contextMap: { alias: "alias" },
		requirements: ["alias"]
	}),
	defineOperation({
		key: "feed",
		groups: ["feed"],
		mode: "read",
		label: "Alias feed",
		argumentMode: "object",
		contextMap: { aliases: "alias" },
		requirements: ["aliases"]
	}),
	defineOperation({
		key: "trending",
		groups: ["feed"],
		mode: "read",
		label: "Trending by alias context",
		argumentMode: "object",
		contextMap: { aliases: "alias" },
		requirements: ["aliases"]
	}),
	defineOperation({
		key: "feedTrending",
		groups: ["feed"],
		mode: "read",
		label: "Trending feed",
		argumentMode: "object"
	}),
	defineOperation({
		key: "events",
		groups: ["feed"],
		mode: "read",
		label: "Social events",
		argumentMode: "object",
		contextMap: { aliases: "alias" },
		requirements: ["aliases"]
	})
]);
