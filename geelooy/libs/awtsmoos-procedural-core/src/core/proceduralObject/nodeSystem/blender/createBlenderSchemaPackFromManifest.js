// B"H
// Boruch Hashem
// Blessed is He
/** One Blender manifest unfolds into universal nodes and modifier declarations. */

import { createNodeSchemaPack } from "../createNodeSchemaPack.js";
import { createBlenderModifierDefinitionFromManifest } from "./createBlenderModifierDefinitionFromManifest.js";
import { createBlenderNodeDefinitionFromManifest } from "./createBlenderNodeDefinitionFromManifest.js";
import { createBlenderSchemaManifest } from "./createBlenderSchemaManifest.js";
import { normalizeBlenderIdentifier } from "./normalizeBlenderIdentifier.js";

export function createBlenderSchemaPackFromManifest(input) {
	const manifest = createBlenderSchemaManifest(input);
	const definitions = manifest.treeTypes.flatMap(tree => tree.nodes.map(node => (
		createBlenderNodeDefinitionFromManifest(node, {
			treeType: tree.nativeType,
			blenderVersion: manifest.blenderVersion
		})
	)));
	const nodeSchemaPack = createNodeSchemaPack({
		name: `blender-${normalizeBlenderIdentifier(manifest.blenderVersion)}`,
		version: manifest.blenderVersion,
		family: "blender",
		definitions,
		metadata: {
			manifestHash: manifest.contentHash,
			buildHash: manifest.buildHash,
			treeTypes: manifest.treeTypes.map(tree => tree.nativeType),
			interfaces: manifest.interfaces,
			zones: manifest.zones,
			aliases: manifest.aliases,
			diagnostics: manifest.diagnostics
		}
	});
	const modifierDefinitions = Object.freeze(manifest.modifiers.map(modifier => (
		createBlenderModifierDefinitionFromManifest(modifier, {
			blenderVersion: manifest.blenderVersion
		})
	)));
	return Object.freeze({
		schema: "awtsmoos.blender-schema-pack",
		manifest,
		nodeSchemaPack,
		modifierDefinitions,
		interfaces: manifest.interfaces,
		zones: manifest.zones,
		aliases: manifest.aliases,
		diagnostics: manifest.diagnostics
	});
}
