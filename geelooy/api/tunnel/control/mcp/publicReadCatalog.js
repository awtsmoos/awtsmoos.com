// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file Read-only Awtsmoos knowledge tools for authenticated MCP visitors.
 * @description The Awtsmoos opens public books for each searching soul;
 * Awtsmoos.com guards mail and publication behind the owner's control.
 */

const actions = Object.freeze([
	"search", "search_exact", "heichel", "heichelos_by_alias",
	"series", "posts", "post", "ask", "ask_sources"
]);

const tools = Object.freeze([{
	name: "awtsmoos_public_query",
	description: [
		"Read public Awtsmoos knowledge without a website login.",
		"Search the library, inspect Heichelos/series/posts, or ask /ask.",
		"Use action=search and query, action=heichel and heichel,",
		"action=posts and heichel+series, action=ask and question.",
		"The plugin connection itself requires OAuth tunnel.read, not awtsmoos.api.",
		"No cookies, website login, aliases, administration or indexing are allowed.",
		"For posting and mail, use the signed-in application operation catalog."
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
			action: { type: "string", enum: actions },
			query: { type: "string", minLength: 1, maxLength: 500 },
			question: { type: "string", minLength: 1, maxLength: 1000 },
			heichel: { type: "string", minLength: 1, maxLength: 100 },
			series: { type: "string", minLength: 1, maxLength: 100 },
			post: { type: "string", minLength: 1, maxLength: 100 },
			alias: { type: "string", minLength: 1, maxLength: 100 },
			corpus: { type: "string", minLength: 1, maxLength: 100 },
			limit: { type: "integer", minimum: 1, maximum: 25 },
			session: { type: "string", minLength: 1, maxLength: 80 },
			sources: {
				type: "array", maxItems: 12,
				items: { type: "string", minLength: 1, maxLength: 80 }
			}
		},
		required: ["action"],
		additionalProperties: false
	}
}]);

module.exports = { tools };
