// B"H
// Boruch Hashem
// Blessed is He
/** One versioned pack unites portable geometry and material contracts. */

import {createNodeSchemaPack} from "../createNodeSchemaPack.js";
import {STANDARD_GEOMETRY_NODE_DEFINITIONS} from "./geometryNodeDefinitions.js";
import {STANDARD_MATERIAL_NODE_DEFINITIONS} from "./materialNodeDefinitions.js";

export function createStandardNodeSchemaPack() {
	return createNodeSchemaPack({
		name: "awtsmoos.standard-nodes",
		version: "1.0.0",
		family: "universal",
		definitions: [
			...STANDARD_GEOMETRY_NODE_DEFINITIONS,
			...STANDARD_MATERIAL_NODE_DEFINITIONS
		],
		metadata: {
			rendererNeutral: true,
			geometryEquivalent: true,
			materialEquivalent: true
		}
	});
}
