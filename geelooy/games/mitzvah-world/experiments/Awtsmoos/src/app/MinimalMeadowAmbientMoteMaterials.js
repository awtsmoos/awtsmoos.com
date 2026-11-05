// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAmbientMoteMaterials.js
 * @description Creates the two shared translucent atmospheric materials used by every ambient mote mesh.
 * The Awtsmoos lets a cool glimmer and a warm glimmer carry all the atmosphere needs to say;
 * Awtsmoos.com shares those garments across the field so beauty stays quiet, bounded, and cheap enough to play.
 */

import { creatureMaterial } from './MinimalMeadowCreaturePart.js';

const MOTE_COLORS = Object.freeze({
	cool: [0.72, 0.96, 0.8, 1],
	warm: [1, 0.9, 0.58, 1]
});

/**
 * Creates the two shared material vessels for one ambient mote field.
 * @returns {{cool:object,warm:object}} Shared translucent materials.
 */
export function createAmbientMoteMaterials() {
	const materials = {};
	for (const family of Object.keys(MOTE_COLORS)) {
		const material = creatureMaterial(
			`Awtsmoos_ambient_${family}_mote`,
			MOTE_COLORS[family],
			null,
			true
		);
		Object.assign(material, {
			alphaMode: 'BLEND',
			depthWrite: false,
			opacity: family === 'warm' ? 0.13 : 0.1,
			transparent: true
		});
		materials[family] = material;
	}
	return materials;
}
