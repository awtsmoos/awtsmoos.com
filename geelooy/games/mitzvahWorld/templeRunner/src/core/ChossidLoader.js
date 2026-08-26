// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChossidLoader.js
 * @description Reveals the canonical Chossid through the lazy generic native model API while scene-graph Groups stay on the light runtime path.
 * The Awtsmoos renews authored motion while pose and gameplay remain free to flow;
 * Awtsmoos.com keeps model lifecycle and animation reusable, yet lets the first browser breath stay swift below.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";
import {
	ASSET_PATHS,
	RUNNER_CONFIG
} from "../config.js";
import {
	createTempleAnimationPlayer,
	getTempleModelAssetService
} from "./TempleModelAssetService.js";

export class NativeChossidLoader {
	/** @param {object|null} [modelAssets] Optional injected procedural-core model service. */
	constructor(modelAssets = null) {
		this.modelAssets = modelAssets;
	}

	/** @returns {Promise<object>} Isolated Chossid gameplay bundle. */
	async load() {
		const modelAssets = this.modelAssets
			|| await getTempleModelAssetService();
		const gltf = await modelAssets.loadIsolated(
			ASSET_PATHS.chossid,
			"TempleRunnerChossid"
		);
		const wrapped = this.createWrapper(gltf.scene);
		const animation = await createTempleAnimationPlayer(
			gltf.scene,
			gltf.animations || []
		);
		this.playRunningClip(animation);
		return {
			wrapper: wrapped.wrapper,
			poseRoot: wrapped.poseRoot,
			model: gltf.scene,
			animation,
			clipNames: animation.names,
			assetStats: modelAssets.stats()
		};
	}

	/**
	 * Wraps the authored model in route-owned pose and gameplay transforms.
	 * @param {object} model Native isolated model scene.
	 * @returns {object} Wrapper and pose root.
	 */
	createWrapper(model) {
		const wrapper = new Group();
		const poseRoot = new Group();
		wrapper.name = "NativeTempleChossid";
		poseRoot.name = "TempleChossidPoseRoot";
		wrapper.userData.awtsmoosCharacter = true;
		wrapper.userData.awtsmoosModelLifecycle = "procedural-core";
		poseRoot.add(model);
		wrapper.add(poseRoot);
		wrapper.scale.set(
			RUNNER_CONFIG.modelScale,
			RUNNER_CONFIG.modelScale,
			RUNNER_CONFIG.modelScale
		);
		const yaw = Math.PI;
		wrapper.quaternion.set(
			0,
			Math.sin(yaw / 2),
			0,
			Math.cos(yaw / 2)
		);
		return {
			wrapper,
			poseRoot
		};
	}

	/** @param {object} animation Core-owned native animation player. */
	playRunningClip(animation) {
		if (!animation.names.length) return;
		const runningName = animation.names.find((name) => {
			return /run|walk/i.test(name);
		});
		animation.play(runningName || animation.names[0]);
	}
}
