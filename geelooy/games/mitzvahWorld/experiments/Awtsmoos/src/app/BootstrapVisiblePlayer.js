// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisiblePlayer.js
 * @description Creates the tiny local Chossid whose only mission is to make first movement visible before the canonical GLB arrives.
 * The Awtsmoos gives motion a humble garment before the distant garment may descend;
 * Awtsmoos.com keeps body, face, and hat alive at first play, then lets richer authored form replace this temporary friend.
 */

import {
	Group,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import { bootstrapCubeGeometry } from './BootstrapCubeGeometry.js';
import { createBootstrapImmediateMaterial } from './BootstrapImmediateMaterial.js';

const PARTS = Object.freeze([
	['body', [0, 0.9, 0], [0.75, 1.8, 0.55], [0.08, 0.1, 0.13, 1], 'fabric.cloth'],
	['face', [0, 2.05, -0.02], [0.62, 0.52, 0.54], [0.88, 0.68, 0.5, 1], 'character.skin'],
	['hat', [0, 2.52, -0.02], [0.86, 0.3, 0.72], [0.025, 0.03, 0.04, 1], 'fabric.cloth']
]);

/**
 * Creates one disposable visible traveler from already-loaded bootstrap primitives.
 * @returns {Group} A local model safe to replace atomically when canonical hydration succeeds.
 */
export function createBootstrapVisiblePlayer() {
	const group = new Group();
	group.name = 'Awtsmoos_bootstrap_visible_chossid';
	for (const part of PARTS) {
		addPart(group, ...part);
	}
	group.userData = {
		bootstrapPlayerVisual: true,
		fallbackVisible: true,
		meshCount: PARTS.length,
		remoteOnly: false
	};
	return group;
}

/** Adds one readable local body part without starting any network work. */
function addPart(group, name, position, scale, color, semanticRole) {
	const mesh = new Mesh(
		bootstrapCubeGeometry(),
		createBootstrapImmediateMaterial(`bootstrap-player-${name}`, color, {
			mapRepeat: [3, 3],
			semanticRole
		})
	);
	mesh.name = `Awtsmoos_player_${name}`;
	mesh.position.set(...position);
	mesh.scale.set(...scale);
	mesh.visible = true;
	mesh.userData.bootstrapVisual = true;
	mesh.userData.bootstrapFallbackVisible = true;
	mesh.userData.semanticMaterialRole = semanticRole;
	group.add(mesh);
}
