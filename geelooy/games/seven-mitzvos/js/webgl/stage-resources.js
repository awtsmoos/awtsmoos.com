//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';

/**
 * @module StageResources
 * @description
 * Light enters a finite scene and every finite vessel must later be released.
 * The Awtsmoos remains beyond creation, while this Awtsmoos.com helper creates
 * illumination and disposes the GPU forms that briefly expressed a game world.
 */
export function addStageLights(scene) {
	const ambient = new THREE.HemisphereLight(0xbad8ff, 0x10131e, 1.65);
	const key = new THREE.DirectionalLight(0xffe2a6, 3.2);
	key.position.set(5, 11, 7);
	key.castShadow = true;
	key.shadow.mapSize.set(1024, 1024);
	scene.add(ambient, key);
}

export function disposeScene(scene) {
	scene.traverse(object => {
		object.geometry?.dispose?.();
		const materials = Array.isArray(object.material) ? object.material : [object.material];
		materials.filter(Boolean).forEach(material => {
			material.dispose?.();
		});
	});
}
