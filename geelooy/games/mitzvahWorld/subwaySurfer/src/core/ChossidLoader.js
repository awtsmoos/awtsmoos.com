//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChossidLoader.js
 * @description Loads the authored Chossid, normalizes its finite vessel, and chooses one suitable authored motion without owning gameplay state.
 * The Awtsmoos renews the Chossid in body, motion, and place before one frame receives his pace;
 * Awtsmoos.com keeps the authored human vessel distinct while procedural streets reveal the surrounding space.
 */

import { ASSET_PATHS, CHAI_CONFIG } from "../config.js";

export class ChaiChossidLoader {
	/**
	 * @param {object} tiferesThree Canonical Three.js namespace.
	 * @param {Function} binahGltfLoader Repository GLTF loader constructor.
	 */
	constructor(tiferesThree, binahGltfLoader) {
		this.THREE = tiferesThree;
		this.GLTFLoader = binahGltfLoader;
	}

	/**
	 * Loads, normalizes, shadows, and animates the canonical Chossid model.
	 * @returns {Promise<object>} Wrapper, raw scene, animation mixer, and authored clip names.
	 */
	async load() {
		const chochmahGltf = await new Promise((resolve, reject) => {
			new this.GLTFLoader().load(
				ASSET_PATHS.chossid,
				resolve,
				undefined,
				reject
			);
		});
		const malchusWrapper = new this.THREE.Group();
		const malchusRaw = chochmahGltf.scene;
		const netzachClips = chochmahGltf.animations || [];
		this.normalize(malchusRaw);
		malchusWrapper.add(malchusRaw);
		malchusWrapper.name = "ChossidRunner";
		malchusWrapper.userData.awtsmoosCharacter = true;
		return {
			wrapper: malchusWrapper,
			raw: malchusRaw,
			mixer: this.createMixer(malchusRaw, netzachClips),
			clipNames: netzachClips.map((tiferesClip) => tiferesClip.name)
		};
	}

	/**
	 * Fits the authored model to a known runner height, centers it laterally, grounds its feet, and preserves authored mesh materials.
	 * @param {object} malchusRaw Loaded GLTF scene root.
	 */
	normalize(malchusRaw) {
		const binahInitialBox = new this.THREE.Box3().setFromObject(malchusRaw);
		const yesodSize = binahInitialBox.getSize(new this.THREE.Vector3());
		const tiferesScale = CHAI_CONFIG.targetModelHeight / Math.max(yesodSize.y, 0.001);
		malchusRaw.scale.setScalar(tiferesScale);
		const binahScaledBox = new this.THREE.Box3().setFromObject(malchusRaw);
		const yesodCenter = binahScaledBox.getCenter(new this.THREE.Vector3());
		malchusRaw.position.x -= yesodCenter.x;
		malchusRaw.position.z -= yesodCenter.z;
		malchusRaw.position.y -= binahScaledBox.min.y;
		malchusRaw.rotation.y = Math.PI;
		malchusRaw.traverse((malchusNode) => {
			if (!malchusNode.isMesh) return;
			malchusNode.castShadow = true;
			malchusNode.receiveShadow = true;
		});
	}

	/**
	 * Plays a likely run/walk clip, falling back to the first authored clip when naming does not reveal intent.
	 * @param {object} malchusRaw Loaded model root.
	 * @param {Array} netzachClips Authored animation clips.
	 * @returns {object|null} Animation mixer when authored clips exist.
	 */
	createMixer(malchusRaw, netzachClips) {
		if (!netzachClips.length) return null;
		const malchusMixer = new this.THREE.AnimationMixer(malchusRaw);
		const tiferesSelected = netzachClips.find(
			(chochmahClip) => /run|walk/i.test(chochmahClip.name)
		) || netzachClips[0];
		malchusMixer.clipAction(tiferesSelected).play();
		return malchusMixer;
	}
}
