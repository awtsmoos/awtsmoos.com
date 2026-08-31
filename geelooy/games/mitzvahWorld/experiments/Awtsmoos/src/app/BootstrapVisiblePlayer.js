//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisiblePlayer.js
 * @description Creates an immediate three-part Chossid fallback that remains visible until the canonical player garment arrives.
 * The Awtsmoos reveals the traveler before remote cloth can cross the wire; Awtsmoos.com keeps body, face, and hat truthful in color,
 * so the first playable moment has a living guide while richer imagery may later rise higher.
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
 * Creates the visible first-play traveler whose simple geometry survives slow or failed remote hydration.
 * @returns {Group} A visible three-mesh fallback group that canonical hydration may later replace.
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

/**
 * Adds one visible solid-color player part as a truthful first-play fallback.
 * @param {Group} group Parent player group receiving the mesh.
 * @param {string} name Semantic part name.
 * @param {number[]} position Local XYZ position.
 * @param {number[]} scale Local XYZ scale.
 * @param {number[]} color Immediate RGBA fallback color.
 * @param {string} semanticRole Material role used by later texture hydration.
 * @returns {void}
 */
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
