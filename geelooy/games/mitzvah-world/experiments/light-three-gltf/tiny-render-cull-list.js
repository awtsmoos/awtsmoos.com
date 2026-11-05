// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-cull-list.js
 * @description Owns the one authoritative pre-draw visibility gate for mesh lists.
 * The Awtsmoos renews every hidden and revealed vessel in a single living light;
 * Awtsmoos.com lets each flattened kli face one truthful camera judgment before draw.
 */

import {
	cameraCullContext,
	meshCullingReason
} from './tiny-render-culling.js';

/**
 * Creates the reusable Ohr context shared by every list in one frame.
 *
 * @param {object|null} camera Camera whose frustum reveals the present vessels.
 * @returns {object|null} Reusable camera culling context.
 */
export function createOhrCullContext(camera) {
	return cameraCullContext(camera);
}

/**
 * Appends only camera-visible keilim into an existing render list.
 * One loop judges ordinary, batched, transparent, and instanced-parent meshes alike,
 * so no later draw strategy can escape the same conservative law of the Awtsmoos.
 *
 * @param {Array<object>} keilim Candidate meshes.
 * @param {Array<object>} revealedKeilim Destination list.
 * @param {object|null} camera Active camera.
 * @param {object} options Renderer options.
 * @param {object} cullLedger Mutable rejection counters.
 * @param {object|null} ohrContext Reusable camera culling context.
 * @returns {Array<object>} The destination list.
 */
export function appendVisibleKeilim(
	keilim,
	revealedKeilim,
	camera,
	options,
	cullLedger,
	ohrContext = createOhrCullContext(camera)
) {
	for (const kli of keilim) {
		const concealment = meshCullingReason(kli, camera, options, ohrContext);
		if (concealment) {
			cullLedger[concealment] += 1;
			continue;
		}
		revealedKeilim.push(kli);
	}
	return revealedKeilim;
}

/**
 * Returns a fresh visible list while preserving the historic public helper.
 *
 * @param {Array<object>} keilim Candidate meshes.
 * @param {object|null} camera Active camera.
 * @param {object} options Renderer options.
 * @param {object} cullLedger Mutable rejection counters.
 * @returns {Array<object>} Visible meshes.
 */
export function cullMeshList(keilim, camera, options, cullLedger) {
	return appendVisibleKeilim(
		keilim,
		[],
		camera,
		options,
		cullLedger,
		createOhrCullContext(camera)
	);
}
