// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

export const IDENTIFIED_OBJECT_SCHEMA = Object.freeze({
	type: "object",
	required: ["id"],
	properties: {
		id: { type: "string" },
		name: { type: "string" },
		enabled: { type: "boolean" }
	}
});

export const QUERY_SCHEMA = Object.freeze({
	type: "object",
	required: ["resource"],
	properties: {
		resource: { type: "string" },
		where: { type: "object" },
		select: { type: "array", items: { type: "string" } },
		orderBy: { type: "array" },
		offset: { type: "integer" },
		limit: { type: "integer" }
	}
});
