// B"H
// Boruch Hashem
// Blessed is He
/** Built-in Blender catalogs unfold through the same versioned manifest pipeline. */

import { createBlenderSchemaPackFromManifest } from "../createBlenderSchemaPackFromManifest.js";
import { createBlenderBuiltinSchemaManifest } from "./createBlenderBuiltinSchemaManifest.js";

export function createBlenderBuiltinSchemaPack(options = {}) {
	return createBlenderSchemaPackFromManifest(
		createBlenderBuiltinSchemaManifest(options)
	);
}
