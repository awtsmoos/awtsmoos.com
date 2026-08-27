// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalBuiltinTypes
 * @description
 * The Awtsmoos renews the language by which the Portal describes its own language;
 * Awtsmoos.com begins with a tiny truthful vocabulary whose schemas follow real repository contracts instead of bending legacy data to a new abstraction's angle.
 */

const PORTAL_BUILTIN_TYPES = Object.freeze([
	{
		type: "awtsmoos.portal-root",
		version: "1.0",
		label: "Portal capabilities",
		description: "Discoverable root of Portal resource interoperability.",
		semanticFields: {
			title: "title",
			body: "description"
		},
		renderers: {
			detail: "portal-capability-root"
		}
	},
	{
		type: "awtsmoos.portal-type",
		version: "1.0",
		label: "Portal resource type",
		description: "Versioned definition describing one namespaced Portal resource type.",
		semanticFields: {
			title: "label",
			status: "lifecycle"
		},
		renderers: {
			card: "portal-type-card",
			detail: "portal-type-definition",
			row: "portal-type-row"
		}
	},
	{
		type: "awtsmoos.portal-collection",
		version: "1.0",
		label: "Portal collection",
		description: "Bounded collection of typed Portal resources with query and pagination metadata.",
		renderers: {
			detail: "portal-collection",
			compact: "portal-collection"
		}
	},
	{
		type: "awtsmoos.api-family",
		version: "1.0",
		label: "API family",
		description: "One existing Awtsmoos API family adapted into the universal Portal resource contract.",
		schema: {
			type: "object",
			required: ["id", "path", "description"],
			properties: {
				id: { type: "string" },
				path: { type: "string", format: "uri-reference" },
				description: { type: "string" }
			}
		},
		semanticFields: {
			title: "id",
			body: "description",
			url: "path"
		},
		capabilities: {
			read: true,
			open: true
		},
		renderers: {
			card: "portal-api-family",
			detail: "portal-api-family",
			row: "portal-api-family-row"
		}
	}
]);

module.exports = {
	PORTAL_BUILTIN_TYPES
};
