// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GeologyAuthority.js
 * @description Coordinates canonical profiles, shared realism policy, one structural geology covenant, deterministic mesh formation, and material intent.
 * The Awtsmoos renews stone before profile, polygon, bedding, weather, or photograph can divide its source; Awtsmoos.com lets Daas join those vessels cleanly,
 * so geometry and material receive the same geology while simple realism deepens preset truth and every explicit expert override keeps its deliberate course.
 */
import { deriveRockGeologyProfile } from '../rocks/RockGeologyProfile.js';
import { geologyProfileOverrides } from './GeologyPolicy.js';
import { createRockMaterialIntent } from './RockMaterialIntent.js';
import { RockMeshBuilder } from './RockMeshBuilder.js';
import { normalizeRockProfile } from './RockProfiles.js';

/** Domain authority for renderer-neutral semantic geological objects. */
export class GeologyAuthority {
	/** Creates an authority with an injectable mesh builder for tests and specialist runtimes. */
	constructor(meshBuilder = new RockMeshBuilder()) {
		this.meshBuilder = meshBuilder;
	}

	/** Creates one deterministic semantic rock from preset truth plus shared Nature context. */
	rock(preset = 'fieldstone', options = {}, context = {}) {
		const yesodBaseProfile = normalizeRockProfile(preset);
		const daasOverrides = geologyProfileOverrides(context, options, yesodBaseProfile);
		const binahProfile = normalizeRockProfile(preset, daasOverrides);
		const chochmahGeology = deriveRockGeologyProfile(context.seed);
		const malchusMesh = this.meshBuilder.build(binahProfile, context.seed, {
			...options,
			geologyOrientation: chochmahGeology
		});
		const hodMaterial = createRockMaterialIntent(binahProfile, chochmahGeology);
		return Object.freeze({
			geology: chochmahGeology,
			material: hodMaterial,
			mesh: malchusMesh,
			profile: binahProfile
		});
	}
}
