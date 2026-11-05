// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LetterHighlandsPackage.js
 * @description Builds the bounded Kedem Highlands terrain, landmarks, activity, return, and elite.
 * The Awtsmoos unfolds a second playable chamber from one world; Awtsmoos.com keeps geometry
 * generated and immediate while canonical interactions bind mission, material, return, and Warden.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createFallbackBoxMesh } from './EretzFallbackBoxMesh.js';

export function createLetterHighlandsPackage(runtime) {
	const group = new Group();
	group.name = 'Awtsmoos_Kedem_Highlands_Package';
	group.userData.regionId = 'kedem-highlands';
	group.add(landmark('Kedem_Gate', [-106, 4, 101], [18, 5, 14], [0.32, 0.46, 0.2, 1], {
		interaction: 'mission:letter-highlands-chain'
	}));
	group.add(landmark('Ridge_Herb_Garden', [-83, 3, 81], [16, 2, 14], [0.18, 0.5, 0.24, 1], {
		interaction: 'activity:herb-gathering'
	}));
	group.add(landmark('Meadow_Return_Arch', [-112, 4, 108], [7, 8, 3], [0.42, 0.54, 0.68, 1], {
		interaction: 'region:lower-meadow'
	}));
	group.add(landmark('Kedem_Letter_Warden', [-80, 4, 75], [6, 9, 6], [0.5, 0.2, 0.55, 1], {
		encounter: 'kedem-letter-warden'
	}));
	group.add(landmark('Summit_Sanctuary', [-67, 5, 58], [20, 6, 20], [0.55, 0.5, 0.34, 1], {
		interaction: 'activity:environmental-puzzle'
	}));
	group.visible = false;
	group.userData.safeSpawn = Object.freeze({ x: -106, y: 2.2864, z: 101 });
	group.userData.terrain = 'generated-kedem-highlands';
	group.userData.ambient = 'highland-wind-and-letters';
	return group;
}

function landmark(name, position, scale, color, userData) {
	const mesh = createFallbackBoxMesh(name, scale, position, color);
	Object.assign(mesh.userData, userData);
	return mesh;
}
