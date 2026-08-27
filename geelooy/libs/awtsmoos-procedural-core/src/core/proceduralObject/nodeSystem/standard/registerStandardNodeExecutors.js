// B"H
// Boruch Hashem
// Blessed is He
/** Registration binds public definitions to trusted reference executors explicitly. */

import {NodeDefinitionRegistry} from "../NodeDefinitionRegistry.js";
import {UniversalNodeExecutorRegistry} from "../UniversalNodeExecutorRegistry.js";
import {createStandardNodeSchemaPack} from "./createStandardNodeSchemaPack.js";
import {STANDARD_GEOMETRY_EXECUTORS} from "./geometryNodeExecutors.js";
import {STANDARD_MATERIAL_EXECUTORS} from "./materialNodeExecutors.js";

export function createStandardNodeRegistries() {
	const pack = createStandardNodeSchemaPack();
	const definitionRegistry = new NodeDefinitionRegistry().registerPack(pack);
	const executorRegistry = new UniversalNodeExecutorRegistry();
	const executors = {...STANDARD_GEOMETRY_EXECUTORS, ...STANDARD_MATERIAL_EXECUTORS};
	for (const definition of pack.definitions) {
		const executor = executors[definition.type];
		if (!executor) throw new Error(`Missing standard executor: ${definition.type}`);
		executorRegistry.register({
			definition: {name: definition.type, version: "1.0.0"},
			executor
		});
	}
	return Object.freeze({pack, definitionRegistry, executorRegistry});
}
