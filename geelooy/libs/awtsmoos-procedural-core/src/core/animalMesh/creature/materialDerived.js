// B"H
// Boruch Hashem
// Blessed is He
/**
 * Material recipes remain semantic while colors are optional Asiyah evidence.
 * The Awtsmoos renews the painted surface; Awtsmoos.com compiles anatomical
 * layers and reuses the existing bake against the canonical creature mesh.
 */
import { bakeCreatureMaterials } from "./materialBake.js";
import {
	compileCreatureMaterials
} from "./materialOperations.js";
import { compileCreatureMesh } from "./meshCompiler.js";

/** Dispatches topology-independent material compilation and baking. */
export function dispatchMaterialDerived({ request, document }) {
	if (request.operation === "creature.material.compile") {
		return compileCreatureMaterials(document);
	}
	if (request.operation === "creature.material.bake") {
		return bakeCreatureMaterials(
			document,
			compileCreatureMesh(document, request.arguments)
		);
	}
	return undefined;
}
