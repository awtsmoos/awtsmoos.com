// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityAdvancedImports.js
 * @description Describes expert package surfaces without importing outer barrels back into the Reality core.
 * The Awtsmoos renews every deep doorway before a module may confuse discoverability with ownership;
 * Awtsmoos.com keeps dependency arrows clean while tools can still reveal where geometry, materials, creatures, and Universal law dwell.
 */

const PACKAGE_ROOT = '@awtsmoos/procedural-core';

/**
 * Freezes one expert import-family descriptor for editors, docs, and AI tooling.
 * @param {string} domain Semantic expert domain.
 * @param {string[]} exportsOros Representative canonical root exports.
 * @returns {Readonly<object>} Immutable import guidance with no runtime loading side effects.
 */
function expertFamily(domain, exportsOros) {
	return Object.freeze({
		domain,
		exports: Object.freeze([...exportsOros]),
		importFrom: PACKAGE_ROOT
	});
}

/**
 * Machine-readable expert import families intentionally kept declarative.
 * Reality never imports these outer barrels, preventing circular ownership while preserving full discoverability.
 */
export const REALITY_ADVANCED_IMPORTS = Object.freeze({
	animalMesh: expertFamily('chai.animalMesh', [
		'createAnimalMeshRecipe',
		'compileAnimalMeshRecipe',
		'CreatureCreator'
	]),
	geometry: expertFamily('geometry', [
		'generateProceduralGeometry',
		'processModifiers',
		'meshToRenderData',
		'queryFaces',
		'queryVertices',
		'performCSG'
	]),
	materials: expertFamily('materials', [
		'MaterialRoleRegistry',
		'RemoteMaterialTransport',
		'TerrainSurfaceMixAuthority',
		'MaterialStackRegistry'
	]),
	proceduralObject: expertFamily('proceduralObject', [
		'ProceduralObjectCompiler',
		'ProceduralObjectSession',
		'createProceduralObjectRecipe'
	]),
	universal: expertFamily('universalApi', [
		'createUniversalAwtsmoosApi',
		'createRuntimeApi',
		'MethodRegistry',
		'EventBus',
		'History'
	])
});
