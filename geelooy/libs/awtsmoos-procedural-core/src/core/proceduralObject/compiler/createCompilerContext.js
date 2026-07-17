// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	createDataBlockArtifact
} from "../artifact/createDataBlockArtifact.js";
import {
	createDataLinkArtifact
} from "../artifact/createDataLinkArtifact.js";
import {
	createObjectArtifact
} from "../artifact/createObjectArtifact.js";

function keyed(values = []) {
	return Object.fromEntries(values.map((value) => [value.id, value]));
}

/**
 * Creates or incrementally seeds one compiler context.
 *
 * @param {object} recipe Recipe.
 * @param {object} options Compile options.
 * @returns {object} Mutable trusted compiler context.
 */
export function createCompilerContext(recipe, options = {}) {
	const context = {
		recipe,
		geometries: new Map(),
		objects: new Map(),
		materials: new Map(Object.entries(keyed(recipe.materials))),
		dataBlocks: new Map(
			(recipe.data_blocks || []).map((value) => [
				value.id,
				createDataBlockArtifact(value)
			])
		),
		links: (recipe.links || []).map(createDataLinkArtifact),
		armatures: new Map(),
		animations: new Map(),
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
	if (!artifact) {
		return;
	}
	const changedTargets = new Set(
		context.recipe.commands
			.filter((command) => commandIds?.includes(command.id))
			.map((command) => command.target)
	);
	for (const name of [
		"geometries",
		"objects",
		"dataBlocks",
		"armatures",
		"animations"
	]) {
		for (const [id, value] of Object.entries(artifact[name] || {})) {
			if (!changedTargets.has(id)) {
				context[name].set(id, value);
			}
		}
	}
	context.links = [...(artifact.links || [])];
}

/**
 * Removes any previous artifact category sharing a command target.
 *
 * @param {object} context Compiler context.
 * @param {string} target Stable target id.
 */
export function clearCompilerTarget(context, target) {
	for (const name of [
		"geometries",
		"objects",
		"dataBlocks",
		"armatures",
		"animations"
	]) {
		context[name].delete(target);
	}
	context.links = context.links.filter((link) => link.id !== target);
}
