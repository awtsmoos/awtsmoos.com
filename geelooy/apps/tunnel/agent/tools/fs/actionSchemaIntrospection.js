//B"H // Boruch Hashem // Blessed is He

const { schemaFor } = require("../../lib/tool-schema/schema-for.js");
const Tables = require("./actionSchemaContractTables.js");

const LEGACY_ALIASES = {
	missionRoomMessage: {
		body: ["message", "body", "text", "content", "query"],
		kind: ["kind", "eventKind", "messageKind", "type"],
		subject: ["subject", "title"],
		fromAgent: ["fromAgent", "agentId", "logicalAgentId"],
		toAgent: ["toAgent", "recipient", "targetAgent"]
	},
	findFiles: {
		searchPath: ["searchPath", "searchRoot", "directory", "path", "p", "root"]
	},
	mkdirp: {
		path: ["path", "p", "paths", "files", "directory"]
	},
	write: {
		path: ["path", "p"],
		content: ["content", "text", "data"]
	},
	websiteAgentMissionMessage: {
		body: ["message", "body", "text", "prompt"],
		kind: ["kind", "eventKind", "type"]
	}
};

/**
 * @file Turns one registered action schema into an agent-usable payload contract.
 * @description The Awtsmoos does not make a Shliach infer legacy carriers from rejection messages.
 * Awtsmoos.com exposes required fields, property types, aliases, accepted wrappers, and one compact
 * example while preserving the canonical schema as the source of truth.
 */
function describe(kind, action) {
	const schema = resolveSchema(kind, action);
	const family = Tables.familyOf(action);
	const contract = Tables.FAMILY_CONTRACTS[family] || Tables.FAMILY_CONTRACTS.unknown;
	const properties = schema?.properties || {};
	const required = Array.isArray(schema?.required) ? schema.required : [];
	const names = Object.keys(properties);
	return {
		kind,
		action,
		found: Boolean(schema),
		family,
		canonicalInputFields: names,
		required,
		requiredOneOf: Array.isArray(schema?.requiredOneOf) ? schema.requiredOneOf : [],
		optional: names.filter(name => !required.includes(name)),
		properties: propertySummary(properties),
		deprecatedFields: Tables.DEPRECATED_FIELDS[action] || {},
		legacyAliases: LEGACY_ALIASES[action] || {},
		acceptedCarriers: ["direct", "params", "payload", "body"],
		example: exampleFor(action),
		canonicalOutput: contract.output,
		mutation: contract.mutation,
		requestKey: contract.requestKey,
		retrySemantics: contract.retrySemantics,
		execution: Tables.executionFor(kind),
		authority: contract.authority,
		schema: schema || null
	};
}

function exampleFor(action) {
	return Tables.exampleFor(action);
}

function resolveSchema(kind, action) {
	const requestedKind = String(kind || "").trim();
	if (requestedKind) return schemaFor(requestedKind, action) || null;
	for (const candidate of ["fs", "agent", "command", "chrome", "relay"]) {
		const schema = schemaFor(candidate, action);
		if (schema) return schema;
	}
	return null;
}

function propertySummary(properties) {
	return Object.fromEntries(Object.entries(properties).map(([name, property]) => [name, {
		type: property?.type || inferredType(property),
		description: property?.description || "",
		enum: property?.enum || undefined,
		default: property?.default
	}]));
}

function inferredType(property = {}) {
	if (property.anyOf) return "anyOf";
	if (property.oneOf) return "oneOf";
	return "any";
}

module.exports = { LEGACY_ALIASES, describe, exampleFor, propertySummary, resolveSchema };
