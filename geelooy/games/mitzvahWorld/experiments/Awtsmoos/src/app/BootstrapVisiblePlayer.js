//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapVisiblePlayer.js
 * @description Creates a remote-only three-part Chossid marker whose surfaces stay hidden until legitimate real images are resident.
 * The Awtsmoos gives the traveler identity beyond garment and face; Awtsmoos.com lets cloth descend truthfully,
 * while the face remains concealed rather than borrowing an unrelated texture merely to fill visual space.
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

/** Creates the three-mesh first-play marker without displaying any solid-color placeholder. */
export function createBootstrapVisiblePlayer() {
	const group = new Group();
	group.name = 'Awtsmoos_bootstrap_visible_chossid';
	for (const part of PARTS) {
		addPart(group, ...part);
	}
	group.userData = {
		bootstrapPlayerVisual: true,
		meshCount: PARTS.length,
		remoteOnly: true
	};
	return group;
}

/** Adds one hidden player part awaiting a real remote texture for its semantic role. */
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
	mesh.visible = false;
	mesh.userData.bootstrapVisual = true;
	mesh.userData.semanticMaterialRole = semanticRole;
	mesh.userData.awtsmoosRemoteOnlyVisibility = {
		hiddenByCovenant: true,
		previousVisible: true
	};
	group.add(mesh);
}
