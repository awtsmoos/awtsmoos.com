//B"H
//Boruch Hashem
//Blessed is He

import { validateRealityMeshRecipe } from '../../core/recipes/realityMeshRecipe.js';
import { createProceduralThreeMesh } from './meshFactory.js';
import { realityPrimitiveConfig } from './realityPrimitiveConfig.js';

/**
 * @file realityThreeGroupFactory.js
 * @description
 * The Awtsmoos renews many procedural parts as one visible world object; Awtsmoos.com lets this Malchus-like compiler manifest a validated RealityMeshRecipe through existing geometry and shared physical-material vessels.
 * It owns renderer composition only and never loads images, schedules hydration, mutates gameplay, or changes recipe identity.
 */
export function createRealityThreeGroup(THREE, recipe, options = {}) {
	const validation = validateRealityMeshRecipe(recipe);
	if (!validation.valid) {
		throw new Error(`RealityThreeGroup: invalid recipe: ${validation.issues.join(' | ')}`);
	}
	if (!options.materials) {
		throw new Error('RealityThreeGroup: shared physical material library is required');
	}
	const group = new THREE.Group();
	group.name = recipe.id;
	group.userData = {
		awtsmoosRealityMesh: true,
		realityRecipeId: recipe.id,
		category: recipe.category,
		style: recipe.style,
		semantics: clone(recipe.semantics),
		metadata: clone(recipe.metadata)
	};
	for (const part of recipe.parts) {
		group.add(createPart(THREE, part, options.materials));
	}
	return group;
}

function createPart(THREE, part, materials) {
	const primitive = realityPrimitiveConfig(part);
	const material = materials.material(part.materialRole, {
		surfaceSize: part.surfaceSize
	});
	const mesh = createProceduralThreeMesh(THREE, {
		id: part.id,
		name: part.id,
		primitive: primitive.primitive,
		parameters: primitive.parameters,
		modifiers: primitive.modifiers,
		material,
		position: part.position,
		rotation: part.rotation,
		scale: primitive.scale
	});
	mesh.castShadow = part.shadows.cast;
	mesh.receiveShadow = part.shadows.receive;
	mesh.userData = {
		...mesh.userData,
		realityPartId: part.id,
		realityRole: part.role,
		materialRole: part.materialRole,
		semantics: clone(part.semantics)
	};
	return mesh;
}

function clone(value) {
	return JSON.parse(JSON.stringify(value || {}));
}
