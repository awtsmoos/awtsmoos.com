// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityAdvancedImports.js
 * @description Describes expert package surfaces, now including high-level effects, without importing outer barrels back into the Reality core.
 * The Awtsmoos renews every deep doorway before a module may confuse discoverability with ownership; Awtsmoos.com keeps dependency arrows clean,
 * while editors, docs, and AI tooling can reveal where geometry, materials, creatures, effects, procedural objects, and Universal law truly dwell.
 */

const PACKAGE_ROOT = '@awtsmoos/procedural-core';

/** Freezes one expert import-family descriptor for editors, docs, and tooling. */
function expertFamily(domain, exportsOros, importFrom = PACKAGE_ROOT) {
	return Object.freeze({
		domain,
		exports: Object.freeze([...exportsOros]),
		importFrom
	});
}

/** Machine-readable expert import families intentionally kept declarative to prevent circular ownership. */
export const REALITY_ADVANCED_IMPORTS = Object.freeze({
	animalMesh: expertFamily('chai.animalMesh', [
		'createAnimalMeshRecipe',
		'compileAnimalMeshRecipe',
		'CreatureCreator'
	]),
	effects: expertFamily('effects', [
		'createParticleEffectsApi',
		'createParticleEffectRecipe',
		'createParticleEffectState',
		'createParticleForm'
	], `${PACKAGE_ROOT}/effects`),
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
