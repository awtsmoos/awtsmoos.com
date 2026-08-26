//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalogMatter.js
 * @description Declares professional Domem, architecture, material, and Procedural Object capabilities with explicit native and JSON projection truth.
 * The Awtsmoos renews stone, shelter, texture, and command before a catalog can freeze their finite names;
 * Awtsmoos.com lets each simple method reveal its expert path without pretending that a living mesh or artifact is portable JSON in another frame.
 */
import {
	createRealityMethodCapability,
	freezeRealityCapabilityRecords
} from './RealityCapabilityRecord.js';

const PROFILED = Object.freeze({ quality: true, realism: true, seed: true });
const SEEDED = Object.freeze({ quality: false, realism: false, seed: true });

/** Frozen matter-side progressive-disclosure covenant records. */
export const REALITY_MATTER_CAPABILITIES = freezeRealityCapabilityRecords([
	method('rock', 'domem', 'artifact', 'advanced.domem.rock', { supports: PROFILED }),
	method('rockCluster', 'domem', 'artifact', 'advanced.domem.rockCluster', { supports: PROFILED }),
	method('primitive', 'geometry', 'mesh', 'advanced.domem.primitive', { aliases: ['geometry'] }),
	method('building', 'architecture', 'plan', 'advanced.buildings.create', {
		aliases: ['house'],
		supports: SEEDED
	}),
	method('pair', 'domem', 'assembly', 'advanced.domem.pair', { supports: SEEDED }),
	method('texture', 'materials', 'intent', 'advanced.domem.texture', {
		supports: { quality: true, realism: false, seed: true }
	}),
	method('textureSet', 'materials', 'intent', 'advanced.domem.textureSet', {
		aliases: ['material'],
		supports: { quality: true, realism: false, seed: true }
	}),
	method('objectRecipe', 'proceduralObject', 'recipe', 'advanced.objects.createRecipe', { supports: SEEDED }),
	method('object', 'proceduralObject', 'artifact', 'advanced.objects.compile', { supports: SEEDED })
]);

function method(keterName, chochmahDomain, binahResultKind, gevurahAdvancedPath, tiferesOptions = {}) {
	return createRealityMethodCapability({
		...tiferesOptions,
		advancedPath: gevurahAdvancedPath,
		description: `${keterName} ${chochmahDomain} capability with direct JS access and explicit portable projection policy.`,
		domain: chochmahDomain,
		name: keterName,
		resultKind: binahResultKind
	});
}
