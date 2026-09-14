//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapVisiblePlayer.js
 * @description Builds the tiny first-play Chossid from Core-owned hierarchy and mesh materialization.
 * MitzvahWorld owns only the semantic body-part recipe and fallback visibility contract; reusable
 * native Group and Mesh construction stays in Procedural Core so richer canonical hydration can
 * replace this temporary traveler without growing a second rendering engine in the game layer.
 */

import {
	createNativeMeshFromGeometry,
	createNativeWorldGroup
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { bootstrapCubeGeometry } from './BootstrapCubeGeometry.js';
import { createBootstrapImmediateMaterial } from './BootstrapImmediateMaterial.js';

const PARTS = Object.freeze([
	['body', [0, 0.9, 0], [0.75, 1.8, 0.55], [0.08, 0.1, 0.13, 1], 'fabric.cloth'],
	['face', [0, 2.05, -0.02], [0.62, 0.52, 0.54], [0.88, 0.68, 0.5, 1], 'character.skin'],
	['hat', [0, 2.52, -0.02], [0.86, 0.3, 0.72], [0.025, 0.03, 0.04, 1], 'fabric.cloth']
]);

/**
 * Creates one disposable visible traveler using already-loaded bootstrap primitives.
 * @returns {object} Core-owned group that can be replaced atomically by canonical hydration.
 */
export function createBootstrapVisiblePlayer() {
	const group = createNativeWorldGroup({
		name: 'Awtsmoos_bootstrap_visible_chossid'
	});
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
 * Adds one lightweight body part without starting network work.
 * @param {object} group Core-owned parent hierarchy.
 * @param {string} name Stable semantic part name.
 * @param {number[]} position Local XYZ translation.
 * @param {number[]} scale Local XYZ scale.
 * @param {number[]} color Non-visible material factor while remote imagery is pending.
 * @param {string} semanticRole Remote material role used by later hydration.
 * @returns {void}
 */
function addPart(group, name, position, scale, color, semanticRole) {
	const material = createBootstrapImmediateMaterial(`bootstrap-player-${name}`, color, {
		mapRepeat: [3, 3],
		semanticRole
	});
	const mesh = createNativeMeshFromGeometry(
		bootstrapCubeGeometry(),
		material,
		{
			name: `Awtsmoos_player_${name}`,
			userData: {
				bootstrapFallbackVisible: true,
				bootstrapVisual: true,
				semanticMaterialRole: semanticRole
			}
		}
	);
	mesh.position.set(...position);
	mesh.scale.set(...scale);
	mesh.visible = true;
	group.add(mesh);
}
