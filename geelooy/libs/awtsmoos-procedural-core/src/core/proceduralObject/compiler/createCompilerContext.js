// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every compiler store from nothing at each instant, while
 * explicit maps keep renderer-neutral artifacts inspectable and incremental.
 */

import { createDataBlockArtifact } from "../artifact/createDataBlockArtifact.js";
import { createDataLinkArtifact } from "../artifact/createDataLinkArtifact.js";
import { createObjectArtifact } from "../artifact/createObjectArtifact.js";

const COMPILER_MAP_NAMES = Object.freeze([
	"geometries",
	"objects",
	"dataBlocks",
	"armatures",
	"animations",
	"topologyIdentities",
	"topologyRemaps",
	"selections"
]);

function keyed(values = []) {
	return Object.fromEntries(values.map(value => [value.id, value]));
}

/** Creates or incrementally seeds one trusted compiler context. */
export function createCompilerContext(recipe, options = {}) {
	const context = {
		recipe,
		geometries: new Map(),
		objects: new Map(),
		materials: new Map(Object.entries(keyed(recipe.materials))),
		dataBlocks: new Map((recipe.data_blocks || []).map(value => [
			value.id,
			createDataBlockArtifact(value)
		])),
		links: (recipe.links || []).map(createDataLinkArtifact),
		armatures: new Map(),
		animations: new Map(),
		topologyIdentities: new Map(),
		topologyRemaps: new Map(),
		selections: new Map(),
		deferredCommands: [],
		diagnostics: [],
		metadata: {}
	};
	seedPrevious(context, options.previousArtifact, options.commandIds);
	if (!options.previousArtifact) {
		for (const object of recipe.objects) {
			context.objects.set(object.id, createObjectArtifact(object));
		}
	}
	return context;
}

function seedPrevious(context, artifact, commandIds) {
	if (!artifact) return;
	const changedTargets = new Set(context.recipe.commands
		.filter(command => commandIds?.includes(command.id))
		.map(command => command.target));
	for (const name of COMPILER_MAP_NAMES) {
		for (const [id, value] of Object.entries(artifact[name] || {})) {
			if (!changedTargets.has(id)) context[name].set(id, value);
		}
	}
	context.links = [...(artifact.links || [])];
}

/** Removes any prior artifact category sharing one explicit command target. */
export function clearCompilerTarget(context, target) {
	for (const name of COMPILER_MAP_NAMES) context[name].delete(target);
	context.links = context.links.filter(link => link.id !== target);
}

export { COMPILER_MAP_NAMES };
