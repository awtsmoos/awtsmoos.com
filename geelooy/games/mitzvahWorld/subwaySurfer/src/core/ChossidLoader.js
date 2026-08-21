// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the Chossid in body, motion, and place;
 * Awtsmoos.com receives the authored vessel while procedural worlds race.
 */

import { ASSET_PATHS, CHAI_CONFIG } from "../config.js";

export class ChaiChossidLoader {
	/**
	 * @param {object} THREE Canonical Three.js namespace.
	 * @param {Function} GLTFLoader Repository GLTF loader constructor.
	 */
	constructor(THREE, GLTFLoader) {
		this.THREE = THREE;
		this.GLTFLoader = GLTFLoader;
	}

	/**
	 * Loads, normalizes, shadows, and animates the canonical Chossid model.
	 * @returns {Promise<object>} Wrapper, raw scene, animation mixer, and clip names.
	 */
	async load() {
		const gltf = await new Promise((resolve, reject) => {
			new this.GLTFLoader().load(ASSET_PATHS.chossid, resolve, undefined, reject);
		});
		const wrapper = new this.THREE.Group();
		const raw = gltf.scene;
		this.normalize(raw);
		wrapper.add(raw);
		wrapper.name = "ChossidRunner";
		wrapper.userData.awtsmoosCharacter = true;
		const mixer = this.createMixer(raw, gltf.animations || []);
		return {
			wrapper,
			raw,
			mixer,
			clipNames: (gltf.animations || []).map((clip) => clip.name)
		};
	}

	/**
	 * Fits the authored model to a known runner height and grounds its feet.
	 * @param {object} raw Loaded GLTF scene root.
	 */
	normalize(raw) {
		const THREE = this.THREE;
		const initialBox = new THREE.Box3().setFromObject(raw);
		const size = initialBox.getSize(new THREE.Vector3());
		const scale = CHAI_CONFIG.targetModelHeight / Math.max(size.y, 0.001);
		raw.scale.setScalar(scale);
		const scaledBox = new THREE.Box3().setFromObject(raw);
		const center = scaledBox.getCenter(new THREE.Vector3());
		raw.position.x -= center.x;
		raw.position.z -= center.z;
		raw.position.y -= scaledBox.min.y;
		raw.rotation.y = Math.PI;
		raw.traverse((node) => {
			if (node.isMesh) {
				node.castShadow = true;
				node.receiveShadow = true;
			}
		});
	}

	/**
	 * Plays a likely run/walk clip, falling back to the first authored clip.
	 * @param {object} raw Loaded model root.
	 * @param {Array} clips Authored animation clips.
	 * @returns {object|null} Animation mixer when clips exist.
	 */
	createMixer(raw, clips) {
		if (!clips.length) {
			return null;
		}
		const mixer = new this.THREE.AnimationMixer(raw);
		const selected = clips.find((clip) => /run|walk/i.test(clip.name)) || clips[0];
		mixer.clipAction(selected).play();
		return mixer;
	}
}
