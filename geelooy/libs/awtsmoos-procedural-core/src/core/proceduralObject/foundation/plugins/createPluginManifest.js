// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives each extension a finite, inspectable vessel.
 * No executable shadow enters Awtsmoos.com through this pure declaration.
 */

import { normalizeResourceBudget } from "../budgets/index.js";
import { hashCanonicalValue, normalizeCanonicalValue } from "../canonical/index.js";
import { createOperationDefinition } from "../operations/index.js";
import {
	PLUGIN_EXECUTION_MODES,
	PLUGIN_TRUST_LEVELS,
	assertPluginChoice,
	assertPluginIdentifier,
	assertPluginVersion,
	normalizePluginIdentifiers,
	normalizePluginSignature
} from "./pluginContract.js";

function normalizeOperations(values) {
	if (!Array.isArray(values)) {
		throw new TypeError("Plugin operations must be an array.");
	}
	const operations = new Map();
	for (const value of values) {
		const definition = createOperationDefinition({
			name: value?.name,
			version: value?.version
		});
		const operation = Object.freeze({
			name: definition.name,
			version: definition.version
		});
		operations.set(`${operation.name}@${operation.version}`, operation);
	}
	return Object.freeze([...operations.values()].sort((left, right) => (
		`${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`)
	)));
}

export function createPluginManifest(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Plugin manifest input must be an object.");
	}
	const content = Object.freeze({
		schema: "awtsmoos.plugin-manifest",
		id: assertPluginIdentifier(input.id, "Plugin id"),
		version: assertPluginVersion(input.version, "Plugin version"),
		publisher: assertPluginIdentifier(input.publisher, "Plugin publisher"),
		moduleId: assertPluginIdentifier(input.moduleId, "Plugin module id"),
		title: typeof input.title === "string" ? input.title.trim() : "",
		description: typeof input.description === "string" ? input.description.trim() : "",
		executionMode: assertPluginChoice(
			input.executionMode ?? "declarative",
			PLUGIN_EXECUTION_MODES,
			"plugin execution mode"
		),
		trustLevel: assertPluginChoice(
			input.trustLevel ?? "untrusted",
			PLUGIN_TRUST_LEVELS,
			"plugin trust level"
		),
		operations: normalizeOperations(input.operations ?? []),
		capabilities: normalizePluginIdentifiers(input.capabilities ?? [], "Plugin capabilities"),
		permissions: normalizePluginIdentifiers(input.permissions ?? [], "Plugin permissions"),
		resourceBudget: normalizeResourceBudget(input.resourceBudget ?? {}),
		metadata: normalizeCanonicalValue(input.metadata ?? {})
	});
	return Object.freeze({
		...content,
		manifestHash: hashCanonicalValue(content),
		signature: normalizePluginSignature(input.signature)
	});
}
