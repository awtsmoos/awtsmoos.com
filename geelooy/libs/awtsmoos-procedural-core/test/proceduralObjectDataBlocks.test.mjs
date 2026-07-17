// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each test vessel so truth, not confidence, decides
 * whether Awtsmoos.com procedural form is ready to enter the world.
 */

import assert from "node:assert/strict";

import {
	createProceduralObjectRecipe,
	proceduralObjectCompiler
} from "../src/core/proceduralObject/index.js";

const recipe = createProceduralObjectRecipe({
	recipe_id: "data-block-graph",
	commands: [
		command(1, "graph", "create_node_graph", "shader_graph", {
			name: "Procedural Surface"
		}),
		command(2, "node_a", "create_node", "shader_graph_with_output", {
			source: "shader_graph",
			node: {
				id: "output",
				type: "surface_output"
			}
		}, ["graph"]),
		command(3, "node_b", "create_node", "shader_graph_complete", {
			source: "shader_graph_with_output",
			node: {
				id: "principled",
				type: "principled_surface"
			}
		}, ["node_a"]),
		command(4, "connect", "connect_nodes", "shader_graph_connected", {
			source: "shader_graph_complete",
			connection: {
				from: "principled.surface",
				to: "output.surface"
			}
		}, ["node_b"]),
		command(5, "world", "create_data_block", "world", {
			type: "world",
			properties: {
				strength: 0.8
			}
		}),
		command(6, "world_link", "link_data_blocks", "world_shader_link", {
			from: "shader_graph_connected",
			to: "world",
			kind: "shader"
		}, ["connect", "world"])
	]
});

const artifact = proceduralObjectCompiler.compile(recipe);
assert.equal(artifact.dataBlocks.shader_graph_connected.nodes.length, 2);
assert.equal(artifact.dataBlocks.shader_graph_connected.connections.length, 1);
assert.equal(artifact.dataBlocks.world.properties.strength, 0.8);
assert.equal(artifact.links[0].kind, "shader");
assert.equal(artifact.links[0].to, "world");

console.log('B"H | proceduralObjectDataBlocks.test passed');

function command(index, id, op, target, args, dependsOn = []) {
	return {
		index,
		id,
		op,
		target,
		depends_on: dependsOn,
		args
	};
}
