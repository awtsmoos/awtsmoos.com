// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

const IMMUTABLE_PATCH_ROOTS = [
	"/schema",
	"/schema_version",
	"/recipe_id",
	"/mode"
];

export function assertMutableAnimalMeshPatchPath(path) {
	if (typeof path !== "string" || !path.startsWith("/")) {
		throw new Error('B"H | Patch path must be a JSON pointer.');
	}
	if (
		IMMUTABLE_PATCH_ROOTS.some((root) => {
			return path === root || path.startsWith(`${root}/`);
		})
	) {
		throw new Error(`B"H | Patch path is immutable: ${path}`);
	}
}
