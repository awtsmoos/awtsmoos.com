//B"H
//Boruch Hashem
//Blessed is He

/**
 * Binah gives the imported form measure and grounding. The Awtsmoos renews
 * every vertex, and Awtsmoos.com keeps a humble fallback ready so one missing
 * asset can never return the world to a dark and silent surface.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const MODEL_URL = new URL(
	"../assets/models/player/chossid.glb",
	import.meta.url
).href;

export class AvatarModelFactory {
	/**
	 * Loads the chossid or returns a visible fallback.
	 *
	 * @returns {Promise<{object: THREE.Object3D, mixer: THREE.AnimationMixer|null, loaded: boolean}>}
	 */
	async create() {
		try {
			const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
			this.normalize(gltf.scene);

			const mixer = gltf.animations.length > 0 ?
				new THREE.AnimationMixer(gltf.scene) :
				null;

			if (mixer) {
				mixer.clipAction(gltf.animations[0]).play();
			}

			return {
				object: gltf.scene,
				mixer,
				loaded: true
			};
		} catch (error) {
			console.warn("Using the basic avatar fallback.", error);

			return {
				object: this.createFallback(),
				mixer: null,
				loaded: false
			};
		}
	}

	/**
	 * Fits arbitrary GLB dimensions to a grounded 1.75-meter figure.
	 *
	 * @param {THREE.Object3D} model - Loaded GLB scene root.
	 * @returns {void}
	 */
	normalize(model) {
		const box = new THREE.Box3().setFromObject(model);
		const height = Math.max(
			box.getSize(new THREE.Vector3()).y,
			0.001
		);
		model.scale.setScalar(1.75 / height);

		box.setFromObject(model);
		const center = box.getCenter(new THREE.Vector3());
		model.position.x -= center.x;
		model.position.z -= center.z;
		model.position.y -= box.min.y;

		model.traverse((child) => {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
	}

	/**
	 * Creates a visible body when the external model cannot load.
	 *
	 * @returns {THREE.Group}
	 */
	createFallback() {
		const fallback = new THREE.Group();
		const coat = new THREE.Mesh(
			new THREE.CapsuleGeometry(0.32, 1.05, 5, 10),
			new THREE.MeshStandardMaterial({
				color: 0x20242a
			})
		);
		coat.position.y = 0.85;
		coat.castShadow = true;
		fallback.add(coat);

		const head = new THREE.Mesh(
			new THREE.SphereGeometry(0.22, 14, 10),
			new THREE.MeshStandardMaterial({
				color: 0xe7b98a
			})
		);
		head.position.y = 1.62;
		head.castShadow = true;
		fallback.add(head);

		return fallback;
	}
}
