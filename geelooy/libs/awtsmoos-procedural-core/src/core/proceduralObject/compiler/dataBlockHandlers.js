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

function requireDataBlock(context, id) {
	const value = context.dataBlocks.get(id);
	if (!value) {
		throw new Error(`B"H | Unknown data block: ${id}`);
	}
	return value;
}

function storeDataBlock(context, command, declaration) {
	const value = createDataBlockArtifact({
		id: command.target,
		...declaration
	});
	context.dataBlocks.set(command.target, value);
	return value;
}

/**
 * Registers extensible data-block, node-graph, and relationship operations.
 *
 * @param {ProceduralOperationRegistry} registry Trusted registry.
 * @returns {ProceduralOperationRegistry} Same registry.
 */
export function registerDataBlockHandlers(registry) {
	registry.register("create_data_block", {
		handler: (context, command) => storeDataBlock(
			context,
			command,
			command.args
		)
	});
	registry.register("clone_data_block", {
		handler: (context, command) => storeDataBlock(
			context,
			command,
			requireDataBlock(context, command.args.source)
		)
	});
	registry.register("set_data_block_property", {
		handler: (context, command) => {
			const source = requireDataBlock(context, command.args.source);
			return storeDataBlock(context, command, {
				...source,
				properties: {
					...source.properties,
					[command.args.name]: command.args.value
				}
			});
		}
	});
	registry.register("link_data_blocks", {
		handler: (context, command) => {
			const link = createDataLinkArtifact({
				id: command.target,
				...command.args
			});
			context.links.push(link);
			return link;
		}
	});
	registerNodeGraphHandlers(registry);
	return registry;
}

function registerNodeGraphHandlers(registry) {
	registry.register("create_node_graph", {
		handler: (context, command) => storeDataBlock(context, command, {
			type: "node_graph",
			...command.args
		})
	});
	registry.register("create_node", {
		handler: (context, command) => {
			const source = requireDataBlock(context, command.args.source);
			return storeDataBlock(context, command, {
				...source,
				nodes: [...source.nodes, Object.freeze({...command.args.node})]
			});
		}
	});
	registry.register("connect_nodes", {
		handler: (context, command) => {
			const source = requireDataBlock(context, command.args.source);
			return storeDataBlock(context, command, {
				...source,
				connections: [
					...source.connections,
					Object.freeze({...command.args.connection})
				]
			});
		}
	});
}
