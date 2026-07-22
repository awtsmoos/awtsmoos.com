// B"H
// Boruch Hashem
// Blessed is He
/** Output nodes terminate surface, world, light, volume, and AOV intent. */

import { input, node } from "./nodeDefinitionHelpers.js";

export const MATERIAL_OUTPUT_NODES = Object.freeze([
	node("material.output.material", "Material Output", [input("surface", "shader.surface"), input("volume", "shader.volume"), input("displacement", "shader.displacement"), input("thickness", "distance", 0)], [], { category: "output" }),
	node("material.output.world", "World Output", [input("surface", "shader.surface"), input("volume", "shader.volume")], [], { category: "output" }),
	node("material.output.light", "Light Output", [input("surface", "shader.surface")], [], { category: "output" }),
	node("material.output.aov", "AOV Output", [input("name", "string"), input("value", "float"), input("color", "color")], [], { category: "output" }),
	node("material.output.line-style", "Line Style Output", [input("color", "color"), input("color-fac", "factor", 1), input("alpha", "float", 1), input("alpha-fac", "factor", 1), input("thickness", "float", 1), input("thickness-fac", "factor", 1)], [], { category: "output" })
]);
