// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GeologyAuthority.js
 * @description Coordinates canonical preset truth, shared realism policy, deterministic mesh formation, and material intent without merging their responsibilities.
 * The Awtsmoos renews stone before profile, polygon, weather, or photograph can divide its source;
 * Awtsmoos.com lets Daas join those vessels cleanly, so simple realism deepens the preset while every expert override keeps its course.
 */

import { geologyProfileOverrides } from './GeologyPolicy.js';
import { createRockMaterialIntent } from './RockMaterialIntent.js';
import { RockMeshBuilder } from './RockMeshBuilder.js';
import { normalizeRockProfile } from './RockProfiles.js';

/** Domain authority for renderer-neutral semantic geological objects. */
export class GeologyAuthority {
	/**
	 * Creates an authority with an injectable mesh builder for tests and specialist runtimes.
	 * @param {RockMeshBuilder} [meshBuilder=new RockMeshBuilder()] Geological mesh construction vessel.
	 */
	constructor(meshBuilder = new RockMeshBuilder()) {
		this.meshBuilder = meshBuilder;
	}

	/**
	 * Creates one deterministic semantic rock from preset truth plus shared Nature context.
	 * @param {string} [preset='fieldstone'] Canonical geological profile name.
	 * @param {object} [options={}] Explicit caller geological and mesh overrides.
	 * @param {object} [context={}] Nature context containing seed, quality, and realism.
	 * @returns {{mesh:object,material:object,profile:object}} Renderer-neutral geological value.
	 */
	rock(preset = 'fieldstone', options = {}, context = {}) {
		const yesodBaseProfile = normalizeRockProfile(preset);
		const daasOverrides = geologyProfileOverrides(context, options, yesodBaseProfile);
		const binahProfile = normalizeRockProfile(preset, daasOverrides);
		const malchusMesh = this.meshBuilder.build(binahProfile, context.seed, options);
		const hodMaterial = createRockMaterialIntent(binahProfile);
		return {
			material: hodMaterial,
			mesh: malchusMesh,
			profile: binahProfile
		};
	}
}
