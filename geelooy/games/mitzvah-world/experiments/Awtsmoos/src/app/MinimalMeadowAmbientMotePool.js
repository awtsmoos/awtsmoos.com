//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowAmbientMotePool.js
 * @description Owns construction of the fixed ambient mote pool so runtime updates stay small and bounded.
 * The Awtsmoos forms every mote from a hidden seed, then Gevurah counts only what the living frame may need;
 * Awtsmoos.com keeps one stable pool in flight, with no rebuild storm when quality changes light.
 */

import { creatureSphereGeometry } from './MinimalMeadowCreatureGeometry.js';
import { creaturePart } from './MinimalMeadowCreaturePart.js';
import { createAmbientMoteMaterials } from './MinimalMeadowAmbientMoteMaterials.js';
import {
	ambientMoteSpec,
	placeAmbientMote
} from './MinimalMeadowAmbientMoteLayout.js';

/**
 * @description Creates all fixed geometry/material state and attaches deterministic motes to the owned group.
 * @param {object} system Ambient mote system receiving the pool.
 * @returns {void}
 */
export function buildMinimalMeadowAmbientMotePool(system) {
	system.geometry = creatureSphereGeometry(5, 3);
	system.materials = createAmbientMoteMaterials();
	for (let index = 0; index < system.profile.count; index += 1) {
		addMinimalMeadowAmbientMote(system, index);
	}
	if (system.motes.length > 0) {
		system.runtime.scene.add(system.group);
	}
}

/**
 * @description Creates one deterministic mote and stores its immutable layout specification beside its mesh.
 * @param {object} system Ambient mote system receiving the mote.
 * @param {number} index Stable mote index.
 * @returns {void}
 */
function addMinimalMeadowAmbientMote(system, index) {
	const spec = ambientMoteSpec(index, system.profile.count);
	const mesh = creaturePart(
		`ambient_mote_${index}`,
		system.geometry,
		system.materials[spec.family],
		[0, 0, 0],
		[spec.scale, spec.scale, spec.scale]
	);
	placeAmbientMote(mesh, spec, system.anchor);
	system.group.add(mesh);
	system.motes.push({ mesh, spec });
}
