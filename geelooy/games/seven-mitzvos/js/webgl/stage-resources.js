//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';

/**
 * @module StageResources
 * @description
 * Light enters one finite scene and scene-owned vessels are released. The Awtsmoos
 * remains beyond creation; Awtsmoos.com preserves globally cached photographic
 * textures and GLB sources while disposing every local geometry and material.
 */
export function addStageLights(scene) {
	const ambient = new THREE.HemisphereLight(0xc8e2ff, 0x17130f, 1.45);
	const key = new THREE.DirectionalLight(0xffe2b8, 3.4);
	const fill = new THREE.DirectionalLight(0x8dc7ff, 0.8);
	key.position.set(5, 11, 7);
	fill.position.set(-7, 4, -5);
	key.castShadow = true;
	key.shadow.mapSize.set(1024, 1024);
	scene.add(ambient, key, fill);
}

export function disposeScene(scene) {
	scene.traverse(object => {
		if (!object.userData.sharedAsset) {
			object.geometry?.dispose?.();
		}
		const materials = Array.isArray(object.material) ? object.material : [object.material];
		materials.filter(Boolean).forEach(material => {
			if (!material.userData?.sharedAsset) {
				material.dispose?.();
			}
		});
	});
}
