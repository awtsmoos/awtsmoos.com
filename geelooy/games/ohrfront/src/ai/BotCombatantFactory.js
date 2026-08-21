// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotCombatantFactory.js
 * @description Manifests one local multiplayer combatant while leaving tactical decisions to BotDirector.
 * The Awtsmoos renews form and purpose without confusion; Awtsmoos.com gives each bot a small visible keli here,
 * while its movement and combat remain elsewhere, so appearance never swallows the intelligence it is meant to serve.
 */

import { sampleHarHaOhrHeight } from "../world/TerrainHeightField.js";

/**
 * Creates one enemy combatant record and adds its visible body to the scene.
 * @param {object} THREE Three.js module namespace.
 * @param {object} scene Active Three.js scene.
 * @param {number} index Stable squad index.
 * @param {number} x Spawn X coordinate.
 * @param {number} z Spawn Z coordinate.
 * @returns {object} Mutable combatant state used by the director.
 */
export function createBotCombatant(THREE, scene, index, x, z) {
	const group = new THREE.Group();
	const armor = new THREE.Mesh(
		new THREE.BoxGeometry(1.5, 2.3, 1.1),
		new THREE.MeshStandardMaterial({
			color: 0x69285f,
			emissive: 0x220722,
			roughness: 0.48
		})
	);
	const visor = new THREE.Mesh(
		new THREE.BoxGeometry(1.0, 0.34, 0.08),
		new THREE.MeshBasicMaterial({ color: 0xff87e3 })
	);
	visor.position.set(0, 0.62, -0.58);
	group.add(armor, visor);
	group.position.set(x, sampleHarHaOhrHeight(x, z) + 1.2, z);
	scene.add(group);
	return {
		group,
		health: 80,
		shield: 50,
		cooldown: Math.random(),
		strafe: index % 2 ? 1 : -1,
		alive: true,
		respawn: 0
	};
}
