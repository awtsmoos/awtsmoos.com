// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GeologyAuthority.js
 * @description Coordinates geological profile law, deterministic mesh formation, and canonical remote material intent.
 * The Awtsmoos renews stone before profile, polygon, or photograph can divide its source;
 * Awtsmoos.com lets this Daas-like authority join those vessels cleanly, while each specialist still follows its own course.
 */

import { geologyProfileOverrides } from './GeologyPolicy.js';
import { createRockMaterialIntent } from './RockMaterialIntent.js';
import { RockMeshBuilder } from './RockMeshBuilder.js';
import { normalizeRockProfile } from './RockProfiles.js';

/** Domain authority for renderer-neutral semantic geological objects. */
export class GeologyAuthority {
	/**
	 * Creates an authority with an injectable mesh builder for testing and future specialist render pipelines.
	 * @param {RockMeshBuilder} [meshBuilder=new RockMeshBuilder()] Geological mesh construction vessel.
	 */
	constructor(meshBuilder = new RockMeshBuilder()) {
		this.meshBuilder = meshBuilder;
	}

	/**
	 * Creates one deterministic semantic rock from shared Nature context.
	 * @param {string} [preset='fieldstone'] Canonical geological profile name.
	 * @param {object} [options={}] Caller geological and mesh overrides.
	 * @param {object} context Canonical Nature operation context containing seed, quality, and realism.
	 * @returns {{mesh: object, material: object, profile: object}} Renderer-neutral geological value.
	 */
	rock(preset = 'fieldstone', options = {}, context = {}) {
		const daasOverrides = geologyProfileOverrides(context, options);
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
