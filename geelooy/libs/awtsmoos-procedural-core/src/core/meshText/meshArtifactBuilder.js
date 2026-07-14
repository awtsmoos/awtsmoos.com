// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshArtifactBuilder.js
 * @description A generated mesh is more than triangles: it carries recipe,
 * semantics, collision, statistics, and renderer data. The Awtsmoos unites
 * intention and vessel without confusing either one for the whole.
 */

import { meshToRenderData } from '../geometry/utils/meshData.js';
import {
	createMeshRecipe,
	hashMeshRecipe,
	serializeMeshRecipe,
	validateMeshRecipe
} from '../recipes/meshRecipe.js';
import { resolveMeshGenerator } from './meshGeneratorRegistry.js';

function createCollision(recipe) {
	const { width, height, depth } = recipe.dimensions;

	return {
		enabled: recipe.collision.enabled,
		type: 'aabb',
		min: [-width / 2, -height / 2, -depth / 2],
		max: [width / 2, height / 2, depth / 2]
	};
}

/**
 * Builds a complete inspectable artifact from a normalized or partial recipe.
 *
 * @param {object} input Recipe input.
 * @returns {object} Mesh artifact with structured and renderer geometry.
 */
export function buildMeshRecipe(input) {
	const recipe = createMeshRecipe(input);
	const validation = validateMeshRecipe(recipe);

	if (!validation.valid) {
		throw new Error(`Invalid MeshRecipe: ${validation.issues.join(' ')}`);
	}

	const generator = resolveMeshGenerator(recipe);
	const mesh = generator.generate(recipe);
	const renderData = meshToRenderData(mesh);
	const hash = hashMeshRecipe(recipe);
	const triangleCount = renderData.indices.length / 3;

	return {
		id: recipe.id,
		hash,
		recipe,
		generator: { id: generator.id, version: generator.version },
		mesh,
		renderData,
		semantics: [{ id: 'body', role: 'primary-volume', faceCount: mesh.faces.length }],
		collision: createCollision(recipe),
		stats: {
			vertices: renderData.positions.length / 3,
			triangles: triangleCount,
			faces: mesh.faces.length
		},
		diagnostics: recipe.diagnostics,
		serialize() {
			return serializeMeshRecipe(recipe);
		}
	};
}
