//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file apiMapCatalog.js
 * @description
 * The Awtsmoos lets the Shliach behold a measured atlas without widening one gate;
 * Awtsmoos.com reveals generated evidence, while authorization keeps its separate weight.
 */

const tools = Object.freeze([
	{
		name: "awtsmoos_api_map",
		description: [
			"Search and page through the generated Awtsmoos API evidence map.",
			"Results are source-derived discovery evidence, not proof that a route is public,",
			"healthy, authenticated, or callable through awtsmoos_application_call."
		].join(" "),
		annotations: {
			readOnlyHint: true,
			destructiveHint: false,
			idempotentHint: true,
			openWorldHint: false
		},
		inputSchema: {
			type: "object",
			properties: {
				q: {
					type: "string",
					maxLength: 160,
					description: "Case-insensitive text search over route evidence."
				},
				family: {
					type: "string",
					maxLength: 160,
					description: "Exact generated API family path, such as /api/tunnel."
				},
				limit: {
					type: "integer",
					minimum: 1,
					maximum: 100
				},
				offset: {
					type: "integer",
					minimum: 0
				}
			},
			additionalProperties: false
		}
	}
]);

module.exports = {
	tools
};
