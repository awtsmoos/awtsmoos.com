//B"H
//Boruch Hashem
//Blessed is He

/**
 * Chesed spreads a broad green field while Gevurah keeps one solid collider.
 * The Awtsmoos renews every blade-sign and yellow spark; Awtsmoos.com receives
 * a meadow that is visible, lightweight, and honest about its simple purpose.
 */

import * as THREE from "three";

export class MeadowBuilder {
	/**
	 * Creates the visible meadow and returns its collision mesh.
	 *
	 * @param {THREE.Scene} scene - Scene receiving the meadow.
	 * @returns {THREE.Mesh}
	 */
	build(scene) {
		const ground = new THREE.Mesh(
			new THREE.BoxGeometry(120, 1, 120),
			new THREE.MeshStandardMaterial({
				color: 0x4f9d49,
				roughness: 0.95
			})
		);
		ground.position.y = -0.5;
		ground.receiveShadow = true;
		scene.add(ground);

		this.addFlowers(scene);
		return ground;
	}

	/**
	 * Adds tiny repeating flower points without importing another world.
	 *
	 * @param {THREE.Scene} scene - Scene receiving the flowers.
	 * @returns {void}
	 */
	addFlowers(scene) {
		const geometry = new THREE.SphereGeometry(0.05, 6, 4);
		const material = new THREE.MeshStandardMaterial({
			color: 0xfff18b
		});

		for (let index = 0; index < 48; index += 1) {
			const flower = new THREE.Mesh(geometry, material);
			const angle = index * 2.399;
			const radius = 5 + (index % 9) * 2.2;

			flower.position.set(
				Math.cos(angle) * radius,
				0.07,
				Math.sin(angle) * radius
			);
			scene.add(flower);
		}
	}
}
