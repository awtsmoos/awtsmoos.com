// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	createGeometryArtifact
} from "../artifact/createGeometryArtifact.js";
import {
	createObjectArtifact
} from "../artifact/createObjectArtifact.js";
import {
	createProceduralArtifact
} from "../artifact/createProceduralArtifact.js";

/**
 * Converts one legacy animal part into the universal geometry contract.
 *
 * @param {object} part Animal part.
 * @returns {object} Renderer-neutral geometry artifact.
 */
export function createGeometryFromAnimalPart(part) {
	const attributes = {
		position: attribute(part.positions, 3, "float32")
	};
	if (part.normals?.length) {
		attributes.normal = attribute(part.normals, 3, "float32");
	}
	if (part.uvs?.length) {
		attributes.uv = attribute(part.uvs, 2, "float32");
	}
	if (part.skinIndices?.length) {
		attributes.skinIndex = attribute(part.skinIndices, 4, "uint16");
	}
	if (part.skinWeights?.length) {
		attributes.skinWeight = attribute(part.skinWeights, 4, "float32");
	}
	return createGeometryArtifact({
		id: part.id,
		topology: "triangles",
		attributes,
		indices: part.indices?.length
			? {
				array: part.indices,
				componentType: chooseIndexType(part.positions.length / 3)
			}
			: null,
		metadata: {
			boundaries: part.boundaries || null,
			source: "animal-mesh"
		}
	});
}

/**
 * Reveals a generic procedural artifact beside the legacy animal result.
 *
 * @param {object} animalArtifact Compiled animal artifact.
 * @param {object} recipe Source recipe.
 * @returns {object} Universal artifact.
 */
export function createProceduralArtifactFromAnimalMesh(animalArtifact, recipe) {
	const geometries = {};
	const objects = {};
	for (const part of animalArtifact.parts || []) {
		geometries[part.id] = createGeometryFromAnimalPart(part);
		objects[part.id] = createObjectArtifact({
			id: part.id,
			type: "mesh",
			geometryId: part.id,
			materialIds: part.materialIds || [],
			tags: ["animal-part"],
			metadata: {
				sourceCommand: part.sourceCommand || null
			}
		});
	}
	const armatures = animalArtifact.rig?.enabled
		? {
			animal_rig: {
				id: "animal_rig",
				...animalArtifact.rig
			}
		}
		: {};
	return createProceduralArtifact({
		schema_version: recipe.schema_version,
		recipe_id: recipe.recipe_id,
		geometries,
		objects,
		rootObjectIds: Object.keys(objects),
		materials: Object.fromEntries(
			(recipe.materials || []).map((material) => [material.id, material])
		),
		armatures,
		deferredCommands: animalArtifact.deferredCommands,
		diagnostics: animalArtifact.diagnostics,
		metadata: {
			domain: "animal",
			legacySchema: animalArtifact.schema
		}
	});
}

function attribute(array, itemSize, componentType) {
	return {
		array,
		itemSize,
		componentType,
		normalized: false
	};
}

function chooseIndexType(vertexCount) {
	return vertexCount > 65535 ? "uint32" : "uint16";
}
