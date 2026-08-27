// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

export const BUILTIN_DOMAIN_PROFILES = Object.freeze([
	{
		id: "generic",
		label: "Generic object",
		semanticAttributes: ["position", "normal", "uv", "color"],
		recommendedOperations: ["create_indexed_geometry", "transform_geometry"]
	},
	{
		id: "animal",
		label: "Anatomical creature",
		semanticAttributes: ["position", "normal", "uv", "skinIndex", "skinWeight"],
		recommendedOperations: ["loft_sections", "mirror_geometry", "create_armature"]
	},
	{
		id: "architecture",
		label: "Architecture and interiors",
		semanticAttributes: ["position", "normal", "uv", "materialRegion"],
		recommendedOperations: ["extrude_profile", "boolean_difference", "bevel_geometry"]
	},
	{
		id: "terrain",
		label: "Terrain and landscapes",
		semanticAttributes: ["position", "normal", "uv", "biome", "splatWeights"],
		recommendedOperations: ["create_plane", "set_attribute", "voxel_remesh"]
	},
	{
		id: "product",
		label: "Manufactured product",
		semanticAttributes: ["position", "normal", "uv", "tangent"],
		recommendedOperations: ["revolve_profile", "bevel_geometry", "subdivide_surface"]
	},
	{
		id: "effects",
		label: "Procedural effects",
		semanticAttributes: ["position", "velocity", "age", "custom"],
		recommendedOperations: ["create_indexed_geometry", "simulate_particles"]
	}
]);
