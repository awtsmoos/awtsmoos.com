// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	ANIMAL_MESH_LIMITS
} from "../constants/animalMeshContract.js";

export function validateRecipeAsset(asset, result) {
	if (!asset || typeof asset !== "object") {
		result.addError("/asset", "asset", "Asset configuration is required.");
		return;
	}
	const target = asset.target_triangle_count;
	const maximum = asset.maximum_triangle_count;
	if (!Number.isInteger(target) || target <= 0) {
		result.addError(
			"/asset/target_triangle_count",
			"triangle_target",
			"Target triangle count must be a positive integer."
		);
	}
	if (
		!Number.isInteger(maximum) ||
		maximum < target ||
		maximum > ANIMAL_MESH_LIMITS.maximumTriangleCount
	) {
		result.addError(
			"/asset/maximum_triangle_count",
			"triangle_maximum",
			"Maximum triangle count must safely contain the target."
		);
	}
}

export function validateRecipeMaterials(materials, result) {
	if (!Array.isArray(materials)) {
		result.addError("/materials", "materials", "Materials must be an array.");
		return;
	}
	const ids = new Set();
	materials.forEach((material, index) => {
		if (!material?.id || ids.has(material.id)) {
			result.addError(
				`/materials/${index}/id`,
				"material_id",
				"Material ids must be present and unique."
			);
		}
		ids.add(material?.id);
	});
}

export function validateRecipeParts(parts, result) {
	if (!Array.isArray(parts) || parts.length > ANIMAL_MESH_LIMITS.maximumParts) {
		result.addError("/parts", "parts", "Part list is missing or too large.");
		return;
	}
	const ids = new Set();
	parts.forEach((partId, index) => {
		if (typeof partId !== "string" || !partId || ids.has(partId)) {
			result.addError(
				`/parts/${index}`,
				"part_id",
				"Part ids must be non-empty and unique."
			);
		}
		ids.add(partId);
	});
}

export function validateRecipeRig(rig, result) {
	if (!rig || typeof rig !== "object" || typeof rig.enabled !== "boolean") {
		result.addError("/rig", "rig", "Rig must declare enabled state.");
		return;
	}
	const bones = rig.bones || [];
	if (!Array.isArray(bones) || bones.length > ANIMAL_MESH_LIMITS.maximumBones) {
		result.addError("/rig/bones", "bone_count", "Bone list exceeds safe bounds.");
	}
}
