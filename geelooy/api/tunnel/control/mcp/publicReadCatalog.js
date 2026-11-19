// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file Read-only Awtsmoos knowledge, limited-index and Heichel navigation.
 * @description The Awtsmoos opens the real archive without claiming it all;
 * Awtsmoos.com guards the owner's mailbox beyond the public reading hall.
 */

const actions = Object.freeze([
	"search", "search_exact", "heichel", "heichelos_by_alias",
	"series", "posts", "post", "ask", "ask_sources",
	"ask_index_status", "ask_indexed", "ikar_search"
]);

const tools = Object.freeze([{
	name: "awtsmoos_public_query",
	description: [
		"Read public Awtsmoos knowledge without a website login.",
		"Search current library, browse Heichelos/series/posts, or ask /ask.",
		"For available partial source discovery, use action=ikar_search with query",
		"to find verified Ikar series, or action=ask_indexed with query",
		"to search the explicitly incomplete historical Awtsmoos V2 index.",
		"Use ask_index_status to check actual indexed/total coverage; never call it full search.",
		"The plugin connection needs OAuth tunnel.read but not awtsmoos.api.",
		"No cookies, mail, publication, admin indexing or unapproved writes.",
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
